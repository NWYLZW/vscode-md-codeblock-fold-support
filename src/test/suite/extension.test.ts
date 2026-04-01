import * as assert from 'node:assert/strict';

import * as vscode from 'vscode';

suite('Markdown code block folding', () => {
  suiteSetup(async () => {
    const extension = vscode.extensions.getExtension(
      'bytedance.markdown-codeblock-fold-support',
    );

    assert.ok(extension, 'The extension should be available in the test host.');
    await extension.activate();
  });

  test('provides folding ranges for nested JSON structures', async () => {
    const encodedRanges = await getEncodedFoldingRanges([
      '# Sample',
      '',
      '```json',
      '{',
      '  "outer": {',
      '    "items": [',
      '      {',
      '        "value": 1',
      '      }',
      '    ]',
      '  },',
      '  "other": 2',
      '}',
      '```',
    ]);
    const expectedRanges = ['3:12', '4:10', '5:9', '6:8'];

    for (const expectedRange of expectedRanges) {
      assert.ok(
        encodedRanges.includes(expectedRange),
        `Expected folding range ${expectedRange}. Actual ranges: ${encodedRanges.join(', ')}`,
      );
    }
  });

  test('provides folding ranges for TypeScript fenced blocks', async () => {
    const encodedRanges = await getEncodedFoldingRanges([
      '```ts',
      'function buildConfig() {',
      '  // { ignored }',
      '  const text = "{ ignored }";',
      '  const styles = [',
      '    {',
      '      name: "alpha",',
      '    },',
      '  ];',
      '  return {',
      '    styles,',
      '  };',
      '}',
      '```',
    ]);
    const expectedRanges = ['1:12', '4:8', '5:7', '9:11'];

    for (const expectedRange of expectedRanges) {
      assert.ok(
        encodedRanges.includes(expectedRange),
        `Expected folding range ${expectedRange}. Actual ranges: ${encodedRanges.join(', ')}`,
      );
    }
  });

  test('provides folding ranges for SCSS fenced blocks', async () => {
    const encodedRanges = await getEncodedFoldingRanges([
      '```scss',
      '.card {',
      '  /* { ignored } */',
      '  color: red;',
      '  .item {',
      '    content: "{ ignored }";',
      '  }',
      '}',
      '```',
    ]);
    const expectedRanges = ['1:7', '4:6'];

    for (const expectedRange of expectedRanges) {
      assert.ok(
        encodedRanges.includes(expectedRange),
        `Expected folding range ${expectedRange}. Actual ranges: ${encodedRanges.join(', ')}`,
      );
    }
  });

  test('provides folding ranges for YAML fenced blocks', async () => {
    const encodedRanges = await getEncodedFoldingRanges([
      '```yaml',
      'root:',
      '  items:',
      '    - name: alpha',
      '      enabled: true',
      '    - name: beta',
      '  theme:',
      '    colors:',
      '      primary: blue',
      '```',
    ]);
    const expectedRanges = ['1:8', '2:5', '3:4', '6:8', '7:8'];

    for (const expectedRange of expectedRanges) {
      assert.ok(
        encodedRanges.includes(expectedRange),
        `Expected folding range ${expectedRange}. Actual ranges: ${encodedRanges.join(', ')}`,
      );
    }
  });

  test('provides folding ranges for Vue fenced blocks', async () => {
    const encodedRanges = await getEncodedFoldingRanges([
      '```vue',
      '<template>',
      '  <section>',
      '    <div>Hello</div>',
      '  </section>',
      '</template>',
      '<script>',
      '  const value = "</not-a-tag>";',
      '  if (value) {',
      '    console.log(value);',
      '  }',
      '</script>',
      '```',
    ]);
    const expectedRanges = ['1:5', '2:4', '6:11'];

    for (const expectedRange of expectedRanges) {
      assert.ok(
        encodedRanges.includes(expectedRange),
        `Expected folding range ${expectedRange}. Actual ranges: ${encodedRanges.join(', ')}`,
      );
    }
  });

  test('ignores unsupported fenced block languages', async () => {
    const encodedRanges = await getEncodedFoldingRanges([
      '```bash',
      'if [ "$foo" = "bar" ]; then',
      '  echo "hello"',
      'fi',
      '```',
    ]);

    assert.ok(
      !encodedRanges.includes('1:3'),
      'Unsupported fenced blocks should not receive extra ranges from this extension.',
    );
  });
});

async function getEncodedFoldingRanges(
  contentLines: readonly string[],
): Promise<string[]> {
  const document = await vscode.workspace.openTextDocument({
    language: 'markdown',
    content: contentLines.join('\n'),
  });

  await vscode.window.showTextDocument(document);

  const foldingRanges =
    await vscode.commands.executeCommand<vscode.FoldingRange[]>(
      'vscode.executeFoldingRangeProvider',
      document.uri,
    );

  return (foldingRanges ?? []).map((range) => `${range.start}:${range.end}`);
}
