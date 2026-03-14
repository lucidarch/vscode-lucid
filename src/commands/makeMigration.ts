import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeMigration(project: LucidProject): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Migration',
        prompt: 'Migration name (snake_case)',
        placeHolder: 'e.g. create_products_table',
        validateInput: v => (v.trim() ? undefined : 'Migration name is required'),
    });
    if (!name) { return; }

    const result = await runLucidCommand(project, ['make:migration', name]);
    if (result.code === 0) {
        const uri = parseGeneratedPath(result.stdout, project.root);
        if (uri) {
            await vscode.window.showTextDocument(uri);
        }
    }
}
