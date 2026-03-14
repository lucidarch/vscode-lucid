import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { runLucidCommand } from '../lucid/runner';
import { detect } from '../lucid/detector';

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

    // Build a minimal project reference for runner
    const project: LucidProject = { root: folders[0].uri, mode: 'micro' };
    const result = await runLucidCommand(project, ['init:micro']);
    if (result.code === 0) {
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
        vscode.window.showInformationMessage('Lucid Monolith project initialized.');
    }
}
