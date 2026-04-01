# Markdown Code Block Fold Support

This extension adds folding ranges for structured content inside Markdown fenced code blocks.

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

- Push to `main`
- When `package.json` contains a version that does not already have a matching `vX.Y.Z` tag, GitHub Actions will test, package, tag, and publish a GitHub Release automatically
- The release asset is the packaged `.vsix`
