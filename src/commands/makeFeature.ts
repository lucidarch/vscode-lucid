import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { scanServices } from '../lucid/scanner';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeFeature(project: LucidProject, preselectedService?: string): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Feature',
        prompt: 'Feature name (without "Feature" suffix)',
        placeHolder: 'e.g. ListProducts',
        validateInput: v => (v.trim() ? undefined : 'Feature name is required'),
    });
    if (!name) { return; }

    const args = ['make:feature', name];

    // In monolith mode, prompt for service
    if (project.mode === 'monolith') {
        let service: string | undefined = preselectedService;
        if (!service) {
            const services = await scanServices(project);
            const serviceItems: vscode.QuickPickItem[] = [
                ...services.map(s => ({ label: s.name })),
                { label: '$(add) New service…', description: 'Enter a new service name' },
            ];

            const pick = await vscode.window.showQuickPick(serviceItems, {
                title: 'Select Service',
                placeHolder: 'Choose a service or create a new one',
            });
            if (!pick) { return; }

            if (pick.label.startsWith('$(add)')) {
                service = await vscode.window.showInputBox({
                    title: 'New Service Name',
                    prompt: 'Enter the service name',
                    placeHolder: 'e.g. Catalog',
                    validateInput: v => (v.trim() ? undefined : 'Service name is required'),
                });
            } else {
                service = pick.label;
            }
        }
        if (!service) { return; }
        args.push(service);
    }

    const result = await runLucidCommand(project, args);
    if (result.code === 0) {
        const uri = parseGeneratedPath(result.stdout, project.root);
        if (uri) {
            await vscode.window.showTextDocument(uri);
        }
    }
}
