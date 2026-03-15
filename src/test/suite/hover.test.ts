import * as assert from 'assert';
import * as vscode from 'vscode';
import { LucidHoverProvider } from '../../providers/hover';
import { LucidProject } from '../../lucid/types';

suite('Hover Provider', () => {
    let project: LucidProject;
    let provider: LucidHoverProvider;

    setup(() => {
        const folders = vscode.workspace.workspaceFolders;
        assert.ok(folders && folders.length > 0);
        project = { root: folders![0].uri, mode: 'micro' };
        provider = new LucidHoverProvider(project);
    });

    async function getHover(content: string, className: string) {
        const doc = await vscode.workspace.openTextDocument({ language: 'php', content });
        const token = new vscode.CancellationTokenSource().token;
        const pos = doc.positionAt(content.indexOf(className));
        return provider.provideHover(doc, pos, token);
    }

    // ── Jobs ─────────────────────────────────────────────────────────────────

    test('job: shows constructor signature (no visibility modifiers)', async () => {
        const content = `<?php\n$this->run(GetProductsJob::class);`;
        const hover = await getHover(content, 'GetProductsJob');
        assert.ok(hover, 'Expected hover to be returned');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('GetProductsJob('), 'Signature missing');
        assert.ok(!md.includes('private'), 'Visibility modifier should be stripped');
        assert.ok(!md.includes('readonly'), 'readonly should be stripped');
    });

    test('job: shows handle() return type', async () => {
        const content = `<?php\n$this->run(GetProductsJob::class);`;
        const hover = await getHover(content, 'GetProductsJob');
        assert.ok(hover);
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('handle():'), 'handle() return type missing');
    });

    test('job: shows usage count', async () => {
        const content = `<?php\n$this->run(ParseProductFiltersJob::class);`;
        const hover = await getHover(content, 'ParseProductFiltersJob');
        assert.ok(hover);
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('Used by'), 'Usage count missing');
    });

    test('job: works for multi-line ->run(new ClassName(', async () => {
        const content = `<?php\n$this->run(new AttachProductImagesJob(\n    productId: $product->id,\n));`;
        const hover = await getHover(content, 'AttachProductImagesJob');
        assert.ok(hover, 'Expected hover for multi-line call');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('AttachProductImagesJob('));
    });

    // ── Features ─────────────────────────────────────────────────────────────

    test('feature: shows ordered ->run() sequence', async () => {
        const content = `<?php\nreturn $this->serve(ListProductsFeature::class);`;
        const hover = await getHover(content, 'ListProductsFeature');
        assert.ok(hover, 'Expected hover to be returned');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        // ListProductsFeature runs ParseProductFiltersJob, GetProductsJob, TrackProductListingViewJob
        assert.ok(md.includes('1.'), 'Numbered list missing');
        assert.ok(md.includes('ParseProductFiltersJob'), 'First job missing');
        assert.ok(md.includes('GetProductsJob'), 'Second job missing');
    });

    test('feature: sequence is in declaration order', async () => {
        const content = `<?php\nreturn $this->serve(ListProductsFeature::class);`;
        const hover = await getHover(content, 'ListProductsFeature');
        assert.ok(hover);
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        const pos1 = md.indexOf('ParseProductFiltersJob');
        const pos2 = md.indexOf('GetProductsJob');
        assert.ok(pos1 < pos2, 'Jobs should appear in declaration order');
    });

    test('feature: does not show constructor or handle() return type', async () => {
        const content = `<?php\nreturn $this->serve(ListProductsFeature::class);`;
        const hover = await getHover(content, 'ListProductsFeature');
        assert.ok(hover);
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(!md.includes('handle():'), 'handle() return type should not appear for features');
    });

    // ── Negative cases ────────────────────────────────────────────────────────

    test('returns undefined outside ->run() / ->serve()', async () => {
        const content = `<?php\nuse App\\Domains\\Product\\Jobs\\GetProductsJob;`;
        const hover = await getHover(content, 'GetProductsJob');
        assert.strictEqual(hover, undefined);
    });

    test('returns undefined for unknown class', async () => {
        const content = `<?php\n$this->run(UnknownJob::class);`;
        const hover = await getHover(content, 'UnknownJob');
        assert.strictEqual(hover, undefined);
    });
});
