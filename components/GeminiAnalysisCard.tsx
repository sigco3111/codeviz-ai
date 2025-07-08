
import React, { useState } from 'react';
import { GeminiAnalysis } from '../types';

interface GeminiAnalysisCardProps {
  analysis: GeminiAnalysis | null;
  isLoading: boolean;
  isKeyMissing: boolean;
  error: string | null;
  onRetry?: () => void;
}

const TABS = {
  OVERVIEW: 'overview',
  QUALITY: 'quality',
  SUGGESTIONS: 'suggestions',
  ISSUES: 'issues',
};

const TAB_CONFIG = {
  [TABS.OVERVIEW]: { label: 'AI 개요' },
  [TABS.QUALITY]: { label: '코드 품질' },
  [TABS.SUGGESTIONS]: { label: '개선 제안' },
  [TABS.ISSUES]: { label: '잠재적 이슈' },
};

const CardState: React.FC<{ icon: React.ReactNode, title: string, message: string, children?: React.ReactNode }> = ({ icon, title, message, children }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="text-sky-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-slate-200 mb-2">{title}</h3>
    <p className="text-slate-400 max-w-sm">{message}</p>
    {children && <div className="mt-6">{children}</div>}
  </div>
);

const GeminiAnalysisCard: React.FC<GeminiAnalysisCardProps> = ({ analysis, isLoading, isKeyMissing, error, onRetry }) => {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardState
          icon={<div className="relative flex items-center justify-center w-16 h-16"><div className="absolute w-full h-full border-4 border-slate-700 rounded-full"></div><div className="absolute w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div></div>}
          title="AI 분석 중..."
          message="Gemini가 코드베이스를 분석하고 있습니다. 잠시만 기다려주세요."
        />
      );
    }

    if (error) {
       return (
        <CardState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="분석 오류"
          message={`AI 분석을 완료할 수 없습니다. 오류: ${error}`}
        >
          {onRetry && (
            <button onClick={onRetry} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors">
              재시도
            </button>
          )}
        </CardState>
      );
    }
    
    if (isKeyMissing) {
      return (
        <CardState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a1 1 0 011-1h2.157a6 6 0 0110.425-4.472zM12 11a3 3 0 100-6 3 3 0 000 6z" /></svg>}
          title="Gemini API 키 필요"
          message="AI 분석을 시작하려면 좌측 패널에서 유효한 Gemini API 키를 입력하고 저장해주세요."
        />
      );
    }

    if (!analysis) {
      // This state should ideally not be reached if the logic is correct
      return (
         <CardState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="분석 대기 중"
          message="AI 분석 데이터를 기다리고 있습니다..."
        />
      );
    }

    switch (activeTab) {
      case TABS.QUALITY:
        return (
          <>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">코드 품질 등급: {analysis.codeQuality?.rating || 'N/A'}</h3>
            <p className="text-slate-300 italic">"{analysis.codeQuality?.summary || '품질 요약을 불러오는 중...'}"</p>
          </>
        );
      case TABS.SUGGESTIONS:
        return (
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            {analysis.codeQuality?.suggestions && analysis.codeQuality.suggestions.length > 0 ? (
              analysis.codeQuality.suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)
            ) : <li className="list-none"><p className="text-slate-400 text-sm">구체적인 개선 제안이 없습니다.</p></li>}
          </ul>
        );
      case TABS.ISSUES:
        return (
          <ul className="list-disc list-inside space-y-2 text-slate-300">
             {analysis.potentialIssues && analysis.potentialIssues.length > 0 ? (
              analysis.potentialIssues.map((issue, index) => <li key={index}>{issue}</li>)
            ) : <li className="list-none"><p className="text-slate-400 text-sm">특별한 잠재적 이슈가 감지되지 않았습니다.</p></li>}
          </ul>
        );
      case TABS.OVERVIEW:
      default:
        return (
          <div className="flex flex-col gap-4">
             <div>
                <h3 className="text-lg font-semibold text-sky-400 mb-3">프로젝트 개요</h3>
                <p className="text-slate-300">{analysis.overview || '분석 개요를 불러오는 중...'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-sky-400 mb-3">감지된 기술 스택</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.techStack && analysis.techStack.length > 0 ? analysis.techStack.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-700 text-slate-200 text-sm font-medium rounded-full">{tech}</span>
                )) : <p className="text-slate-400 text-sm">감지된 기술 스택이 없습니다.</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  const hasTabs = !isLoading && !error && !isKeyMissing && analysis;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-950/20 flex flex-col h-full">
      {hasTabs && (
        <div className="flex-shrink-0 border-b border-slate-700/50">
          <nav className="flex space-x-1 sm:space-x-2 p-2">
            {Object.entries(TAB_CONFIG).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 sm:flex-auto px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 truncate ${
                  activeTab === key
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}
      <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};

export default GeminiAnalysisCard;
