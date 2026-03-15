import * as vscode from 'vscode';
import { detect } from './lucid/detector';
import { createFileWatcher, findUnitByClassName } from './lucid/scanner';
import { LucidProject } from './lucid/types';
import { UsageLocation } from './lucid/usages';
import { LucidTreeProvider } from './providers/treeView';
import { LucidCodeLensProvider } from './providers/codelens';
import { LucidUsagesCodeLensProvider, LucidReferenceProvider } from './providers/references';
import { LucidDefinitionProvider } from './providers/definition';
import { makeFeature } from './commands/makeFeature';
import { makeJob } from './commands/makeJob';
import { makeOperation } from './commands/makeOperation';
import { makeService } from './commands/makeService';
import { makeController } from './commands/makeController';
import { makeModel } from './commands/makeModel';
import { makeRequest } from './commands/makeRequest';
import { makePolicy } from './commands/makePolicy';
import { makeMigration } from './commands/makeMigration';
import { initMicro, initMonolith } from './commands/initProject';
import { deleteFeature, deleteJob, deleteOperation } from './commands/deleteUnits';
import { LucidTreeItem } from './providers/treeView';

let treeProvider: LucidTreeProvider | undefined;
let codeLensProvider: LucidCodeLensProvider | undefined;
let usagesCodeLensProvider: LucidUsagesCodeLensProvider | undefined;
let currentProject: LucidProject | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    // Detect Lucid project
    currentProject = await detect();

    await vscode.commands.executeCommand(
        'setContext',
        'lucid.isLucidProject',
        currentProject !== undefined
    );

    if (currentProject) {
        await initializeExtension(context, currentProject);
    }

    // Re-detect when workspace changes (e.g. composer install runs)
    const workspaceWatcher = vscode.workspace.createFileSystemWatcher(
        '**/vendor/lucidarch/lucid/src/Finder.php'
    );
    context.subscriptions.push(
        workspaceWatcher,
        workspaceWatcher.onDidCreate(async () => {
            currentProject = await detect();
            if (currentProject) {
                await vscode.commands.executeCommand('setContext', 'lucid.isLucidProject', true);
                await initializeExtension(context, currentProject);
            }
        }),
        workspaceWatcher.onDidDelete(async () => {
            currentProject = undefined;
            await vscode.commands.executeCommand('setContext', 'lucid.isLucidProject', false);
        })
    );
}

