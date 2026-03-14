import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeService(project: LucidProject): Promise<void> {
    if (project.mode !== 'monolith') {
        vscode.window.showWarningMessage('Services are only available in Monolith mode.');
        return;
    }

    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Service',
        prompt: 'Service name',
        placeHolder: 'e.g. Catalog',
        validateInput: v => (v.trim() ? undefined : 'Service name is required'),
    });
    if (!name) { return; }

    const result = await runLucidCommand(project, ['make:service', name]);
    if (result.code === 0) {
        vscode.window.showInformationMessage(`Service "${name}" created successfully.`);
    }
}
