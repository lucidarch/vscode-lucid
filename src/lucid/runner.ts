import * as vscode from 'vscode';
import * as cp from 'child_process';
import { LucidProject } from './types';
import { resolveBinaryPath } from './detector';

let outputChannel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Lucid');
    }
    return outputChannel;
}

export interface RunResult {
    stdout: string;
    stderr: string;
    code: number;
}

/**
 * Runs a Lucid CLI command and returns stdout/stderr.
 * All output is forwarded to the "Lucid" output channel.
 */
export function runLucidCommand(
    project: LucidProject,
    args: string[]
): Promise<RunResult> {
    return new Promise((resolve, reject) => {
        const binary = resolveBinaryPath(project.root);
        const channel = getOutputChannel();

        channel.appendLine(`\n$ ${binary} ${args.join(' ')}`);
        channel.show(true);

        const proc = cp.spawn(binary, args, {
            cwd: project.root.fsPath,
            env: { ...process.env },
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            stdout += text;
            channel.append(text);
        });

        proc.stderr.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            stderr += text;
            channel.append(text);
        });

        proc.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'ENOENT') {
                const msg = `Lucid binary not found at: ${binary}`;
                channel.appendLine(`[ERROR] ${msg}`);
                vscode.window.showErrorMessage(
                    `${msg}. Check lucid.binaryPath in settings or run: composer require lucidarch/lucid`
                );
            } else {
                channel.appendLine(`[ERROR] ${err.message}`);
                vscode.window.showErrorMessage(`Lucid command failed: ${err.message}`);
            }
            reject(err);
        });

        proc.on('close', (code: number | null) => {
            const exitCode = code ?? 1;
            if (exitCode !== 0) {
                channel.appendLine(`[EXITED with code ${exitCode}]`);
                vscode.window.showErrorMessage(
                    `Lucid command exited with code ${exitCode}. See the Lucid output channel for details.`
                );
            }
            resolve({ stdout, stderr, code: exitCode });
        });
    });
}

/**
 * Parses the generated file path from Lucid CLI output.
 * The CLI prints something like: "Find it at app/Domains/Product/Jobs/FindProductJob.php"
 */
export function parseGeneratedPath(stdout: string, root: vscode.Uri): vscode.Uri | undefined {
    const match = stdout.match(/Find it at\s+(.+?)(?:\s|$)/i);
    if (!match) {
        return undefined;
    }
    const relativePath = match[1].trim();
    return vscode.Uri.joinPath(root, relativePath);
}
