import { BracketCodeBlockFolder } from './bracketCodeBlockFolder';

export class JsonCodeBlockFolder extends BracketCodeBlockFolder {
  constructor() {
    super({
      languageIds: ['json', 'jsonc'],
      delimiterPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
      ],
      stringDelimiters: ['"'],
      lineCommentTokens: ['//'],
      blockCommentTokens: [{ start: '/*', end: '*/' }],
    });
  }
}
