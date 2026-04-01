import * as vscode from 'vscode';

import {
  CodeBlockFolderRegistry,
  createDefaultCodeBlockFolderRegistry,
} from './folding/codeBlockFolderRegistry';
import { MarkdownCodeBlockFoldingProvider } from './folding/markdownCodeBlockFoldingProvider';

export function activate(context: vscode.ExtensionContext): void {
  const registry: CodeBlockFolderRegistry = createDefaultCodeBlockFolderRegistry();
  const provider = new MarkdownCodeBlockFoldingProvider(registry);

  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      { language: 'markdown' },
      provider,
    ),
  );
}

export function deactivate(): void {}
