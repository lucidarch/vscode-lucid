import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeModel(project: LucidProject): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Model',
        prompt: 'Model name',
        placeHolder: 'e.g. Product',
        validateInput: v => (v.trim() ? undefined : 'Model name is required'),
    });
    if (!name) { return; }

    const result = await runLucidCommand(project, ['make:model', name]);
    if (result.code === 0) {
        const uri = parseGeneratedPath(result.stdout, project.root);
        if (uri) {
            await vscode.window.showTextDocument(uri);
        }
    }
}
