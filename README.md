# @zovo/crx-extension-size-analyzer

[![npm version](https://img.shields.io/npm/v/@zovo/crx-extension-size-analyzer.svg)](https://npmjs.com/package/@zovo/crx-extension-size-analyzer)
[![CI](https://github.com/theluckystrike/crx-extension-size-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/crx-extension-size-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Discord](https://img.shields.io/badge/Discord-Zovo-blueviolet.svg?logo=discord)](https://discord.gg/zovo)
[![Website](https://img.shields.io/badge/Website-zovo.one-blue)](https://zovo.one)

> Analyze Chrome extension file sizes and identify bloat. Scans an extension directory, reports per-file and per-type sizes, warns about oversized files, and recommends optimizations like code splitting and image compression. CLI tool and Node.js library.

Part of the [Zovo](https://zovo.one) family of privacy-first Chrome extension developer tools.

## Install

```bash
npm install @zovo/crx-extension-size-analyzer
```

## Quick Start

### CLI

```bash
npx @zovo/crx-extension-size-analyzer ./my-extension
```

Exits with code 1 if any warnings are generated (e.g. files over 1 MB or total size over 2 MB).

### Library

```typescript
import { analyzeExtension, printAnalysis } from '@zovo/crx-extension-size-analyzer';

const analysis = analyzeExtension('./my-extension');

// Print formatted report to console
printAnalysis(analysis);

// Or use the data directly
console.log(`Total: ${analysis.totalSizeFormatted}`);
console.log(`Files: ${analysis.fileCount}`);
console.log(`Warnings: ${analysis.warnings.length}`);

// Largest files
analysis.largestFiles.forEach(f => {
  console.log(`  ${f.path} - ${f.sizeFormatted}`);
});
```

## API

### `analyzeExtension(path, options?)`

Analyzes an extension directory and returns a `SizeAnalysis` object.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxFileSize` | `number` | `1048576` (1 MB) | Bytes threshold for file-size warnings |
| `extensionsToAlert` | `string[]` | `.js .css .png .jpg .woff2 .json` | File types to monitor |
| `ignorePatterns` | `string[]` | `node_modules .git dist *.map` | Paths/globs to skip |

### `printAnalysis(analysis)`

Prints a formatted report to stdout including largest files, warnings, recommendations, and breakdown by file extension.

### Return Types

```typescript
interface SizeAnalysis {
  totalSize: number;
  totalSizeFormatted: string;
  fileCount: number;
  files: FileInfo[];
  largestFiles: FileInfo[];          // Top 10 by size
  filesByExtension: Map<string, FileInfo[]>;
  warnings: string[];                // e.g. "file exceeds 1 MB"
  recommendations: string[];         // e.g. "split large JS files"
}

interface FileInfo {
  path: string;
  size: number;
  sizeFormatted: string;
  extension: string;
}
```

## Warnings and Recommendations

The analyzer automatically detects:

- Individual files exceeding `maxFileSize` (default 1 MB)
- Total extension size over 2 MB (Chrome Web Store limit concern)
- Large JavaScript files that could benefit from code splitting
- Excessive image files (20+) that could use sprite sheets or WebP
- Embedded data URLs that should be external assets

## See Also

### Related Zovo Repositories

- [crx-permission-analyzer](https://github.com/theluckystrike/crx-permission-analyzer) - Analyze Chrome extension permissions
- [crx-manifest-validator](https://github.com/theluckystrike/crx-manifest-validator) - Validate manifest.json files
- [chrome-extension-starter-mv3](https://github.com/theluckystrike/chrome-extension-starter-mv3) - Production-ready MV3 starter template
- [chrome-storage-plus](https://github.com/theluckystrike/chrome-storage-plus) - Type-safe storage wrapper

### Zovo Chrome Extensions

- [Zovo Tab Manager](https://chrome.google.com/webstore/detail/zovo-tab-manager) - Manage tabs efficiently
- [Zovo Focus](https://chrome.google.com/webstore/detail/zovo-focus) - Block distractions
- [Zovo Permissions Scanner](https://chrome.google.com/webstore/detail/zovo-permissions-scanner) - Check extension privacy grades

Visit [zovo.one](https://zovo.one) for more information.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/size-analysis`
3. **Make** your changes and add tests
4. **Test** your changes: `npm test`
5. **Commit** your changes: `git commit -m 'Add new optimization'`
6. **Push** to the branch: `git push origin feature/size-analysis`
7. **Submit** a Pull Request

## License

MIT — [Zovo](https://zovo.one)

---

*Built by developers, for developers. No compromises on privacy.*
