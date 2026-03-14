import * as vscode from 'vscode';
import { LucidProject, LucidMode } from './types';

/**
 * Detects whether the current workspace contains a Lucid project.
 * Mirrors the detection logic from Finder.php.
 */
export async function detect(): Promise<LucidProject | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined;
    }

    for (const folder of workspaceFolders) {
        const finderPath = vscode.Uri.joinPath(
            folder.uri,
            'vendor', 'lucidarch', 'lucid', 'src', 'Finder.php'
        );

        try {
            await vscode.workspace.fs.stat(finderPath);
            const mode = await detectMode(folder.uri);
            return { root: folder.uri, mode };
        } catch {
            // stat throws if file does not exist
        }
    }

    return undefined;
}

/**
 * Determines if the project is micro or monolith.
 * Monolith: app/Services/ exists.
 * Micro: app/Services/ does not exist.
 */
export async function detectMode(root: vscode.Uri): Promise<LucidMode> {
    const configMode = vscode.workspace.getConfiguration('lucid').get<string>('mode', 'auto');
    if (configMode === 'micro') {
        return 'micro';
    }
    if (configMode === 'monolith') {
        return 'monolith';
    }

    const servicesPath = vscode.Uri.joinPath(root, 'app', 'Services');
    try {
        const stat = await vscode.workspace.fs.stat(servicesPath);
        // vscode.FileType.Directory = 2
        if (stat.type === vscode.FileType.Directory) {
            return 'monolith';
        }
    } catch {
        // Directory does not exist → micro
    }

    return 'micro';
}

/**
 * Returns the path to the Lucid binary for the given project root.
 * Checks lucid.binaryPath setting first, then vendor/bin/lucid.
 */
export function resolveBinaryPath(root: vscode.Uri): string {
    const configured = vscode.workspace.getConfiguration('lucid').get<string>('binaryPath', '');
    if (configured) {
        return configured;
    }
    // Use POSIX path segments joined with the OS separator
    return vscode.Uri.joinPath(root, 'vendor', 'bin', 'lucid').fsPath;
}
