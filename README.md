# @zovo/crx-extension-size-analyzer

A CLI tool and library to analyze Chrome extension file sizes and identify potential bloat.

## Features

- Analyze Chrome extension directories
- Calculate total size and file counts
- Identify largest files
- Detect oversized files that may cause issues
- Group files by extension type
- Provide recommendations for reducing extension size

## Installation

```bash
npm install -g @zovo/crx-extension-size-analyzer
```

## Usage

### CLI

```bash
crx-extension-size-analyzer /path/to/extension
```

### Library

```typescript
import { analyzeExtension, printAnalysis } from '@zovo/crx-extension-size-analyzer';

const analysis = analyzeExtension('/path/to/extension');
printAnalysis(analysis);

// Or access the data programmatically
console.log(`Total size: ${analysis.totalSizeFormatted}`);
console.log(`File count: ${analysis.fileCount}`);
console.log(`Largest files:`, analysis.largestFiles);
```

## Output Example

```
📦 Chrome Extension Size Analysis
==================================

Total Size: 1.24 MB
Total Files: 47

🔍 Largest Files:
  1. dist/bundle.js - 850.32 KB
  2. assets/images/logo.png - 120.45 KB
  3. dist/vendor.js - 95.12 KB
  4. assets/fonts/font.woff2 - 64.00 KB
  5. _locales/en/messages.json - 32.10 KB
  ...

⚠️  Warnings:
  - dist/bundle.js exceeds 1 MB (850.32 KB)

💡 Recommendations:
  - Consider splitting 1 large JavaScript file(s)
  - Consider using sprite sheets or WebP format for 23 image files

📊 Files by Extension:
  .js: 12 files (1.02 MB)
  .png: 15 files (450 KB)
  .json: 8 files (80 KB)
  .css: 5 files (25 KB)
  .html: 3 files (15 KB)
```

## API

### analyzeExtension(path: string, options?: AnalyzerOptions): SizeAnalysis

Analyzes an extension at the given path.

#### Options

- `maxFileSize`: Maximum file size in bytes before warning (default: 1MB)
- `extensionsToAlert`: Array of extensions to monitor (default: all)
- `ignorePatterns`: Patterns to ignore (default: node_modules, .git, dist, *.map)

#### Return Value

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
```

## License

MIT
