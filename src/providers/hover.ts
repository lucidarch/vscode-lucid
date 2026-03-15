import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { findUnitByClassName } from '../lucid/scanner';
import { scanUsages } from '../lucid/usages';

const DISPATCH_OPEN_RE = /->(run|serve)\s*\(/;

// Strips constructor promotion visibility modifiers so only type + name remain.
const PROMOTION_MODIFIERS_RE = /\b(public|protected|private)(\s+readonly)?\s+/g;

/**
 * Extracts constructor params by counting parentheses — handles multi-line signatures.
 * Strips visibility/readonly modifiers (constructor promotion) so the result reads
 * like a plain call-site signature: `ClassName(Type $param, ...)`.
 */
function parseConstructorParams(text: string): string | undefined {
    const start = text.indexOf('__construct(');
    if (start === -1) { return undefined; }

    let depth = 1;
    let i = start + '__construct('.length;
    while (i < text.length && depth > 0) {
        if (text[i] === '(') { depth++; }
        else if (text[i] === ')') { depth--; }
        i++;
    }

    const raw = text.slice(start + '__construct('.length, i - 1);
    return raw
        .replace(PROMOTION_MODIFIERS_RE, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extracts the return type annotation from `public function handle(...): ReturnType`.
 */
function parseHandleReturnType(text: string): string | undefined {
    const m = text.match(/public\s+function\s+handle\s*\([^)]*\)\s*:\s*([^{\n]+)/);
    if (!m) { return undefined; }
    return m[1].trim();
}

export class LucidHoverProvider implements vscode.HoverProvider {
    constructor(private project: LucidProject) {}

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        const wordRange = document.getWordRangeAtPosition(position, /[A-Z][A-Za-z]+/);
        if (!wordRange) { return undefined; }

        const className = document.getText(wordRange);
        const line = document.lineAt(position.line).text;

        // Only activate when the line opens a ->run() / ->serve() call and contains the class name.
        // The class name is always on the same line as ->run(new ClassName( even for multi-line calls.
        if (!DISPATCH_OPEN_RE.test(line) || !line.includes(className)) { return undefined; }

        const uri = await findUnitByClassName(this.project, className);
        if (!uri) { return undefined; }

        let text: string;
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            text = Buffer.from(bytes).toString('utf8');
        } catch {
            return undefined;
        }

        const constructorParams = parseConstructorParams(text);
        const handleReturn = parseHandleReturnType(text);
        const usages = await scanUsages(this.project, className);

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**${className}**\n\n---\n\n`);

        if (constructorParams !== undefined) {
            md.appendCodeblock(`${className}(${constructorParams})`, 'php');
        }
        if (handleReturn) {
            md.appendCodeblock(`handle(): ${handleReturn}`, 'php');
        }

        if (usages.length === 0) {
            md.appendMarkdown('*Not used by any unit*');
        } else if (usages.length === 1) {
            md.appendMarkdown(`Used by **${usages[0].callerName}**`);
        } else {
            const names = usages.map(u => u.callerName).join(', ');
            md.appendMarkdown(`Used by **${usages.length}** units: ${names}`);
        }

        return new vscode.Hover(md, wordRange);
    }
}
