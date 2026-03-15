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

    test('shows constructor params and handle return type for ->run(Job::class)', async () => {
        const content = `<?php\n$this->run(GetProductsJob::class);`;
        const hover = await getHover(content, 'GetProductsJob');
        assert.ok(hover, 'Expected hover to be returned');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('GetProductsJob'), 'Title missing');
        assert.ok(md.includes('__construct'), 'Constructor missing');
        assert.ok(md.includes('handle()'), 'handle() missing');
    });

    test('shows constructor params for ->serve(Feature::class)', async () => {
        const content = `<?php\nreturn $this->serve(ListProductsFeature::class);`;
        const hover = await getHover(content, 'ListProductsFeature');
        assert.ok(hover, 'Expected hover to be returned');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('ListProductsFeature'));
    });

    test('shows usage count', async () => {
        const content = `<?php\n$this->run(ParseProductFiltersJob::class);`;
        const hover = await getHover(content, 'ParseProductFiltersJob');
        assert.ok(hover, 'Expected hover to be returned');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        // ParseProductFiltersJob is used by ListProductsFeature
        assert.ok(md.includes('Used by'), 'Usage count missing');
    });

    test('shows hover for multi-line ->run(new ClassName(', async () => {
        const content = `<?php\n$this->run(new AttachProductImagesJob(\n    productId: $product->id,\n));`;
        const hover = await getHover(content, 'AttachProductImagesJob');
        assert.ok(hover, 'Expected hover for multi-line call');
        const md = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(md.includes('AttachProductImagesJob'));
    });

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
