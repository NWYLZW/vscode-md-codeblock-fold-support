import * as vscode from 'vscode';

import { CodeBlockFolder, FencedCodeBlock } from './types';

interface DelimiterPair {
  readonly open: string;
  readonly close: string;
}

interface BlockCommentToken {
  readonly start: string;
  readonly end: string;
}

interface BracketCodeBlockFolderOptions {
  readonly languageIds: readonly string[];
  readonly delimiterPairs: readonly DelimiterPair[];
  readonly stringDelimiters: readonly string[];
  readonly lineCommentTokens?: readonly string[];
  readonly blockCommentTokens?: readonly BlockCommentToken[];
}

interface StackEntry {
  readonly close: string;
  readonly line: number;
}

export class BracketCodeBlockFolder implements CodeBlockFolder {
  readonly languageIds: ReadonlySet<string>;

  private readonly delimiterPairs: readonly DelimiterPair[];
  private readonly stringDelimiters: readonly string[];
  private readonly lineCommentTokens: readonly string[];
  private readonly blockCommentTokens: readonly BlockCommentToken[];

  constructor(options: BracketCodeBlockFolderOptions) {
    this.languageIds = new Set(
      options.languageIds.map((languageId) => languageId.trim().toLowerCase()),
    );
    this.delimiterPairs = options.delimiterPairs;
    this.stringDelimiters = options.stringDelimiters;
    this.lineCommentTokens = options.lineCommentTokens ?? [];
    this.blockCommentTokens = options.blockCommentTokens ?? [];
  }

  collectFoldingRanges(block: FencedCodeBlock): readonly vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    const stack: StackEntry[] = [];
    let activeStringDelimiter: string | undefined;
    let isEscaping = false;
    let activeBlockComment: BlockCommentToken | undefined;

    for (let relativeLine = 0; relativeLine < block.lines.length; relativeLine += 1) {
      const line = block.lines[relativeLine];
      const absoluteLine = block.contentStartLine + relativeLine;

      for (let column = 0; column < line.length; column += 1) {
        if (activeBlockComment) {
          if (line.startsWith(activeBlockComment.end, column)) {
            column += activeBlockComment.end.length - 1;
            activeBlockComment = undefined;
          }
          continue;
        }

        if (activeStringDelimiter) {
          const character = line[column];

          if (isEscaping) {
            isEscaping = false;
            continue;
          }

          if (character === '\\') {
            isEscaping = true;
            continue;
          }

          if (character === activeStringDelimiter) {
            activeStringDelimiter = undefined;
          }

          continue;
        }

        const lineCommentToken = findMatchingToken(this.lineCommentTokens, line, column);
        if (lineCommentToken) {
          break;
        }

        const blockCommentToken = findMatchingBlockCommentToken(
          this.blockCommentTokens,
          line,
          column,
        );
        if (blockCommentToken) {
          activeBlockComment = blockCommentToken;
          column += blockCommentToken.start.length - 1;
          continue;
        }

        const stringDelimiter = findMatchingToken(this.stringDelimiters, line, column);
        if (stringDelimiter) {
          activeStringDelimiter = stringDelimiter;
          isEscaping = false;
          continue;
        }

        const openingDelimiter = this.delimiterPairs.find((pair) =>
          line.startsWith(pair.open, column),
        );
        if (openingDelimiter) {
          stack.push({
            close: openingDelimiter.close,
            line: absoluteLine,
          });
          column += openingDelimiter.open.length - 1;
          continue;
        }

        const closingDelimiter = this.delimiterPairs.find((pair) =>
          line.startsWith(pair.close, column),
        );
        if (!closingDelimiter) {
          continue;
        }

        const openEntry = stack.at(-1);
        if (!openEntry || openEntry.close !== closingDelimiter.close) {
          column += closingDelimiter.close.length - 1;
          continue;
        }

        stack.pop();
        column += closingDelimiter.close.length - 1;

        if (absoluteLine <= openEntry.line) {
          continue;
        }

        ranges.push(
          new vscode.FoldingRange(
            openEntry.line,
            absoluteLine,
            vscode.FoldingRangeKind.Region,
          ),
        );
      }

      isEscaping = false;
    }

    return ranges;
  }
}

function findMatchingToken(
  tokens: readonly string[],
  line: string,
  column: number,
): string | undefined {
  return tokens.find((token) => line.startsWith(token, column));
}

function findMatchingBlockCommentToken(
  tokens: readonly BlockCommentToken[],
  line: string,
  column: number,
): BlockCommentToken | undefined {
  return tokens.find((token) => line.startsWith(token.start, column));
}
