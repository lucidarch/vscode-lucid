import * as vscode from 'vscode';
import { LucidProject } from '../lucid/types';
import { scanJobs, scanOperations } from '../lucid/scanner';
import { scanUsages, findClassDeclarationLine } from '../lucid/usages';

export class LucidDiagnosticsProvider implements vscode.Disposable {
    private readonly collection: vscode.DiagnosticCollection;
    private debounceTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly project: LucidProject) {
        this.collection = vscode.languages.createDiagnosticCollection('lucid');
    }

    dispose(): void {
        if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
        this.collection.dispose();
    }

    /**
     * Schedule a refresh after `delay` ms, cancelling any pending refresh.
     * Default 5 s keeps the diagnostics from flashing on every keystroke.
     */
    scheduleRefresh(delay = 5000): void {
        if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
        this.debounceTimer = setTimeout(() => { void this.refresh(); }, delay);
    }

    async refresh(): Promise<void> {
        const enabled = vscode.workspace
            .getConfiguration('lucid')
            .get<boolean>('diagnostics.unusedUnits', true);

        if (!enabled) {
            this.collection.clear();
            return;
        }

        const [jobs, operations] = await Promise.all([
            scanJobs(this.project),
            scanOperations(this.project),
        ]);

        // Collect results first so we can do a single atomic update.
        const entries: [vscode.Uri, vscode.Diagnostic[]][] = [];

        await Promise.all([...jobs, ...operations].map(async unit => {
            const usages = await scanUsages(this.project, unit.name);
            if (usages.length > 0) { return; }

            const declLine = await findClassDeclarationLine(unit.uri) ?? 0;
            const range = new vscode.Range(declLine, 0, declLine, Number.MAX_SAFE_INTEGER);
            const diag = new vscode.Diagnostic(
                range,
                `${unit.name} is not used by any Feature or Operation`,
                vscode.DiagnosticSeverity.Hint
            );
            diag.source = 'lucid';
            diag.code = 'unused-unit';
            entries.push([unit.uri, [diag]]);
        }));

        // Clear first, then set all at once to avoid flicker.
        this.collection.clear();
        for (const [uri, diags] of entries) {
            this.collection.set(uri, diags);
        }
    }
}

/**
 * Returns all unused Job/Operation units (no ->run() callers).
 * Used by the "Show Unused Units" quick-pick command.
 */
export async function collectUnusedUnits(
    project: LucidProject
): Promise<{ name: string; uri: vscode.Uri }[]> {
    const [jobs, operations] = await Promise.all([
        scanJobs(project),
        scanOperations(project),
    ]);

    const unused: { name: string; uri: vscode.Uri }[] = [];

    await Promise.all([...jobs, ...operations].map(async unit => {
        const usages = await scanUsages(project, unit.name);
        if (usages.length === 0) {
            unused.push({ name: unit.name, uri: unit.uri });
        }
    }));

    return unused.sort((a, b) => a.name.localeCompare(b.name));
}
