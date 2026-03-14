import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { detect, detectMode } from '../../lucid/detector';

suite('Detector', () => {
    test('detect() finds Lucid project when Finder.php exists', async () => {
        // The test workspace (fixtures/micro) has vendor/lucidarch/lucid/src/Finder.php
        const project = await detect();
        assert.ok(project, 'Expected a project to be detected');
        assert.strictEqual(project!.mode, 'micro');
    });

    test('detectMode() returns micro when app/Services does not exist', async () => {
        const folders = vscode.workspace.workspaceFolders;
        assert.ok(folders && folders.length > 0);
        const mode = await detectMode(folders![0].uri);
        assert.strictEqual(mode, 'micro');
    });
});
