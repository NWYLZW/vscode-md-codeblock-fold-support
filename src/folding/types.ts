import * as vscode from 'vscode';

export interface FencedCodeBlock {
  readonly fenceStartLine: number;
  readonly fenceEndLine: number;
  readonly contentStartLine: number;
  readonly contentEndLine: number;
  readonly infoString: string;
  readonly languageId: string | undefined;
  readonly lines: readonly string[];
}

export interface CodeBlockFolder {
  readonly languageIds: ReadonlySet<string>;
  collectFoldingRanges(block: FencedCodeBlock): readonly vscode.FoldingRange[];
}
