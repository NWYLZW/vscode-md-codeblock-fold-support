import { CssLikeCodeBlockFolder } from './cssLikeCodeBlockFolder';
import { HtmlLikeCodeBlockFolder } from './htmlLikeCodeBlockFolder';
import { JsLikeCodeBlockFolder } from './jsLikeCodeBlockFolder';
import { JsonCodeBlockFolder } from './jsonCodeBlockFolder';
import { CodeBlockFolder } from './types';
import { YamlCodeBlockFolder } from './yamlCodeBlockFolder';

export class CodeBlockFolderRegistry {
  private readonly foldersByLanguage = new Map<string, CodeBlockFolder>();

  constructor(folders: readonly CodeBlockFolder[]) {
    for (const folder of folders) {
      for (const languageId of folder.languageIds) {
        this.foldersByLanguage.set(normalizeLanguageId(languageId), folder);
      }
    }
  }

  get(languageId: string | undefined): CodeBlockFolder | undefined {
    if (!languageId) {
      return undefined;
    }

    return this.foldersByLanguage.get(normalizeLanguageId(languageId));
  }
}

export function createDefaultCodeBlockFolderRegistry(): CodeBlockFolderRegistry {
  return new CodeBlockFolderRegistry([
    new JsonCodeBlockFolder(),
    new JsLikeCodeBlockFolder(),
    new CssLikeCodeBlockFolder(),
    new YamlCodeBlockFolder(),
    new HtmlLikeCodeBlockFolder(),
  ]);
}

function normalizeLanguageId(languageId: string): string {
  return languageId.trim().toLowerCase();
}
