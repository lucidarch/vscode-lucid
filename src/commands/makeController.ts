import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { scanServices } from '../lucid/scanner';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeController(project: LucidProject): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Controller',
        prompt: 'Controller name (without "Controller" suffix)',
        placeHolder: 'e.g. Product',
        validateInput: v => (v.trim() ? undefined : 'Controller name is required'),
    });
    if (!name) { return; }

    const args = ['make:controller', name];

    if (project.mode === 'monolith') {
        const services = await scanServices(project);
        const serviceItems: vscode.QuickPickItem[] = [
            { label: '$(dash) None', description: 'App-level controller' },
            ...services.map(s => ({ label: s.name })),
        ];
        const pick = await vscode.window.showQuickPick(serviceItems, {
            title: 'Select Service (optional)',
        });
        if (!pick) { return; }
        if (!pick.label.startsWith('$(dash)')) {
            args.push(pick.label);
        }
    }

    const result = await runLucidCommand(project, args);
    if (result.code === 0) {
        const uri = parseGeneratedPath(result.stdout, project.root);
        if (uri) {
            await vscode.window.showTextDocument(uri);
        }
    }
}
