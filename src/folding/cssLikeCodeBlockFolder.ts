import { BracketCodeBlockFolder } from './bracketCodeBlockFolder';

export class CssLikeCodeBlockFolder extends BracketCodeBlockFolder {
  constructor() {
    super({
      languageIds: ['css', 'scss', 'less'],
      delimiterPairs: [{ open: '{', close: '}' }],
      stringDelimiters: ['"', "'"],
      blockCommentTokens: [{ start: '/*', end: '*/' }],
    });
  }
}
