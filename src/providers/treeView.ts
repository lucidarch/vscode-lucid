import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import {
    scanFeatures,
    scanJobs,
    scanOperations,
    scanServices,
    scanDomains,
} from '../lucid/scanner';

export type TreeItemKind =
    | 'section'
    | 'service'
    | 'service-section'
    | 'domain'
    | 'feature'
    | 'job'
    | 'operation';

export class LucidTreeItem extends vscode.TreeItem {
    constructor(
        public readonly itemLabel: string,
        public readonly kind: TreeItemKind,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri?: vscode.Uri,
        /** Extra context — service name for 'service-section' nodes */
        public readonly contextData?: string,
    ) {
        super(itemLabel, collapsibleState);
        this.contextValue = kind;

        if (resourceUri && kind !== 'section' && kind !== 'service' && kind !== 'domain' && kind !== 'service-section') {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [resourceUri],
            };
        }

        switch (kind) {
            case 'section':
                this.iconPath = new vscode.ThemeIcon('folder-library');
                break;
            case 'service':
                this.iconPath = new vscode.ThemeIcon('package');
                break;
            case 'service-section':
                this.iconPath = new vscode.ThemeIcon(itemLabel === 'Features' ? 'symbol-event' : 'symbol-interface');
                break;
            case 'domain':
                this.iconPath = new vscode.ThemeIcon('layers');
                break;
            case 'feature':
                this.iconPath = new vscode.ThemeIcon('symbol-event');
                break;
            case 'job':
                this.iconPath = new vscode.ThemeIcon('symbol-method');
                break;
            case 'operation':
                this.iconPath = new vscode.ThemeIcon('symbol-interface');
                break;
        }
    }
}

export class LucidTreeProvider implements vscode.TreeDataProvider<LucidTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<LucidTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private project: LucidProject) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    updateProject(project: LucidProject): void {
        this.project = project;
        this.refresh();
    }

    getTreeItem(element: LucidTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: LucidTreeItem): Promise<LucidTreeItem[]> {
        if (!element) {
            return this.getRootItems();
        }

        switch (element.kind) {
            case 'section':
                return this.getSectionChildren(element.itemLabel);
            case 'service':
                return this.getServiceChildren(element.itemLabel);
            case 'service-section':
                return this.getServiceSectionChildren(element.itemLabel, element.contextData!);
            case 'domain':
                return this.getDomainChildren(element.itemLabel);
            default:
                return [];
        }
    }

    private async getRootItems(): Promise<LucidTreeItem[]> {
        const items: LucidTreeItem[] = [
            new LucidTreeItem('Features', 'section', vscode.TreeItemCollapsibleState.Expanded),
        ];

        if (this.project.mode === 'monolith') {
            items.push(new LucidTreeItem('Services', 'section', vscode.TreeItemCollapsibleState.Collapsed));
        }

        items.push(
            new LucidTreeItem('Domains', 'section', vscode.TreeItemCollapsibleState.Expanded),
            new LucidTreeItem('Operations', 'section', vscode.TreeItemCollapsibleState.Collapsed),
        );

        return items;
    }

    private async getSectionChildren(sectionLabel: string): Promise<LucidTreeItem[]> {
        switch (sectionLabel) {
            case 'Features': {
                const features = await scanFeatures(this.project);
                return features.map(f => {
                    const item = new LucidTreeItem(f.name, 'feature', vscode.TreeItemCollapsibleState.None, f.uri);
                    if (f.service) {
                        item.description = f.service;
                    }
                    return item;
                });
            }
            case 'Services': {
                const services = await scanServices(this.project);
                return services.map(s =>
                    new LucidTreeItem(s.name, 'service', vscode.TreeItemCollapsibleState.Collapsed, s.uri)
                );
            }
            case 'Domains': {
                const domains = await scanDomains(this.project);
                return domains.map(d =>
                    new LucidTreeItem(d.name, 'domain', vscode.TreeItemCollapsibleState.Collapsed, d.uri)
                );
            }
            case 'Operations': {
                const operations = await scanOperations(this.project);
                return operations.map(op => {
                    const item = new LucidTreeItem(op.name, 'operation', vscode.TreeItemCollapsibleState.None, op.uri);
                    if (op.service) {
                        item.description = op.service;
                    }
                    return item;
                });
            }
            default:
                return [];
        }
    }

    /** Monolith: a Service node expands to "Features" and "Operations" sub-sections */
    private async getServiceChildren(serviceName: string): Promise<LucidTreeItem[]> {
        const [features, operations] = await Promise.all([
            scanFeatures(this.project),
            scanOperations(this.project),
        ]);

        const hasFeatures  = features.some(f => f.service === serviceName);
        const hasOps       = operations.some(op => op.service === serviceName);
        const items: LucidTreeItem[] = [];

        if (hasFeatures) {
            items.push(new LucidTreeItem(
                'Features',
                'service-section',
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                serviceName,
            ));
        }

        if (hasOps) {
            items.push(new LucidTreeItem(
                'Operations',
                'service-section',
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                serviceName,
            ));
        }

        return items;
    }

    /** Monolith: children of a service sub-section (Features or Operations) */
    private async getServiceSectionChildren(sectionLabel: string, serviceName: string): Promise<LucidTreeItem[]> {
        if (sectionLabel === 'Features') {
            const features = await scanFeatures(this.project);
            return features
                .filter(f => f.service === serviceName)
                .map(f => new LucidTreeItem(f.name, 'feature', vscode.TreeItemCollapsibleState.None, f.uri));
        }

        if (sectionLabel === 'Operations') {
            const operations = await scanOperations(this.project);
            return operations
                .filter(op => op.service === serviceName)
                .map(op => new LucidTreeItem(op.name, 'operation', vscode.TreeItemCollapsibleState.None, op.uri));
        }

        return [];
    }

    private async getDomainChildren(domainName: string): Promise<LucidTreeItem[]> {
        const jobs = await scanJobs(this.project);
        return jobs
            .filter(j => j.domain === domainName)
            .map(j => new LucidTreeItem(j.name, 'job', vscode.TreeItemCollapsibleState.None, j.uri));
    }
}
