import * as vscode from 'vscode';
import * as path from 'path';
import { LucidProject } from './types';

const RUN_REGEX = /->run\(([^,)]+)/gi;
const CLASS_KEYWORD_RE = /(\w+)::class/;
const NEW_INSTANTIATION_RE = /new\s+(\w+)/;
const STRING_RE = /['"](\w+)['"]/;
const CLASS_DECL_RE = /^class\s+(\w+)/m;

function extractClassName(capture: string): string | undefined {
    let m: RegExpMatchArray | null;
    if ((m = capture.match(CLASS_KEYWORD_RE))) { return m[1]; }
    if ((m = capture.match(NEW_INSTANTIATION_RE))) { return m[1]; }
    if ((m = capture.match(STRING_RE))) { return m[1]; }
    return undefined;
}

export interface UsageLocation {
    /** The file that calls ->run() with this class */
    uri: vscode.Uri;
    /** The caller's class name (Feature or Operation) */
    callerName: string;
    /** Zero-based line number of the ->run() call */
    line: number;
}

/**
 * Find every Feature/Operation file that calls ->run() with the given class name.
 */
export async function scanUsages(
    project: LucidProject,
    className: string
): Promise<UsageLocation[]> {
    const callerPatterns = [
        'app/Features/**/*Feature.php',
        'app/Operations/*Operation.php',
        'app/Services/*/Features/**/*Feature.php',
        'app/Services/*/Operations/*Operation.php',
    ];

    const allCallerFiles: vscode.Uri[] = [];
    for (const pattern of callerPatterns) {
        const found = await vscode.workspace.findFiles(
            new vscode.RelativePattern(project.root, pattern)
        );
        allCallerFiles.push(...found);
    }

    const usages: UsageLocation[] = [];

    await Promise.all(allCallerFiles.map(async uri => {
        let text: string;
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            text = Buffer.from(bytes).toString('utf8');
        } catch {
            return;
        }

        const lines = text.split('\n');
        const classMatch = text.match(CLASS_DECL_RE);
        const callerName = classMatch ? classMatch[1] : path.basename(uri.fsPath, '.php');

        for (let i = 0; i < lines.length; i++) {
            const regex = new RegExp(RUN_REGEX.source, 'gi');
            let match: RegExpExecArray | null;
            while ((match = regex.exec(lines[i])) !== null) {
                const found = extractClassName(match[1]);
                if (found === className) {
                    usages.push({ uri, callerName, line: i });
                }
            }
        }
    }));

    return usages.sort((a, b) => a.callerName.localeCompare(b.callerName));
}

/**
 * Returns the class name declared on a given line, if any.
 * Matches: class FooJob, class FooOperation, class FooFeature
 */
export function extractClassNameFromLine(lineText: string): string | undefined {
    const m = lineText.match(/\bclass\s+(\w+)/);
    return m ? m[1] : undefined;
}

/**
 * Find the line number of the class declaration in a PHP file.
 */
export async function findClassDeclarationLine(uri: vscode.Uri): Promise<number | undefined> {
    try {
        const bytes = await vscode.workspace.fs.readFile(uri);
        const lines = Buffer.from(bytes).toString('utf8').split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (/\bclass\s+\w+/.test(lines[i])) {
                return i;
            }
        }
    } catch {
        // ignore
    }
    return undefined;
}
