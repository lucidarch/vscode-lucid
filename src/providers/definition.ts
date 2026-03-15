import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { findUnitByClassName } from '../lucid/scanner';

// Matches the opening of a ->run( or ->serve( dispatch call.
// Does NOT require the closing paren — handles multi-line calls where the
// class name is on the same line as ->run(new ClassName( but `)` is lines later.
const DISPATCH_OPEN_RE = /->(run|serve)\s*\(/;

export class LucidDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private project: LucidProject) {}

    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Definition | undefined> {
        const wordRange = document.getWordRangeAtPosition(position, /[A-Z][A-Za-z]+/);
        if (!wordRange) { return undefined; }

        const className = document.getText(wordRange);
        const line = document.lineAt(position.line).text;

        // Only activate when the line opens a ->run() / ->serve() call and contains the class name.
        // The class name is always on the same line as ->run(new ClassName( even for multi-line calls.
        if (!DISPATCH_OPEN_RE.test(line) || !line.includes(className)) { return undefined; }

        const uri = await findUnitByClassName(this.project, className);
        if (!uri) { return undefined; }

        return new vscode.Location(uri, new vscode.Position(0, 0));
    }
}
