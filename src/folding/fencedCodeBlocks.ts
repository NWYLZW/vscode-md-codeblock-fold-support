import * as vscode from 'vscode';

import { FencedCodeBlock } from './types';

const OPEN_FENCE_PATTERN = /^( {0,3})(`{3,}|~{3,})(.*)$/;

interface ActiveFence {
  readonly markerCharacter: '`' | '~';
  readonly markerLength: number;
  readonly fenceStartLine: number;
  readonly infoString: string;
}

export function collectFencedCodeBlocks(
  document: vscode.TextDocument,
): readonly FencedCodeBlock[] {
  const blocks: FencedCodeBlock[] = [];
  let activeFence: ActiveFence | undefined;

  for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber += 1) {
    const lineText = document.lineAt(lineNumber).text;

    if (!activeFence) {
      activeFence = parseOpeningFence(lineText, lineNumber);
      continue;
    }

    if (!isClosingFence(lineText, activeFence)) {
      continue;
    }

    const contentStartLine = activeFence.fenceStartLine + 1;
    const contentEndLine = lineNumber - 1;

    blocks.push({
      fenceStartLine: activeFence.fenceStartLine,
      fenceEndLine: lineNumber,
      contentStartLine,
      contentEndLine,
      infoString: activeFence.infoString,
      languageId: extractLanguageId(activeFence.infoString),
      lines: collectLines(document, contentStartLine, contentEndLine),
    });

    activeFence = undefined;
  }

  return blocks;
}

function parseOpeningFence(
  lineText: string,
  lineNumber: number,
): ActiveFence | undefined {
  const match = OPEN_FENCE_PATTERN.exec(lineText);
  if (!match) {
    return undefined;
  }

  const marker = match[2];

  return {
    markerCharacter: marker[0] as '`' | '~',
    markerLength: marker.length,
    fenceStartLine: lineNumber,
    infoString: match[3].trim(),
  };
}

function isClosingFence(lineText: string, activeFence: ActiveFence): boolean {
  const trimmedLeft = lineText.trimStart();
  const leadingSpaces = lineText.length - trimmedLeft.length;

  if (leadingSpaces > 3) {
    return false;
  }

  const expectedPrefix = activeFence.markerCharacter.repeat(activeFence.markerLength);
  if (!trimmedLeft.startsWith(expectedPrefix)) {
    return false;
  }

  const actualMarkerLength = countLeadingMarkerCharacters(
    trimmedLeft,
    activeFence.markerCharacter,
  );

  if (actualMarkerLength < activeFence.markerLength) {
    return false;
  }

  return trimmedLeft.slice(actualMarkerLength).trim().length === 0;
}

function countLeadingMarkerCharacters(
  value: string,
  markerCharacter: '`' | '~',
): number {
  let count = 0;

  while (value[count] === markerCharacter) {
    count += 1;
  }

  return count;
}

function collectLines(
  document: vscode.TextDocument,
  startLine: number,
  endLine: number,
): readonly string[] {
  if (endLine < startLine) {
    return [];
  }

  const lines: string[] = [];

  for (let lineNumber = startLine; lineNumber <= endLine; lineNumber += 1) {
    lines.push(document.lineAt(lineNumber).text);
  }

  return lines;
}

function extractLanguageId(infoString: string): string | undefined {
  const match = infoString.trim().match(/^([^\s{]+)/);
  if (!match) {
    return undefined;
  }

  return match[1].replace(/^\./, '').toLowerCase();
}
