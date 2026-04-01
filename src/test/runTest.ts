import * as path from 'node:path';

import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    await runTests({
      version: '1.111.0',
      extensionDevelopmentPath: path.resolve(__dirname, '../..'),
      extensionTestsPath: path.resolve(__dirname, './suite/index'),
      launchArgs: ['--disable-extensions'],
    });
  } catch (error) {
    console.error('Failed to run VS Code extension tests.');
    console.error(error);
    process.exit(1);
  }
}

void main();
