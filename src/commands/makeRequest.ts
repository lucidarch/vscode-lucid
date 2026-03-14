import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeRequest(project: LucidProject): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Request',
        prompt: 'Request name (without "Request" suffix)',
        placeHolder: 'e.g. CreateProduct',
        validateInput: v => (v.trim() ? undefined : 'Request name is required'),
    });
    if (!name) { return; }

    const result = await runLucidCommand(project, ['make:request', name]);
    if (result.code === 0) {
        const uri = parseGeneratedPath(result.stdout, project.root);
        if (uri) {
            await vscode.window.showTextDocument(uri);
        }
    }
}
