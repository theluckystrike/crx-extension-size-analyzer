import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { analyzeExtension, printAnalysis } from '../src/analyzer.js';

const TEST_EXTENSION_PATH = path.join(__dirname, 'test-extension');

describe('crx-extension-size-analyzer', () => {
  describe('analyzeExtension', () => {
    it('should analyze a valid extension directory', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      expect(analysis.totalSize).toBeGreaterThan(0);
      expect(analysis.fileCount).toBeGreaterThan(0);
      expect(analysis.totalSizeFormatted).toBeDefined();
      expect(analysis.files).toBeInstanceOf(Array);
      expect(analysis.largestFiles).toBeInstanceOf(Array);
      expect(analysis.filesByExtension).toBeInstanceOf(Map);
      expect(analysis.warnings).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should calculate total size correctly', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      const calculatedTotal = analysis.files.reduce((sum, f) => sum + f.size, 0);
      expect(analysis.totalSize).toBe(calculatedTotal);
    });

    it('should sort files by size descending', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      for (let i = 1; i < analysis.files.length; i++) {
        expect(analysis.files[i - 1].size).toBeGreaterThanOrEqual(analysis.files[i].size);
      }
    });

    it('should identify files by extension', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      expect(analysis.filesByExtension.size).toBeGreaterThan(0);
    });

    it('should have correct file paths (relative)', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      analysis.files.forEach(file => {
        expect(file.path).not.toContain(TEST_EXTENSION_PATH);
      });
    });

    it('should format file sizes correctly', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      analysis.files.forEach(file => {
        expect(file.sizeFormatted).toMatch(/^\d+(\.\d+)? (B|KB|MB|GB)$/);
      });
    });

    it('should provide top 10 largest files', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      expect(analysis.largestFiles.length).toBeLessThanOrEqual(10);
      // Largest files should be at the top
      for (let i = 1; i < analysis.largestFiles.length; i++) {
        expect(analysis.largestFiles[i - 1].size).toBeGreaterThanOrEqual(analysis.largestFiles[i].size);
      }
    });

    it('should throw error for non-existent path', () => {
      expect(() => {
        analyzeExtension('/non/existent/path');
      }).toThrow();
    });

    it('should detect large files as warnings', () => {
      // Create a large file in test extension
      const largeFilePath = path.join(TEST_EXTENSION_PATH, 'large-file.js');
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
      fs.writeFileSync(largeFilePath, largeContent);

      const analysis = analyzeExtension(TEST_EXTENSION_PATH, { maxFileSize: 1024 * 1024 });

      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.warnings.some(w => w.includes('large-file.js'))).toBe(true);

      // Cleanup
      fs.unlinkSync(largeFilePath);
    });

    it('should work with custom max file size', () => {
      // Create a medium file
      const mediumFilePath = path.join(TEST_EXTENSION_PATH, 'medium-file.js');
      fs.writeFileSync(mediumFilePath, 'x'.repeat(500 * 1024)); // 500KB

      const analysis = analyzeExtension(TEST_EXTENSION_PATH, { maxFileSize: 100 * 1024 });

      expect(analysis.warnings.some(w => w.includes('medium-file.js'))).toBe(true);

      // Cleanup
      fs.unlinkSync(mediumFilePath);
    });

    it('should ignore node_modules and .git directories', () => {
      // Create node_modules with a file
      const nodeModulesPath = path.join(TEST_EXTENSION_PATH, 'node_modules', 'test-file.js');
      fs.mkdirSync(path.dirname(nodeModulesPath), { recursive: true });
      fs.writeFileSync(nodeModulesPath, 'should be ignored');

      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      const nodeModulesFiles = analysis.files.filter(f => f.path.includes('node_modules'));
      expect(nodeModulesFiles.length).toBe(0);

      // Cleanup
      fs.rmSync(path.join(TEST_EXTENSION_PATH, 'node_modules'), { recursive: true });
    });

    it('should handle empty extension directory', () => {
      const emptyDir = path.join(__dirname, 'empty-test');
      fs.mkdirSync(emptyDir, { recursive: true });

      const analysis = analyzeExtension(emptyDir);

      expect(analysis.totalSize).toBe(0);
      expect(analysis.fileCount).toBe(0);
      expect(analysis.files.length).toBe(0);

      // Cleanup
      fs.rmdirSync(emptyDir);
    });
  });

  describe('printAnalysis', () => {
    it('should not throw when printing analysis', () => {
      const analysis = analyzeExtension(TEST_EXTENSION_PATH);

      expect(() => {
        printAnalysis(analysis);
      }).not.toThrow();
    });
  });
});
