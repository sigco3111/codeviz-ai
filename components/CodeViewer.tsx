
import React, { useEffect, useRef } from 'react';
import { FileInfo } from '../types';

interface CodeViewerProps {
  file: FileInfo | null;
  highlightLine?: number;
  onClose: () => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file, highlightLine, onClose }) => {
  const highlightRef = useRef<HTMLSpanElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else if (preRef.current) {
      // If there's no highlight, scroll to the top when the file changes
      preRef.current.scrollTop = 0;
    }
  }, [file, highlightLine]);

  const renderHighlightedCode = () => {
    if (!file) return '이 파일은 비어 있습니다.';
    // Handle files with no content
    if (!file.content) return '';
    if (!highlightLine) return file.content;

    const lines = file.content.split('\n');
    if (highlightLine < 1 || highlightLine > lines.length) {
      return file.content; // Invalid line number
    }

    return lines.map((line, index) => {
      const isHighlighted = index + 1 === highlightLine;
      if (isHighlighted) {
        return (
          <span key={index} ref={highlightRef} className="bg-sky-800/60 block -mx-4 px-4 rounded-sm">
            {line}
          </span>
        );
      }
      return (
        <span key={index} className="block">
          {line}
        </span>
      );
    });
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
        <p>파일 트리에서 파일을 선택하여 내용을 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl flex flex-col h-full shadow-2xl shadow-slate-950/20">
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50 flex justify-between items-center gap-4">
        <h3 className="font-mono text-base text-slate-200 truncate" title={file.path}>{file.path}</h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 rounded-full hover:bg-slate-600 hover:text-white transition-colors flex-shrink-0"
          title="분석 개요로 돌아가기"
          aria-label="Close code viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-auto flex-grow p-4">
        <pre ref={preRef} className="text-sm text-slate-300 whitespace-pre-wrap break-words">
          <code>
            {renderHighlightedCode()}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;
