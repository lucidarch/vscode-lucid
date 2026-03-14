import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { scanDomains } from '../lucid/scanner';
import { runLucidCommand, parseGeneratedPath } from '../lucid/runner';

export async function makeJob(project: LucidProject, preselectedDomain?: string): Promise<void> {
    const name = await vscode.window.showInputBox({
        title: 'Lucid: Make Job',
        prompt: 'Job name (without "Job" suffix)',
        placeHolder: 'e.g. FindProduct',
        validateInput: v => (v.trim() ? undefined : 'Job name is required'),
    });
    if (!name) { return; }

    // Collect existing domains for quick pick
    const domains = await scanDomains(project);
    const domainItems: vscode.QuickPickItem[] = [
        ...domains.map(d => ({ label: d.name })),
        { label: '$(add) New domain…', description: 'Enter a new domain name' },
    ];

    let domain: string | undefined = preselectedDomain;
    if (!domain) {
        const pick = await vscode.window.showQuickPick(domainItems, {
            title: 'Select Domain',
            placeHolder: 'Choose an existing domain or create a new one',
        });
        if (!pick) { return; }

        if (pick.label.startsWith('$(add)')) {
            domain = await vscode.window.showInputBox({
                title: 'New Domain Name',
                prompt: 'Enter the domain name',
                placeHolder: 'e.g. Product',
                validateInput: v => (v.trim() ? undefined : 'Domain name is required'),
            });
        } else {
            domain = pick.label;
        }
    }
    if (!domain) { return; }

    const isQueueable = await vscode.window.showQuickPick(
        [
            { label: 'No', description: 'Standard synchronous job' },
            { label: 'Yes', description: 'Implements ShouldQueue' },
        ],
        { title: 'Make job queueable?' }
    );
    if (!isQueueable) { return; }

    const args = ['make:job', name, domain];
    if (isQueueable.label === 'Yes') {
        args.push('--queue');
    }

    const result = await runLucidCommand(project, args);
    if (result.code === 0) {
        const uri = parseGeneratedPath(result.stdout, project.root);
        if (uri) {
            await vscode.window.showTextDocument(uri);
        }
    }
}
