
import React, { useRef } from 'react';

interface FileSelectScreenProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileSelectScreen: React.FC<FileSelectScreenProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-800/50 border border-slate-700/50 rounded-2xl">
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
          프로젝트 분석 시작하기
        </h2>
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          AI 기반 분석 및 시각화를 시작하려면 아래 버튼을 눌러 프로젝트 폴더를 선택하세요.
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          // @ts-ignore
          webkitdirectory="true"
          mozdirectory="true"
          directory="true"
          multiple
        />
        <button
          onClick={handleButtonClick}
          className="px-8 py-4 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-500 transition-all duration-300 transform hover:scale-105"
        >
          프로젝트 폴더 선택
        </button>
        <p className="text-sm text-slate-500 mt-6">
          코드는 사용자의 컴퓨터에만 저장됩니다. 분석을 위해 파일 구조와 일부 코드만 전송됩니다.
        </p>
      </div>
    </div>
  );
};

export default FileSelectScreen;
