import * as assert from 'assert';
import * as vscode from 'vscode';
import { scanFeatures, scanJobs, scanDomains } from '../../lucid/scanner';
import { LucidProject } from '../../lucid/types';

suite('Scanner', () => {
    let project: LucidProject;

    setup(() => {
        const folders = vscode.workspace.workspaceFolders;
        assert.ok(folders && folders.length > 0);
        project = { root: folders![0].uri, mode: 'micro' };
    });

    test('scanFeatures() returns Feature files', async () => {
        const features = await scanFeatures(project);
        assert.ok(Array.isArray(features));
        // Fixture has one feature
        assert.strictEqual(features.length, 1);
        assert.ok(features[0].name.endsWith('Feature'));
    });

    test('scanJobs() returns Job files', async () => {
        const jobs = await scanJobs(project);
        assert.ok(Array.isArray(jobs));
        assert.ok(jobs.every(j => j.name.endsWith('Job')));
    });

    test('scanDomains() returns domain directories', async () => {
        const domains = await scanDomains(project);
        assert.ok(Array.isArray(domains));
        assert.ok(domains.length >= 1);
    });
});
