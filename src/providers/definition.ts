import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { findUnitByClassName } from '../lucid/scanner';

// Matches ->run(...) or ->serve(...) capturing everything inside the parens
const DISPATCH_RE = /->(run|serve)\(([^)]+)\)/g;

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

        // Only activate when the word appears inside a ->run() or ->serve() call
        const dispatches = [...line.matchAll(DISPATCH_RE)];
        const isInsideDispatch = dispatches.some(m => extractClassName(m[2]) === className);
        if (!isInsideDispatch) { return undefined; }

        const uri = await findUnitByClassName(this.project, className);
        if (!uri) { return undefined; }

        return new vscode.Location(uri, new vscode.Position(0, 0));
    }
}
