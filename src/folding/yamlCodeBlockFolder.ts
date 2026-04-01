import * as vscode from 'vscode';

import { CodeBlockFolder, FencedCodeBlock } from './types';

interface ActiveIndentationRegion {
  readonly indent: number;
  readonly line: number;
}

interface MeaningfulYamlLine {
  readonly indent: number;
  readonly line: number;
}

export class YamlCodeBlockFolder implements CodeBlockFolder {
  readonly languageIds: ReadonlySet<string> = new Set(['yaml', 'yml']);

  collectFoldingRanges(block: FencedCodeBlock): readonly vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    const activeRegions: ActiveIndentationRegion[] = [];
    let previousMeaningfulLine: MeaningfulYamlLine | undefined;

    for (let relativeLine = 0; relativeLine < block.lines.length; relativeLine += 1) {
      const line = block.lines[relativeLine];
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        continue;
      }

      const currentLine: MeaningfulYamlLine = {
        indent: countIndentation(line),
        line: block.contentStartLine + relativeLine,
      };

      while (
        activeRegions.length > 0 &&
        currentLine.indent <= activeRegions[activeRegions.length - 1].indent
      ) {
        const region = activeRegions.pop();
        if (!region || !previousMeaningfulLine) {
          continue;
        }

        pushRange(ranges, region.line, previousMeaningfulLine.line);
      }

      if (
        previousMeaningfulLine &&
        currentLine.indent > previousMeaningfulLine.indent
      ) {
        activeRegions.push({
          indent: previousMeaningfulLine.indent,
          line: previousMeaningfulLine.line,
        });
      }

      previousMeaningfulLine = currentLine;
    }

    while (activeRegions.length > 0 && previousMeaningfulLine) {
      const region = activeRegions.pop();
      if (!region) {
        continue;
      }

      pushRange(ranges, region.line, previousMeaningfulLine.line);
    }

    return ranges;
  }
}

function countIndentation(line: string): number {
  let indentation = 0;

  for (const character of line) {
    if (character === ' ') {
      indentation += 1;
      continue;
    }

    if (character === '\t') {
      indentation += 2;
      continue;
    }

    break;
  }

  return indentation;
}

function pushRange(
  ranges: vscode.FoldingRange[],
  startLine: number,
  endLine: number,
): void {
  if (endLine <= startLine) {
    return;
  }

  ranges.push(
    new vscode.FoldingRange(startLine, endLine, vscode.FoldingRangeKind.Region),
  );
}
