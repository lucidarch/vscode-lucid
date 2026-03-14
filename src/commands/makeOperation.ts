import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { scanServices } from '../lucid/scanner';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeOperation(project: LucidProject, preselectedService?: string): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Operation',
        prompt: 'Operation name (without "Operation" suffix)',
        placeHolder: 'e.g. ProcessCheckout',
        validateInput: v => (v.trim() ? undefined : 'Operation name is required'),
    });
    if (!name) { return; }

    const args = ['make:operation', name];

    if (project.mode === 'monolith') {
        let service: string | undefined = preselectedService;
        if (!service) {
            const services = await scanServices(project);
            const serviceItems: vscode.QuickPickItem[] = [
                { label: '$(dash) None (no service)', description: 'App-level operation' },
                ...services.map(s => ({ label: s.name })),
            ];

            const pick = await vscode.window.showQuickPick(serviceItems, {
                title: 'Select Service (optional)',
                placeHolder: 'Choose a service or leave empty',
            });
            if (!pick) { return; }

            if (!pick.label.startsWith('$(dash)')) {
                service = pick.label;
            }
        }
        if (service) {
            args.push(service);
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
