import * as vscode from 'vscode';
import * as path from 'path';
import {
    LucidProject,
    LucidFeature,
    LucidJob,
    LucidOperation,
    LucidService,
    LucidDomain,
} from './types';

function basename(uri: vscode.Uri): string {
    return path.basename(uri.fsPath);
}

function parentName(uri: vscode.Uri): string {
    return path.basename(path.dirname(uri.fsPath));
}

function grandparentName(uri: vscode.Uri): string {
    return path.basename(path.dirname(path.dirname(uri.fsPath)));
}

/**
 * Returns the file stem (filename without extension).
 */
function stem(uri: vscode.Uri): string {
    return path.basename(uri.fsPath, path.extname(uri.fsPath));
}

export async function scanFeatures(project: LucidProject): Promise<LucidFeature[]> {
    const features: LucidFeature[] = [];

    if (project.mode === 'micro') {
        const files = await vscode.workspace.findFiles(
            new vscode.RelativePattern(project.root, 'app/Features/**/*Feature.php')
        );
        for (const uri of files) {
            features.push({ name: stem(uri), uri });
        }
    } else {
        const files = await vscode.workspace.findFiles(
            new vscode.RelativePattern(project.root, 'app/Services/*/Features/**/*Feature.php')
        );
        for (const uri of files) {
            // path: app/Services/<Service>/Features/<...>/*Feature.php
            const rel = vscode.workspace.asRelativePath(uri, false);
            const parts = rel.split('/');
            const service = parts[2]; // Services/<service>
            features.push({ name: stem(uri), uri, service });
        }
    }

    return features.sort((a, b) => a.name.localeCompare(b.name));
}

export async function scanJobs(project: LucidProject): Promise<LucidJob[]> {
    const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(project.root, 'app/Domains/*/Jobs/*Job.php')
    );
    return files
        .map(uri => ({
            name: stem(uri),
            uri,
            domain: grandparentName(uri), // Domains/<domain>/Jobs/<job>
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export async function scanOperations(project: LucidProject): Promise<LucidOperation[]> {
    const operations: LucidOperation[] = [];

    if (project.mode === 'micro') {
        const files = await vscode.workspace.findFiles(
            new vscode.RelativePattern(project.root, 'app/Operations/*Operation.php')
        );
        for (const uri of files) {
            operations.push({ name: stem(uri), uri });
        }
    } else {
        const files = await vscode.workspace.findFiles(
            new vscode.RelativePattern(project.root, 'app/Services/*/Operations/*Operation.php')
        );
        for (const uri of files) {
            const rel = vscode.workspace.asRelativePath(uri, false);
            const parts = rel.split('/');
            const service = parts[2];
            operations.push({ name: stem(uri), uri, service });
        }
    }

    return operations.sort((a, b) => a.name.localeCompare(b.name));
}

export async function scanServices(project: LucidProject): Promise<LucidService[]> {
    if (project.mode !== 'monolith') {
        return [];
    }

    const servicesBase = vscode.Uri.joinPath(project.root, 'app', 'Services');
    try {
        const entries = await vscode.workspace.fs.readDirectory(servicesBase);
        return entries
            .filter(([, type]) => type === vscode.FileType.Directory)
            .map(([name]) => ({
                name,
                uri: vscode.Uri.joinPath(servicesBase, name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch {
        return [];
    }
}

export async function scanDomains(project: LucidProject): Promise<LucidDomain[]> {
    const domainsBase = vscode.Uri.joinPath(project.root, 'app', 'Domains');
    try {
        const entries = await vscode.workspace.fs.readDirectory(domainsBase);
        return entries
            .filter(([, type]) => type === vscode.FileType.Directory)
            .map(([name]) => ({
                name,
                uri: vscode.Uri.joinPath(domainsBase, name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch {
        return [];
    }
}

/**
 * Find a unit file by class name (without .php extension).
 */
export async function findUnitByClassName(
    project: LucidProject,
    className: string
): Promise<vscode.Uri | undefined> {
    // Targeted patterns first (fast)
    const patterns = [
        `app/Domains/*/Jobs/${className}.php`,
        `app/Features/**/${className}.php`,
        `app/Operations/${className}.php`,
        `app/Services/*/Features/**/${className}.php`,
        `app/Services/*/Operations/${className}.php`,
    ];

    for (const pattern of patterns) {
        const results = await vscode.workspace.findFiles(
            new vscode.RelativePattern(project.root, pattern)
        );
        if (results.length > 0) {
            return results[0];
        }
    }

    // Fallback: search the entire app/ tree for a matching filename
    const fallback = await vscode.workspace.findFiles(
        new vscode.RelativePattern(project.root, `app/**/${className}.php`)
    );

    return fallback[0];
}

/**
 * Creates a file watcher that calls onChanged whenever Lucid unit files change.
 */
export function createFileWatcher(
    project: LucidProject,
    onChanged: () => void
): vscode.Disposable {
    const patterns = [
        'app/Features/**/*Feature.php',
        'app/Domains/*/Jobs/*Job.php',
        'app/Operations/*Operation.php',
        'app/Services/*/Features/**/*Feature.php',
        'app/Services/*/Operations/*Operation.php',
    ];

    const disposables: vscode.Disposable[] = patterns.map(pattern => {
        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(project.root, pattern)
        );
        watcher.onDidCreate(onChanged);
        watcher.onDidDelete(onChanged);
        watcher.onDidChange(onChanged);
        return watcher;
    });

    return vscode.Disposable.from(...disposables);
}
