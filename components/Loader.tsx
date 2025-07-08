import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute w-full h-full border-4 border-slate-700 rounded-full"></div>
        <div className="absolute w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-lg text-slate-400 animate-pulse">코드베이스 분석 중...</p>
    </div>
  );
};

export default Loader;