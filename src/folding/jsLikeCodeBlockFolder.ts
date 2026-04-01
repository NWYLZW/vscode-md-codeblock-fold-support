import { BracketCodeBlockFolder } from './bracketCodeBlockFolder';

export class JsLikeCodeBlockFolder extends BracketCodeBlockFolder {
  constructor() {
    super({
      languageIds: [
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
      ],
      delimiterPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
      ],
      stringDelimiters: ['"', "'", '`'],
      lineCommentTokens: ['//'],
      blockCommentTokens: [{ start: '/*', end: '*/' }],
    });
  }
}
