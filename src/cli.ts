#!/usr/bin/env node

/**
 * CLI entry point for crx-extension-size-analyzer
 */

import { analyzeExtension, printAnalysis } from './analyzer.js';
import * as path from 'path';

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: crx-extension-size-analyzer <extension-path>');
    console.error('');
    console.error('Arguments:');
    console.error('  <extension-path>  Path to Chrome extension directory or CRX file');
    process.exit(1);
  }

  const extensionPath = path.resolve(args[0]);

  try {
    const analysis = analyzeExtension(extensionPath);
    printAnalysis(analysis);

    // Exit with warning code if there are issues
    if (analysis.warnings.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
