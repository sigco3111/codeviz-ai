
import React, { useState, useEffect } from 'react';

interface ApiKeyManagerProps {
  isEnvKey: boolean;
  isKeyAvailable: boolean;
  userApiKey: string;
  onSaveKey: (key: string) => void;
  isMounted: boolean;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isEnvKey, isKeyAvailable, userApiKey, onSaveKey, isMounted }) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setInputKey(userApiKey);
  }, [userApiKey]);
  
  const handleSave = () => {
    onSaveKey(inputKey);
  };
  
  if (!isMounted) {
    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-2xl animate-pulse h-[200px] sm:h-[180px]">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-full mb-3"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6 mb-4"></div>
            <div className="flex gap-2">
                <div className="h-10 bg-slate-700 rounded flex-grow"></div>
                <div className="h-10 bg-slate-700 rounded w-28"></div>
            </div>
        </div>
    );
  }

  const statusColor = isKeyAvailable ? 'text-green-400' : 'text-yellow-400';
  const statusText = isKeyAvailable ? '활성' : '필요';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-slate-950/20">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2 flex-wrap">
        <span>Gemini API 키</span>
        <span className={`flex items-center gap-1.5 text-sm font-normal ${statusColor}`}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
          {statusText}
        </span>
        <span className="text-sm font-normal text-slate-400">(보안 설정팀)</span>
      </h3>

      {isEnvKey && (
        <div className="bg-orange-900/50 border border-orange-700/50 text-orange-200 text-sm p-3 rounded-lg mb-4">
          환경 변수 키 사용 중<br/>애플리케이션에 API 키가 내장되어 있어 우선적으로 사용됩니다. 아래 입력란은 비활성화됩니다.
        </div>
      )}

      <p className="text-xs text-slate-500 mb-2">
        API 키는 브라우저의 로컬 스토리지에만 저장됩니다.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder={isEnvKey ? '환경 변수 키 사용 중' : '여기에 API 키를 입력하세요'}
              disabled={isEnvKey}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-4 pr-10 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Gemini API Key Input"
            />
            <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                disabled={isEnvKey}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
        </div>
        <button
          onClick={handleSave}
          disabled={isEnvKey || inputKey === userApiKey}
          className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0"
        >
          키 저장 및 확인
        </button>
      </div>
    </div>
  );
};

export default ApiKeyManager;
