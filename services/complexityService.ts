import { FileInfo, ComplexityReport } from '../types';

declare const escomplex: any;

const SUPPORTED_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];

/**
 * Analyzes the cyclomatic complexity of functions in the given files.
 * @param files The array of file information.
 * @returns An array of complexity reports, sorted from most to least complex.
 */
export function analyzeComplexity(files: FileInfo[]): ComplexityReport[] {
  const reports: ComplexityReport[] = [];

  const relevantFiles = files.filter(file => 
    SUPPORTED_EXTENSIONS.includes(file.extension) && file.content
  );

  for (const file of relevantFiles) {
    try {
      const report = escomplex.analyse(file.content, {
        // escomplex options if needed
      });
      
      for (const func of report.functions) {
        reports.push({
          filePath: file.path,
          functionName: func.name || '<anonymous>',
          complexity: func.cyclomatic,
          line: func.line,
        });
      }
    } catch (error) {
      // Don't fail the whole analysis if one file is unparsable
      console.warn(`Could not analyze complexity for ${file.path}:`, error);
    }
  }

  // Sort all reports from all files by complexity, descending
  return reports.sort((a, b) => b.complexity - a.complexity);
}
