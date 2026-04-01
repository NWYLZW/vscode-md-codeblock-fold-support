import * as vscode from 'vscode';

import { CodeBlockFolderRegistry } from './codeBlockFolderRegistry';
import { collectFencedCodeBlocks } from './fencedCodeBlocks';

const CONFIGURATION_SECTION = 'markdownCodeBlockFoldSupport';
const ENABLED_LANGUAGES_KEY = 'enabledLanguages';

export class MarkdownCodeBlockFoldingProvider
  implements vscode.FoldingRangeProvider
{
  constructor(private readonly folderRegistry: CodeBlockFolderRegistry) {}

  provideFoldingRanges(
    document: vscode.TextDocument,
  ): vscode.ProviderResult<vscode.FoldingRange[]> {
    const enabledLanguages = getEnabledLanguages();
    const ranges: vscode.FoldingRange[] = [];

    for (const block of collectFencedCodeBlocks(document)) {
      if (!block.languageId || !enabledLanguages.has(block.languageId)) {
        continue;
      }

      const folder = this.folderRegistry.get(block.languageId);
      if (!folder) {
        continue;
      }

      ranges.push(...folder.collectFoldingRanges(block));
    }

    return deduplicateRanges(ranges);
  }
}

function getEnabledLanguages(): ReadonlySet<string> {
  const configuredLanguages = vscode.workspace
    .getConfiguration(CONFIGURATION_SECTION)
    .get<string[]>(ENABLED_LANGUAGES_KEY, [
      'json',
      'jsonc',
      'javascript',
      'javascriptreact',
      'js',
      'jsx',
      'typescript',
      'typescriptreact',
      'ts',
      'tsx',
      'mjs',
      'cjs',
      'css',
      'scss',
      'less',
      'yaml',
      'yml',
      'html',
      'xml',
      'xhtml',
      'svg',
      'vue',
      'svelte',
    ]);

  return new Set(
    configuredLanguages
      .map((languageId) => languageId.trim().toLowerCase())
      .filter(Boolean),
  );
}

function deduplicateRanges(
  ranges: readonly vscode.FoldingRange[],
): vscode.FoldingRange[] {
  const seen = new Set<string>();

  return [...ranges]
    .sort((left, right) => {
      if (left.start !== right.start) {
        return left.start - right.start;
      }

      return left.end - right.end;
    })
    .filter((range) => {
      const key = `${range.start}:${range.end}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}
