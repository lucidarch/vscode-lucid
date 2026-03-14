import * as assert from 'assert';
import * as vscode from 'vscode';
import { LucidCodeLensProvider } from '../../providers/codelens';
import { LucidProject } from '../../lucid/types';

suite('CodeLens Provider', () => {
    let project: LucidProject;
    let provider: LucidCodeLensProvider;

    setup(() => {
        const folders = vscode.workspace.workspaceFolders;
        assert.ok(folders && folders.length > 0);
        project = { root: folders![0].uri, mode: 'micro' };
        provider = new LucidCodeLensProvider(project);
    });

    test('provides CodeLens for ->run(SomeJob::class)', async () => {
        const content = `<?php\nclass TestFeature extends Feature {\n    public function handle() {\n        $this->run(FindProductJob::class);\n    }\n}`;
        const uri = vscode.Uri.parse('untitled:TestFeature.php');
        const doc = await vscode.workspace.openTextDocument({ language: 'php', content });
        const token = new vscode.CancellationTokenSource().token;
        const lenses = await provider.provideCodeLenses(doc, token);
        assert.ok(lenses.length >= 1, 'Expected at least one CodeLens');
        assert.ok(lenses[0].command?.title.includes('FindProductJob'));
    });

    test('provides CodeLens for ->run(new SomeJob(...))', async () => {
        const content = `<?php\n$this->run(new SendEmailJob($user));`;
        const doc = await vscode.workspace.openTextDocument({ language: 'php', content });
        const token = new vscode.CancellationTokenSource().token;
        const lenses = await provider.provideCodeLenses(doc, token);
        assert.ok(lenses.length >= 1);
        assert.ok(lenses[0].command?.title.includes('SendEmailJob'));
    });

    test('provides CodeLens for ->run("ClassName")', async () => {
        const content = `<?php\n$this->run('ProcessPaymentJob');`;
        const doc = await vscode.workspace.openTextDocument({ language: 'php', content });
        const token = new vscode.CancellationTokenSource().token;
        const lenses = await provider.provideCodeLenses(doc, token);
        assert.ok(lenses.length >= 1);
        assert.ok(lenses[0].command?.title.includes('ProcessPaymentJob'));
    });
});
