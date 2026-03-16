import * as assert from 'assert';
import * as vscode from 'vscode';
import { LucidDiagnosticsProvider, collectUnusedUnits } from '../../providers/diagnostics';
import { LucidProject } from '../../lucid/types';

suite('Diagnostics Provider', () => {
    let project: LucidProject;
    let provider: LucidDiagnosticsProvider;

    setup(() => {
        const folders = vscode.workspace.workspaceFolders;
        assert.ok(folders && folders.length > 0);
        project = { root: folders![0].uri, mode: 'micro' };
        provider = new LucidDiagnosticsProvider(project);
    });

    teardown(() => {
        provider.dispose();
    });

    // ── collectUnusedUnits ────────────────────────────────────────────────────

    test('reports SyncProductToExternalCatalogJob as unused', async () => {
        const unused = await collectUnusedUnits(project);
        const names = unused.map(u => u.name);
        assert.ok(names.includes('SyncProductToExternalCatalogJob'), `Expected SyncProductToExternalCatalogJob in: ${names.join(', ')}`);
    });

    test('reports ArchiveStaleProductsOperation as unused', async () => {
        const unused = await collectUnusedUnits(project);
        const names = unused.map(u => u.name);
        assert.ok(names.includes('ArchiveStaleProductsOperation'), `Expected ArchiveStaleProductsOperation in: ${names.join(', ')}`);
    });

    test('does not report GetProductsJob as unused (used in ListProductsFeature)', async () => {
        const unused = await collectUnusedUnits(project);
        const names = unused.map(u => u.name);
        assert.ok(!names.includes('GetProductsJob'), 'GetProductsJob should not be flagged — it is used');
    });

    test('does not report ParseProductFiltersJob as unused (used in ListProductsFeature)', async () => {
        const unused = await collectUnusedUnits(project);
        const names = unused.map(u => u.name);
        assert.ok(!names.includes('ParseProductFiltersJob'), 'ParseProductFiltersJob should not be flagged — it is used');
    });

    // ── LucidDiagnosticsProvider.refresh() ───────────────────────────────────

    test('refresh() sets hint diagnostics for unused units', async () => {
        await provider.refresh();

        const unused = await collectUnusedUnits(project);
        for (const unit of unused) {
            const diags = vscode.languages.getDiagnostics(unit.uri);
            const lucidDiags = diags.filter(d => d.source === 'lucid');
            assert.ok(lucidDiags.length > 0, `Expected a Lucid diagnostic on ${unit.name}`);
            assert.strictEqual(lucidDiags[0].severity, vscode.DiagnosticSeverity.Hint);
            assert.ok(lucidDiags[0].message.includes(unit.name));
        }
    });

    test('refresh() clears diagnostics for used units', async () => {
        await provider.refresh();

        // GetProductsJob is used — should have no lucid diagnostics
        const jobs = (await import('../../lucid/scanner')).scanJobs;
        const allJobs = await jobs(project);
        const getProductsJob = allJobs.find(j => j.name === 'GetProductsJob');
        assert.ok(getProductsJob, 'GetProductsJob fixture must exist');

        const diags = vscode.languages.getDiagnostics(getProductsJob.uri);
        const lucidDiags = diags.filter(d => d.source === 'lucid');
        assert.strictEqual(lucidDiags.length, 0, 'GetProductsJob should have no unused diagnostic');
    });
});
