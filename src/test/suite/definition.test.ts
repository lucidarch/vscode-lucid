import * as assert from 'assert';
import * as vscode from 'vscode';
import { LucidDefinitionProvider } from '../../providers/definition';
import { LucidProject } from '../../lucid/types';

suite('Definition Provider', () => {
    let project: LucidProject;
    let provider: LucidDefinitionProvider;

    setup(() => {
        const folders = vscode.workspace.workspaceFolders;
        assert.ok(folders && folders.length > 0);
        project = { root: folders![0].uri, mode: 'micro' };
        provider = new LucidDefinitionProvider(project);
    });

    async function getDefinition(content: string, className: string) {
        const doc = await vscode.workspace.openTextDocument({ language: 'php', content });
        const token = new vscode.CancellationTokenSource().token;
        // Find the position of the class name in the document
        const pos = doc.positionAt(content.indexOf(className));
        return provider.provideDefinition(doc, pos, token);
    }

    test('resolves ->serve(FeatureName::class) to feature file', async () => {
        const content = `<?php\nclass ProductsController extends Controller {\n    public function index() {\n        return $this->serve(ListProductsFeature::class);\n    }\n}`;
        const result = await getDefinition(content, 'ListProductsFeature');
        assert.ok(result, 'Expected a definition location');
        const loc = result as vscode.Location;
        assert.ok(loc.uri.fsPath.endsWith('ListProductsFeature.php'));
    });

    test('resolves ->run(new JobName(...)) to job file', async () => {
        const content = `<?php\n$this->run(new GetProductsJob($filters));`;
        const result = await getDefinition(content, 'GetProductsJob');
        assert.ok(result, 'Expected a definition location');
        const loc = result as vscode.Location;
        assert.ok(loc.uri.fsPath.endsWith('GetProductsJob.php'));
    });

    test('resolves ->run(JobName::class) to job file', async () => {
        const content = `<?php\n$this->run(ParseProductFiltersJob::class);`;
        const result = await getDefinition(content, 'ParseProductFiltersJob');
        assert.ok(result, 'Expected a definition location');
        const loc = result as vscode.Location;
        assert.ok(loc.uri.fsPath.endsWith('ParseProductFiltersJob.php'));
    });

    test('returns undefined for class names outside ->run() / ->serve()', async () => {
        const content = `<?php\nuse App\\Features\\ListProductsFeature;\nclass Foo {}`;
        const result = await getDefinition(content, 'ListProductsFeature');
        assert.strictEqual(result, undefined);
    });

    test('returns undefined for unknown class names', async () => {
        const content = `<?php\n$this->serve(NonExistentFeature::class);`;
        const result = await getDefinition(content, 'NonExistentFeature');
        assert.strictEqual(result, undefined);
    });
});
