import * as vscode from 'vscode';
import * as path from 'path';
import { LucidProject } from '../lucid/types';
import { scanUsages, extractClassNameFromLine, findClassDeclarationLine } from '../lucid/usages';
import { findUnitByClassName } from '../lucid/scanner';

/**
 * Returns true if the file path looks like a Lucid Job or Operation.
 */
function isJobOrOperation(filePath: string): boolean {
    return /\/(Jobs|Operations)\/[^/]+\.php$/.test(filePath);
}

/**
 * CodeLens provider that adds "Used by N features/operations" on the class
 * declaration line of every Job and Operation file.
 */
export class LucidUsagesCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

    constructor(private project: LucidProject) {}

    refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }

    async provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken
    ): Promise<vscode.CodeLens[]> {
        if (!isJobOrOperation(document.uri.fsPath)) {
            return [];
        }

        const lines = document.getText().split('\n');
        let classLine = -1;
        let className: string | undefined;

        for (let i = 0; i < lines.length; i++) {
            const name = extractClassNameFromLine(lines[i]);
            if (name) {
                classLine = i;
                className = name;
                break;
            }
        }

        if (classLine === -1 || !className) {
            return [];
        }

        const range = new vscode.Range(classLine, 0, classLine, lines[classLine].length);

        // Return an unresolved lens; resolve() does the heavy scan
        return [new vscode.CodeLens(range, undefined)];
    }

    async resolveCodeLens(
        lens: vscode.CodeLens,
        _token: vscode.CancellationToken
    ): Promise<vscode.CodeLens> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return lens; }

        const lines = editor.document.getText().split('\n');
        const className = extractClassNameFromLine(lines[lens.range.start.line]);
        if (!className) { return lens; }

        const usages = await scanUsages(this.project, className);

        if (usages.length === 0) {
            lens.command = {
                title: '$(circle-slash) Not used',
                command: '',
            };
        } else if (usages.length === 1) {
            lens.command = {
                title: `$(references) Used by ${usages[0].callerName}`,
                command: 'lucid.navigateToUnit',
                arguments: [usages[0].callerName],
            };
        } else {
            const callerNames = usages.map(u => u.callerName).join(', ');
            lens.command = {
                title: `$(references) Used by ${usages.length} units: ${callerNames}`,
                command: 'lucid.showUsages',
                arguments: [className, usages],
            };
        }

        return lens;
    }
}

/**
 * ReferenceProvider: powers Shift+F12 "Find All References" on a Job/Operation
 * class name — returns every ->run() call site across Features and Operations.
 */
export class LucidReferenceProvider implements vscode.ReferenceProvider {
    constructor(private project: LucidProject) {}

    async provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        _context: vscode.ReferenceContext,
        _token: vscode.CancellationToken
    ): Promise<vscode.Location[]> {
        if (!isJobOrOperation(document.uri.fsPath)) {
            return [];
        }

        const wordRange = document.getWordRangeAtPosition(position, /\w+/);
        if (!wordRange) { return []; }

        const word = document.getText(wordRange);
        // Only trigger on the class name itself (PascalCase ending in Job/Operation)
        if (!/^[A-Z]\w+(Job|Operation)$/.test(word)) { return []; }

        const usages = await scanUsages(this.project, word);

        return usages.map(u => new vscode.Location(u.uri, new vscode.Position(u.line, 0)));
    }
}
