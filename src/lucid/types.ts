import * as vscode from 'vscode';

export type LucidMode = 'micro' | 'monolith';

export interface LucidProject {
    readonly root: vscode.Uri;
    readonly mode: LucidMode;
}

export interface LucidService {
    readonly name: string;
    readonly uri: vscode.Uri;
}

export interface LucidDomain {
    readonly name: string;
    readonly uri: vscode.Uri;
}

export interface LucidFeature {
    readonly name: string;
    readonly uri: vscode.Uri;
    /** Only present in monolith mode */
    readonly service?: string;
}

export interface LucidJob {
    readonly name: string;
    readonly uri: vscode.Uri;
    readonly domain: string;
}

export interface LucidOperation {
    readonly name: string;
    readonly uri: vscode.Uri;
    /** Only present in monolith mode */
    readonly service?: string;
}

export interface RunCallMatch {
    readonly line: number;
    readonly className: string;
    /** 'class' | 'new' | 'string' */
    readonly style: 'class' | 'new' | 'string';
}
