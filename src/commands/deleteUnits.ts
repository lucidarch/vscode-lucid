import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { scanFeatures, scanJobs, scanOperations } from '../lucid/scanner';
import { runLucidCommand } from '../lucid/runner';

export async function deleteFeature(project: LucidProject, preselectedName?: string): Promise<void> {
    let name: string | undefined = preselectedName;
    if (!name) {
        const features = await scanFeatures(project);
        if (features.length === 0) {
            vscode.window.showInformationMessage('No features found in this project.');
            return;
        }
        const pick = await vscode.window.showQuickPick(
            features.map(f => ({ label: f.name, description: f.service })),
            { title: 'Delete Feature — select one' }
        );
        if (!pick) { return; }
        name = pick.label;
    }

    const confirm = await vscode.window.showWarningMessage(
        `Delete feature "${name}"? This cannot be undone.`,
        { modal: true },
        'Delete'
    );
    if (confirm !== 'Delete') { return; }

    await runLucidCommand(project, ['delete:feature', name]);
}

export async function deleteJob(project: LucidProject, preselectedName?: string): Promise<void> {
    let name: string | undefined = preselectedName;
    let domain: string | undefined;

    if (!name) {
        const jobs = await scanJobs(project);
        if (jobs.length === 0) {
            vscode.window.showInformationMessage('No jobs found in this project.');
            return;
        }
        const pick = await vscode.window.showQuickPick(
            jobs.map(j => ({ label: j.name, description: j.domain })),
            { title: 'Delete Job — select one' }
        );
        if (!pick) { return; }
        name = pick.label;
        domain = pick.description;
    }

    const confirm = await vscode.window.showWarningMessage(
        `Delete job "${name}"? This cannot be undone.`,
        { modal: true },
        'Delete'
    );
    if (confirm !== 'Delete') { return; }

    const args = ['delete:job', name];
    if (domain) { args.push(domain); }
    await runLucidCommand(project, args);
}

export async function deleteOperation(project: LucidProject, preselectedName?: string): Promise<void> {
    let name: string | undefined = preselectedName;
    if (!name) {
        const operations = await scanOperations(project);
        if (operations.length === 0) {
            vscode.window.showInformationMessage('No operations found in this project.');
            return;
        }
        const pick = await vscode.window.showQuickPick(
            operations.map(op => ({ label: op.name, description: op.service })),
            { title: 'Delete Operation — select one' }
        );
        if (!pick) { return; }
        name = pick.label;
    }

    const confirm = await vscode.window.showWarningMessage(
        `Delete operation "${name}"? This cannot be undone.`,
        { modal: true },
        'Delete'
    );
    if (confirm !== 'Delete') { return; }

    await runLucidCommand(project, ['delete:operation', name]);
}
