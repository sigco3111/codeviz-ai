
import React, { useState, useCallback, useMemo } from 'react';
import { AnalysisResult, FileInfo, DependencyInfo, PackageJson, ComplexityReport, FileTreeNode } from './types';
import { processFiles, buildFileTree, filterFileTree } from './utils/fileUtils';
import { processDependencies } from './services/npmService';
import { analyzeComplexity } from './services/complexityService';
import { useApiKey } from './hooks/useApiKey';
import FileSelectScreen from './components/FileSelectScreen';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';
import ApiKeyManager from './components/ApiKeyManager';
import ChartCard from './components/ChartCard';
import SummaryCard from './components/SummaryCard';
import DependencyCard from './components/DependencyCard';
import ComplexityCard from './components/ComplexityCard';
import FileTreeView from './components/FileTreeView';

const RESOURCE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'woff', 'woff2', 'ttf', 'eot',
  'css', 'scss', 'sass', 'less', 'html', 'htm', 'xml', 'json', 'md', 'markdown', 'yaml', 'yml',
  'lock', 'zip', 'rar', 'tar', 'gz', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
]);

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiKey, isKeyAvailable, isEnvKey, userApiKey, saveUserApiKey, isMounted } = useApiKey();
  
  const [selectedFile, setSelectedFile] =useState<FileInfo | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | undefined>(undefined);
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);

  const filesByPath = useMemo(() => 
    analysisResult ? new Map(analysisResult.files.map(f => [f.path, f])) : new Map(),
    [analysisResult]
  );

  const filteredFileTree = useMemo(() => {
    if (!analysisResult) return null;
    if (!languageFilter) return analysisResult.fileTree;
    const filtered = filterFileTree(analysisResult.fileTree, languageFilter);
    return (filtered && filtered.children && filtered.children.length > 0) ? filtered : null;
  }, [analysisResult, languageFilter]);

  const handleFileSelectFromTree = useCallback((path: string, line?: number) => {
    const file = filesByPath.get(path);
    if (file) {
      setSelectedFile(file);
      setHighlightLine(line);
    }
    if (languageFilter) {
      setLanguageFilter(null);
    }
  }, [filesByPath, languageFilter]);

  const handleCloseCodeViewer = useCallback(() => {
    setSelectedFile(null);
    setHighlightLine(undefined);
  }, []);

  const handleLanguageFilter = useCallback((lang: string | null) => {
    setLanguageFilter(prev => (prev === lang ? null : lang));
    setSelectedFile(null);
    setHighlightLine(undefined);
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSelectedFile(null);

    try {
      const allProcessedFiles: FileInfo[] = await processFiles(fileList);
      const files = allProcessedFiles.filter(file => !file.path.split('/').includes('.git'));
      const totalFiles = files.length;
      const totalLinesOfCode = files.reduce((acc, file) => acc + file.content.split('\n').length, 0);
      const codeFiles = files.filter(file => !RESOURCE_EXTENSIONS.has(file.extension.toLowerCase()));
      const languageDistribution = codeFiles.reduce((acc, file) => {
        const ext = file.extension || 'other';
        acc[ext] = (acc[ext] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      const fileSizes = codeFiles.map(f => ({ name: f.name, path: f.path, size: f.size }));
      const fileTree = buildFileTree(files);

      let dependencies: DependencyInfo[] = [];
      let devDependencies: DependencyInfo[] = [];
      const packageJsonFile = files.find(f => f.name === 'package.json');
      if (packageJsonFile?.content) {
        try {
          const parsedPackageJson: PackageJson = JSON.parse(packageJsonFile.content);
          const [deps, devDeps] = await Promise.all([
            parsedPackageJson.dependencies ? processDependencies(parsedPackageJson.dependencies) : Promise.resolve([]),
            parsedPackageJson.devDependencies ? processDependencies(parsedPackageJson.devDependencies) : Promise.resolve([])
          ]);
          dependencies = deps;
          devDependencies = devDeps;
        } catch (jsonError) {
          console.warn("package.json을 파싱할 수 없습니다:", jsonError);
        }
      }
      
      const complexityAnalysis = analyzeComplexity(files);

      const result: AnalysisResult = {
        totalFiles, totalLinesOfCode, languageDistribution, fileSizes, fileTree,
        geminiAnalysis: null, tokenCount: 0, files, dependencies, devDependencies, complexityAnalysis,
      };

      setAnalysisResult(result);
    } catch (e: any) {
      console.error("Analysis failed:", e);
      setError(e.message || "분석 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setSelectedFile(null);
    setLanguageFilter(null);
  };

  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-800/50 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">분석 실패</h2>
          <p className="text-slate-400 mb-6 max-w-md">{error}</p>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (!analysisResult) {
      return <FileSelectScreen onFileSelect={handleFileSelect} />;
    }
    return (
      <Dashboard
        result={analysisResult}
        setResult={setAnalysisResult}
        apiKey={apiKey}
        isKeyAvailable={isKeyAvailable}
        isMounted={isMounted}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelectFromTree}
        highlightLine={highlightLine}
        onCloseCodeViewer={handleCloseCodeViewer}
        languageFilter={languageFilter}
        onLanguageFilter={handleLanguageFilter}
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">
          CodeViz <span className="text-sky-400">AI</span>
        </h1>
        {analysisResult && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
          >
            다른 프로젝트 분석
          </button>
        )}
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <aside className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto">
          <ApiKeyManager
            isEnvKey={isEnvKey}
            isKeyAvailable={isKeyAvailable}
            userApiKey={userApiKey || ''}
            onSaveKey={saveUserApiKey}
            isMounted={isMounted}
          />
          {analysisResult && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <SummaryCard title="총 파일 수" value={analysisResult.totalFiles.toLocaleString()} />
                <SummaryCard title="코드 라인 수" value={analysisResult.totalLinesOfCode.toLocaleString()} />
                <SummaryCard title="기술 스택 등급" value={analysisResult.geminiAnalysis?.codeQuality.rating || 'N/A'} isRating={true} />
                <SummaryCard title="사용된 토큰" value={analysisResult.tokenCount.toLocaleString()} />
              </div>

              {(analysisResult.dependencies.length > 0 || analysisResult.devDependencies.length > 0) && (
                <ChartCard title="의존성 분석">
                  <DependencyCard title="Dependencies" dependencies={analysisResult.dependencies} />
                  <DependencyCard title="Dev Dependencies" dependencies={analysisResult.devDependencies} />
                </ChartCard>
              )}
              
              {analysisResult.complexityAnalysis.length > 0 && (
                <ChartCard title="코드 복잡도">
                  <ComplexityCard
                    data={analysisResult.complexityAnalysis}
                    onFunctionSelect={(report) => handleFileSelectFromTree(report.filePath, report.line)}
                  />
                </ChartCard>
              )}

              <ChartCard title="프로젝트 구조" className="flex-grow flex flex-col min-h-0">
                <div className="h-full overflow-y-auto -m-6 p-4">
                  {languageFilter && (
                    <div className="px-2 pb-2 mb-2 border-b border-slate-700/50 flex justify-between items-center">
                      <span className="text-sm text-slate-400">
                        필터링: <span className="font-semibold text-sky-400">.{languageFilter}</span>
                      </span>
                      <button onClick={() => handleLanguageFilter(null)} className="text-xs text-slate-500 hover:text-slate-300" title="필터 초기화">초기화</button>
                    </div>
                  )}
                  {filteredFileTree ? (
                    <FileTreeView node={filteredFileTree} onFileSelect={path => handleFileSelectFromTree(path)} selectedFilePath={selectedFile?.path || null}/>
                  ) : (
                    <div className="text-center text-slate-500 p-4">.{languageFilter}와(과) 일치하는 파일이 없습니다.</div>
                  )}
                </div>
              </ChartCard>
            </>
          )}
        </aside>

        <div className="lg:col-span-9 flex flex-col min-h-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
