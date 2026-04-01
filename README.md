# Markdown Code Block Fold Support

[![VS Code Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/YiJie.markdown-codeblock-fold-support?style=flat-square&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=YiJie.markdown-codeblock-fold-support)
[![VS Code Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/YiJie.markdown-codeblock-fold-support?style=flat-square&label=Installs)](https://marketplace.visualstudio.com/items?itemName=YiJie.markdown-codeblock-fold-support)
[![VS Code Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/YiJie.markdown-codeblock-fold-support?style=flat-square&label=Rating)](https://marketplace.visualstudio.com/items?itemName=YiJie.markdown-codeblock-fold-support)
[![GitHub Release](https://img.shields.io/github/v/release/NWYLZW/vscode-md-codeblock-fold-support?style=flat-square&label=GitHub%20Release)](https://github.com/NWYLZW/vscode-md-codeblock-fold-support/releases)

This extension adds folding ranges for structured content inside Markdown fenced code blocks.

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=YiJie.markdown-codeblock-fold-support).

## Current scope

- Supports `json`, `jsonc`, `javascript`, `typescript`, `jsx`, `tsx`, `css`, `scss`, `less`, `yaml`, `yml`, `html`, `xml`, `svg`, `vue`, and `svelte` fenced blocks inside Markdown
- Keeps the folding engine language-pluggable for more embedded languages later
- Works alongside the normal Markdown code fence folding

## Usage

Open a Markdown file containing a fenced JSON block such as:

````markdown
```json
{
  "outer": {
    "items": [
      {
        "value": 1
      }
    ]
  }
}
```
````

Then use the normal VS Code folding controls inside the code block.

## Configuration

`markdownCodeBlockFoldSupport.enabledLanguages`

- Default: `["json", "jsonc", "javascript", "javascriptreact", "js", "jsx", "typescript", "typescriptreact", "ts", "tsx", "mjs", "cjs", "css", "scss", "less", "yaml", "yml", "html", "xml", "xhtml", "svg", "vue", "svelte"]`
- Controls which fenced languages contribute extra folding ranges in Markdown documents

## Development

- `npm install`
- `npm run compile`
- Press `F5` in VS Code to launch the extension host
- `npm test` to run the integration test suite
- `npm run package` to build a `.vsix`

## Release

- Run `npm test`
- Run `npm run package:release`
- Commit the generated `release-assets/markdown-codeblock-fold-support-<version>.vsix`
- Push to `main`
- When `package.json` contains a version that does not already have a matching `vX.Y.Z` tag, GitHub Actions will tag and publish a GitHub Release automatically
- A separate GitHub Actions workflow publishes the same VSIX to the VS Code Marketplace using the `VSCE_PAT` repository secret