async function initializeExtension(
    context: vscode.ExtensionContext,
    project: LucidProject
): Promise<void> {
    // ── Tree View ─────────────────────────────────────────────────────────────
    treeProvider = new LucidTreeProvider(project);

    const treeView = vscode.window.createTreeView('lucidArchitecture', {
        treeDataProvider: treeProvider,
        showCollapseAll: true,
    });

    // File watcher for tree auto-refresh
    const fileWatcher = createFileWatcher(project, () => treeProvider?.refresh());

    // ── CodeLens: ->run() navigation (Features / Operations) ─────────────────
    codeLensProvider = new LucidCodeLensProvider(project);
    const codeLensRegistration = vscode.languages.registerCodeLensProvider(
        { language: 'php' },
        codeLensProvider
    );

    // ── CodeLens: "Used by" on Job / Operation class declarations ─────────────
    usagesCodeLensProvider = new LucidUsagesCodeLensProvider(project);
    const usagesCodeLensRegistration = vscode.languages.registerCodeLensProvider(
        { language: 'php' },
        usagesCodeLensProvider
    );

    // ── Definition Provider: Ctrl+Click / F12 on class names inside ->run() / ->serve() ──
    const definitionRegistration = vscode.languages.registerDefinitionProvider(
        { language: 'php' },
        new LucidDefinitionProvider(project)
    );

    // ── Reference Provider: Shift+F12 on Job/Operation class names ───────────
    const referenceRegistration = vscode.languages.registerReferenceProvider(
        { language: 'php' },
        new LucidReferenceProvider(project)
    );

    // ── Commands ──────────────────────────────────────────────────────────────
    const commands: [string, (...args: any[]) => any][] = [
        ['lucid.makeFeature', () => makeFeature(project)],
        ['lucid.makeJob', () => makeJob(project)],
        ['lucid.makeOperation', () => makeOperation(project)],
        ['lucid.makeService', () => makeService(project)],
        ['lucid.makeController', () => makeController(project)],
        ['lucid.makeModel', () => makeModel(project)],
        ['lucid.makeRequest', () => makeRequest(project)],
        ['lucid.makePolicy', () => makePolicy(project)],
        ['lucid.makeMigration', () => makeMigration(project)],
        ['lucid.initMicro', () => initMicro()],
        ['lucid.initMonolith', () => initMonolith()],
        ['lucid.refreshTreeView', () => treeProvider?.refresh()],

        ['lucid.navigateToUnit', async (className: string) => {
            const uri = await findUnitByClassName(project, className);
            if (uri) {
                await vscode.window.showTextDocument(uri);
            } else {
                vscode.window.showWarningMessage(`Could not find unit: ${className}`);
            }
        }],

        ['lucid.showUsages', async (className: string, usages: UsageLocation[]) => {
            if (usages.length === 0) { return; }

            const items = usages.map(u => ({
                label: `$(symbol-event) ${u.callerName}`,
                description: vscode.workspace.asRelativePath(u.uri),
                usage: u,
            }));

            const picked = await vscode.window.showQuickPick(items, {
                title: `Units that use ${className}`,
                placeHolder: 'Select a caller to navigate to it',
            });

            if (picked) {
                const doc = await vscode.window.showTextDocument(picked.usage.uri);
                const pos = new vscode.Position(picked.usage.line, 0);
                doc.selection = new vscode.Selection(pos, pos);
                doc.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
            }
        }],

        // Delete commands
        ['lucid.deleteFeature', async (item?: LucidTreeItem) => {
            const name = item?.kind === 'feature' ? item.itemLabel : undefined;
            await deleteFeature(project, name);
            treeProvider?.refresh();
        }],
        ['lucid.deleteJob', async (item?: LucidTreeItem) => {
            const name = item?.kind === 'job' ? item.itemLabel : undefined;
            await deleteJob(project, name);
            treeProvider?.refresh();
        }],
        ['lucid.deleteOperation', async (item?: LucidTreeItem) => {
            const name = item?.kind === 'operation' ? item.itemLabel : undefined;
            await deleteOperation(project, name);
            treeProvider?.refresh();
        }],

        // Context-menu make commands (tree node → pre-fill domain/service)
        ['lucid.makeJobInContext', async (item?: LucidTreeItem) => {
            const domain = item?.kind === 'domain' ? item.itemLabel : undefined;
            await makeJob(project, domain);
            treeProvider?.refresh();
        }],
        ['lucid.makeFeatureInContext', async (item?: LucidTreeItem) => {
            const service = item?.kind === 'service' ? item.itemLabel : undefined;
            await makeFeature(project, service);
            treeProvider?.refresh();
        }],
    ];

    const registeredCommands = commands.map(([id, handler]) =>
        vscode.commands.registerCommand(id, handler)
    );

    context.subscriptions.push(
        treeView,
        fileWatcher,
        codeLensRegistration,
        usagesCodeLensRegistration,
        definitionRegistration,
        referenceRegistration,
        ...registeredCommands
    );

    // Show mode in a status bar item
    const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusItem.text = `$(layers) Lucid: ${project.mode === 'micro' ? 'Micro' : 'Monolith'}`;
    statusItem.tooltip = `Lucid Architecture — ${project.mode} mode`;
    statusItem.show();
    context.subscriptions.push(statusItem);
}

export function deactivate(): void {
    // Nothing to clean up beyond subscriptions; VS Code handles those automatically.
}
