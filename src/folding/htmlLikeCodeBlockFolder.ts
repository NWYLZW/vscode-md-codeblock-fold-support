import * as vscode from 'vscode';

import { CodeBlockFolder, FencedCodeBlock } from './types';

const VOID_ELEMENT_NAMES = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const RAW_TEXT_ELEMENT_NAMES = new Set(['script', 'style', 'textarea', 'title']);

interface OpenTagEntry {
  readonly line: number;
  readonly name: string;
}

interface ActiveTag {
  readonly startLine: number;
  readonly buffer: string[];
  quote: '"' | "'" | undefined;
}

type TagInfo =
  | {
      readonly kind: 'open';
      readonly name: string;
      readonly selfClosing: boolean;
    }
  | {
      readonly kind: 'close';
      readonly name: string;
    };

export class HtmlLikeCodeBlockFolder implements CodeBlockFolder {
  readonly languageIds: ReadonlySet<string> = new Set([
    'html',
    'xml',
    'xhtml',
    'svg',
    'vue',
    'svelte',
  ]);

  collectFoldingRanges(block: FencedCodeBlock): readonly vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    const openTags: OpenTagEntry[] = [];
    let activeTag: ActiveTag | undefined;
    let activeMarkupBlockEndToken: string | undefined;
    let activeRawTextTagName: string | undefined;

    for (let relativeLine = 0; relativeLine < block.lines.length; relativeLine += 1) {
      const line = block.lines[relativeLine];
      const lowerLine = line.toLowerCase();
      const absoluteLine = block.contentStartLine + relativeLine;

      for (let column = 0; column < line.length; column += 1) {
        if (activeMarkupBlockEndToken) {
          const blockEndIndex = line.indexOf(activeMarkupBlockEndToken, column);
          if (blockEndIndex === -1) {
            break;
          }

          column = blockEndIndex + activeMarkupBlockEndToken.length - 1;
          activeMarkupBlockEndToken = undefined;
          continue;
        }

        if (activeTag) {
          const character = line[column];
          activeTag.buffer.push(character);

          if (activeTag.quote) {
            if (character === activeTag.quote) {
              activeTag.quote = undefined;
            }
            continue;
          }

          if (character === '"' || character === "'") {
            activeTag.quote = character;
            continue;
          }

          if (character !== '>') {
            continue;
          }

          const tagInfo = parseTag(activeTag.buffer.join(''));
          if (tagInfo?.kind === 'open') {
            if (!tagInfo.selfClosing) {
              openTags.push({ line: activeTag.startLine, name: tagInfo.name });
              if (RAW_TEXT_ELEMENT_NAMES.has(tagInfo.name)) {
                activeRawTextTagName = tagInfo.name;
              }
            }
          } else if (tagInfo?.kind === 'close') {
            closeOpenTag(openTags, tagInfo.name, absoluteLine, ranges);
            if (activeRawTextTagName === tagInfo.name) {
              activeRawTextTagName = undefined;
            }
          }

          activeTag = undefined;
          continue;
        }

        if (activeRawTextTagName) {
          const closeTagIndex = lowerLine.indexOf(`</${activeRawTextTagName}`, column);
          if (closeTagIndex === -1) {
            break;
          }

          activeRawTextTagName = undefined;
          column = closeTagIndex - 1;
          continue;
        }

        if (line.startsWith('<!--', column)) {
          const commentEndIndex = line.indexOf('-->', column + 4);
          if (commentEndIndex === -1) {
            activeMarkupBlockEndToken = '-->';
            break;
          }

          column = commentEndIndex + 2;
          continue;
        }

        if (line.startsWith('<![CDATA[', column)) {
          const cdataEndIndex = line.indexOf(']]>', column + 9);
          if (cdataEndIndex === -1) {
            activeMarkupBlockEndToken = ']]>';
            break;
          }

          column = cdataEndIndex + 2;
          continue;
        }

        if (line[column] !== '<') {
          continue;
        }

        activeTag = {
          startLine: absoluteLine,
          buffer: ['<'],
          quote: undefined,
        };
      }
    }

    return ranges;
  }
}

function parseTag(value: string): TagInfo | undefined {
  const trimmedValue = value.trim();
  if (
    trimmedValue.startsWith('<!') ||
    trimmedValue.startsWith('<?') ||
    trimmedValue.startsWith('<!--')
  ) {
    return undefined;
  }

  const closingTagMatch = trimmedValue.match(/^<\/\s*([A-Za-z][\w:-]*)\s*>$/u);
  if (closingTagMatch) {
    return {
      kind: 'close',
      name: normalizeTagName(closingTagMatch[1]),
    };
  }

  const openingTagMatch = trimmedValue.match(/^<\s*([A-Za-z][\w:-]*)(?=\s|\/?>)/u);
  if (!openingTagMatch) {
    return undefined;
  }

  const name = normalizeTagName(openingTagMatch[1]);

  return {
    kind: 'open',
    name,
    selfClosing: /\/\s*>$/u.test(trimmedValue) || VOID_ELEMENT_NAMES.has(name),
  };
}

function normalizeTagName(name: string): string {
  return name.toLowerCase();
}

function closeOpenTag(
  openTags: OpenTagEntry[],
  closingTagName: string,
  endLine: number,
  ranges: vscode.FoldingRange[],
): void {
  for (let index = openTags.length - 1; index >= 0; index -= 1) {
    if (openTags[index].name !== closingTagName) {
      continue;
    }

    const [matchingTag] = openTags.splice(index, openTags.length - index);
    if (matchingTag && endLine > matchingTag.line) {
      ranges.push(
        new vscode.FoldingRange(
          matchingTag.line,
          endLine,
          vscode.FoldingRangeKind.Region,
        ),
      );
    }
    return;
  }
}
