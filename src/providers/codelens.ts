import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { findUnitByClassName } from '../lucid/scanner';

/**
 * Regex mirrors Parser.php: /->run\(([^,]*),?.*\)?/i
 * Captures three syntax styles:
 *   1. ClassName::class
 *   2. new ClassName(...)
 *   3. 'ClassName' or "ClassName"
 */
const RUN_REGEX = /->run\(([^,)]+)/gi;
const CLASS_KEYWORD_RE = /(\w+)::class/;
const NEW_INSTANTIATION_RE = /new\s+(\w+)/;
const STRING_RE = /['"](\w+)['"]/;

function extractClassName(capture: string): string | undefined {
    let m: RegExpMatchArray | null;
    if ((m = capture.match(CLASS_KEYWORD_RE))) { return m[1]; }
    if ((m = capture.match(NEW_INSTANTIATION_RE))) { return m[1]; }
    if ((m = capture.match(STRING_RE))) { return m[1]; }
    return undefined;
}

export class LucidCodeLensProvider implements vscode.CodeLensProvider {
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
        const showCodeLens = vscode.workspace.getConfiguration('lucid').get<boolean>('showCodeLens', true);
        if (!showCodeLens) {
            return [];
        }

        const lenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const regex = new RegExp(RUN_REGEX.source, 'gi');
            let match: RegExpExecArray | null;

            while ((match = regex.exec(line)) !== null) {
                const capture = match[1];
                const className = extractClassName(capture);
                if (!className) { continue; }

                const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
                lenses.push(
                    new vscode.CodeLens(range, {
                        title: `$(arrow-right) Go to ${className}`,
                        command: 'lucid.navigateToUnit',
                        arguments: [className],
                    })
                );
            }
        }

        return lenses;
    }
}
