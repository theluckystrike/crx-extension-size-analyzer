/**
 * Chrome Extension Size Analyzer
 * Analyzes extension file sizes and identifies bloat
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FileInfo {
  path: string;
  size: number;
  sizeFormatted: string;
  extension: string;
}

export interface SizeAnalysis {
  totalSize: number;
  totalSizeFormatted: string;
  fileCount: number;
  files: FileInfo[];
  largestFiles: FileInfo[];
  filesByExtension: Map<string, FileInfo[]>;
  warnings: string[];
  recommendations: string[];
}

export interface AnalyzerOptions {
  maxFileSize?: number; // in bytes, default 1MB
  extensionsToAlert?: string[];
  ignorePatterns?: string[];
}

const DEFAULT_OPTIONS: Required<AnalyzerOptions> = {
  maxFileSize: 1024 * 1024, // 1MB
  extensionsToAlert: ['.js', '.css', '.png', '.jpg', '.woff2', '.json'],
  ignorePatterns: ['node_modules', '.git', 'dist', '*.map'],
};

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  const fileName = path.basename(filePath);
  return ignorePatterns.some(pattern => {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      return fileName.endsWith(ext);
    }
    return filePath.includes(pattern);
  });
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], ignorePatterns: string[]): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldIgnore(fullPath, ignorePatterns)) {
        getAllFiles(fullPath, arrayOfFiles, ignorePatterns);
      }
    } else {
      if (!shouldIgnore(fullPath, ignorePatterns)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Analyze a Chrome extension directory
 */
export function analyzeExtension(extensionPath: string, options: AnalyzerOptions = {}): SizeAnalysis {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!fs.existsSync(extensionPath)) {
    throw new Error(`Extension path does not exist: ${extensionPath}`);
  }

  const stat = fs.statSync(extensionPath);
  const isDirectory = stat.isDirectory();

  let files: string[];
  let basePath: string;

  if (isDirectory) {
    basePath = extensionPath;
    files = getAllFiles(extensionPath, [], opts.ignorePatterns);
  } else {
    // Handle CRX/ZIP file
    basePath = path.dirname(extensionPath);
    // For now, just note it's a packed file
    files = [extensionPath];
  }

  const fileInfos: FileInfo[] = files.map(filePath => {
    const fileStat = fs.statSync(filePath);
    const relativePath = path.relative(basePath, filePath);
    return {
      path: relativePath,
      size: fileStat.size,
      sizeFormatted: formatSize(fileStat.size),
      extension: path.extname(filePath).toLowerCase(),
    };
  });

  // Sort by size descending
  fileInfos.sort((a, b) => b.size - a.size);

  const totalSize = fileInfos.reduce((sum, f) => sum + f.size, 0);

  // Group by extension
  const filesByExtension = new Map<string, FileInfo[]>();
  fileInfos.forEach(file => {
    const ext = file.extension || '(no extension)';
    if (!filesByExtension.has(ext)) {
      filesByExtension.set(ext, []);
    }
    filesByExtension.get(ext)!.push(file);
  });

  // Generate warnings and recommendations
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for large files
  fileInfos.forEach(file => {
    if (file.size > opts.maxFileSize) {
      warnings.push(`${file.path} exceeds ${formatSize(opts.maxFileSize)} (${file.sizeFormatted})`);
    }
  });

  // Check for large JS files (potential for code splitting)
  const largeJsFiles = fileInfos.filter(f => f.extension === '.js' && f.size > 100 * 1024);
  if (largeJsFiles.length > 0) {
    recommendations.push(`Consider splitting ${largeJsFiles.length} large JavaScript file(s)`);
  }

  // Check for multiple similar image files
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
  const imageFiles = fileInfos.filter(f => imageExtensions.includes(f.extension));
  if (imageFiles.length > 20) {
    recommendations.push(`Consider using sprite sheets or WebP format for ${imageFiles.length} image files`);
  }

  // Check for large data URLs in JS
  const jsContentFiles = fileInfos.filter(f => f.extension === '.js');
  let dataUrlCount = 0;
  jsContentFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(basePath, file.path), 'utf-8');
      if (content.includes('data:')) {
        dataUrlCount++;
      }
    } catch {
      // Ignore read errors
    }
  });
  if (dataUrlCount > 5) {
    recommendations.push(`Found ${dataUrlCount} files with data URLs - consider using external assets`);
  }

  // Extension size warnings
  if (totalSize > 2 * 1024 * 1024) {
    warnings.push(`Extension total size (${formatSize(totalSize)}) exceeds 2MB - may hit Chrome Web Store limits`);
  }

  const largestFiles = fileInfos.slice(0, 10);

  return {
    totalSize,
    totalSizeFormatted: formatSize(totalSize),
    fileCount: fileInfos.length,
    files: fileInfos,
    largestFiles,
    filesByExtension,
    warnings,
    recommendations,
  };
}

/**
 * Print analysis results to console
 */
export function printAnalysis(analysis: SizeAnalysis): void {
  console.log('\n📦 Chrome Extension Size Analysis');
  console.log('==================================\n');
  console.log(`Total Size: ${analysis.totalSizeFormatted}`);
  console.log(`Total Files: ${analysis.fileCount}\n`);

  console.log('🔍 Largest Files:');
  analysis.largestFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file.path} - ${file.sizeFormatted}`);
  });

  if (analysis.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    analysis.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach(r => console.log(`  - ${r}`));
  }

  console.log('\n📊 Files by Extension:');
  analysis.filesByExtension.forEach((files, ext) => {
    const totalExtSize = files.reduce((sum, f) => sum + f.size, 0);
    console.log(`  ${ext}: ${files.length} files (${formatSize(totalExtSize)})`);
  });

  console.log('');
}
