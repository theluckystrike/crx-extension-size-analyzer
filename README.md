# crx-extension-size-analyzer

[![CI](https://github.com/theluckystrike/crx-extension-size-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/crx-extension-size-analyzer/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-green.svg)](https://nodejs.org/)

Analyze Chrome extension file sizes and identify bloat. Scans an extension directory, reports per-file and per-type sizes, warns about oversized files, and recommends optimizations like code splitting and image compression. Works as a CLI tool and a Node.js library.

---

INSTALL

```bash
npm install crx-extension-size-analyzer
```

---

CLI USAGE

```bash
npx crx-extension-size-analyzer ./my-extension
```

Pass the path to a Chrome extension directory or CRX file. The tool prints a formatted report covering total size, largest files, warnings, recommendations, and a breakdown by file extension.

Exits with code 1 if any warnings are generated, such as individual files over 1 MB or total extension size over 2 MB.

---

LIBRARY USAGE

```typescript
import { analyzeExtension, printAnalysis } from 'crx-extension-size-analyzer';

const analysis = analyzeExtension('./my-extension');

// Print the full formatted report to stdout
printAnalysis(analysis);

// Or work with the data directly
console.log(analysis.totalSizeFormatted);
console.log(analysis.fileCount);
console.log(analysis.warnings.length);

analysis.largestFiles.forEach(f => {
  console.log(f.path, f.sizeFormatted);
});
```

---

API

analyzeExtension(path, options?)

Scans an extension directory and returns a SizeAnalysis object.

Options

- maxFileSize (number, default 1048576) - Byte threshold that triggers a file-size warning
- extensionsToAlert (string[], default .js .css .png .jpg .woff2 .json) - File types to monitor
- ignorePatterns (string[], default node_modules .git dist *.map) - Paths and globs to skip during scanning

printAnalysis(analysis)

Prints a formatted report to stdout. Includes the top 10 largest files, all warnings, all recommendations, and file counts grouped by extension.

---

TYPES

```typescript
interface SizeAnalysis {
  totalSize: number;
  totalSizeFormatted: string;
  fileCount: number;
  files: FileInfo[];
  largestFiles: FileInfo[];
  filesByExtension: Map<string, FileInfo[]>;
  warnings: string[];
  recommendations: string[];
}

interface FileInfo {
  path: string;
  size: number;
  sizeFormatted: string;
  extension: string;
}

interface AnalyzerOptions {
  maxFileSize?: number;
  extensionsToAlert?: string[];
  ignorePatterns?: string[];
}
```

---

WHAT IT DETECTS

- Individual files exceeding the maxFileSize threshold (default 1 MB)
- Total extension size over 2 MB, which may hit Chrome Web Store limits
- Large JavaScript files that could benefit from code splitting
- More than 20 image files that could use sprite sheets or WebP format
- Embedded data URLs in JavaScript files that should be external assets

---

DEVELOPMENT

```bash
git clone https://github.com/theluckystrike/crx-extension-size-analyzer.git
cd crx-extension-size-analyzer
npm install
npm test
npm run build
```

Tests use Vitest and run against a bundled test extension directory.

---

CONTRIBUTING

See CONTRIBUTING.md for guidelines on submitting issues and pull requests.

---

LICENSE

MIT. See LICENSE for full text.

---

Built by theluckystrike. More tools at zovo.one.
