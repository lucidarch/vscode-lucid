import * as vscode from 'vscode';
import * as path from 'path';
import { LucidProject } from '../lucid/types';
import { runLucidCommand } from '../lucid/runner';
import { detect } from '../lucid/detector';

async function writeExtensionsJson(root: vscode.Uri): Promise<void> {
    const vscodeDir = vscode.Uri.joinPath(root, '.vscode');
    const file = vscode.Uri.joinPath(vscodeDir, 'extensions.json');

    try {
        await vscode.workspace.fs.stat(file);
        // File already exists — leave it alone
    } catch {
        const content = JSON.stringify({
            recommendations: ['lucidarch.vscode-lucid']
        }, null, 4);
        await vscode.workspace.fs.createDirectory(vscodeDir);
        await vscode.workspace.fs.writeFile(file, Buffer.from(content, 'utf8'));
    }
}

export async function initMicro(): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
        'Initialize a Lucid Micro project in the current workspace? This will create app/Data, app/Domains, app/Features, and app/Operations directories.',
        { modal: true },
        'Initialize'
    );
    if (confirm !== 'Initialize') { return; }

    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
    }

    const project: LucidProject = { root: folders[0].uri, mode: 'micro' };
    const result = await runLucidCommand(project, ['init:micro']);
    if (result.code === 0) {
        await writeExtensionsJson(folders[0].uri);
        vscode.window.showInformationMessage('Lucid Micro project initialized.');
    }
}

export async function initMonolith(): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
        'Initialize a Lucid Monolith project in the current workspace? This will scaffold the Services architecture.',
        { modal: true },
        'Initialize'
    );
    if (confirm !== 'Initialize') { return; }

    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
    }

    const project: LucidProject = { root: folders[0].uri, mode: 'monolith' };
    const result = await runLucidCommand(project, ['init:monolith']);
    if (result.code === 0) {
        await writeExtensionsJson(folders[0].uri);
        vscode.window.showInformationMessage('Lucid Monolith project initialized.');
    }
}
