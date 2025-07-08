
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  content: string;
  extension: string;
}

export interface LanguageDistribution {
  [key: string]: number;
}

export interface GeminiAnalysis {
  overview: string;
  techStack: string[];
  codeQuality: {
    rating: string;
    summary: string;
    suggestions: string[];
  };
  potentialIssues: string[];
}

export interface DisplayChatMessage {
  role: 'user' | 'model';
  text: string;
}

// New type for package.json dependencies
export interface DependencyInfo {
  name: string;
  version: string;
  latestVersion: string | null;
}

// New type for parsed package.json
export interface PackageJson {
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

// New type for complexity analysis
export interface ComplexityReport {
  filePath: string;
  functionName: string;
  complexity: number;
  line: number;
}

export interface AnalysisResult {
  totalFiles: number;
  totalLinesOfCode: number;
  languageDistribution: LanguageDistribution;
  fileSizes: { name: string; path: string; size: number }[];
  fileTree: FileTreeNode;
  geminiAnalysis: GeminiAnalysis | null;
  tokenCount: number;
  files: FileInfo[];
  // Properties for dependency analysis
  dependencies: DependencyInfo[];
  devDependencies: DependencyInfo[];
  // New property for complexity analysis
  complexityAnalysis: ComplexityReport[];
}

export interface FileTreeNode {
  name:string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  path: string;
}