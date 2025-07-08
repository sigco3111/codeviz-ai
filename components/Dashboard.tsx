
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { AnalysisResult, FileInfo, DisplayChatMessage } from '../types';
import { analyzeCodebaseWithGemini } from '../services/geminiService';
import ChartCard from './ChartCard';
import LanguagePieChart from './LanguagePieChart';
import FileSizeBarChart from './FileSizeBarChart';
import GeminiAnalysisCard from './GeminiAnalysisCard';
import ChatInterface from './ChatInterface';
import CodeViewer from './CodeViewer';

interface DashboardProps {
  result: AnalysisResult;
  setResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  apiKey: string | null;
  isKeyAvailable: boolean;
  isMounted: boolean;
  selectedFile: FileInfo | null;
  highlightLine?: number;
  onFileSelect: (path: string, line?: number) => void;
  onCloseCodeViewer: () => void;
  languageFilter: string | null;
  onLanguageFilter: (lang: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  result, setResult, apiKey, isKeyAvailable, isMounted,
  selectedFile, highlightLine, onFileSelect, onCloseCodeViewer,
  languageFilter, onLanguageFilter,
}) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<DisplayChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!apiKey) {
      console.log("AI 분석 건너뜀: API 키 없음");
      return;
    }
    setIsGeminiLoading(true);
    setGeminiError(null);
    try {
      const { analysis, tokenCount } = await analyzeCodebaseWithGemini(result.files, apiKey);
      setResult(prev => prev ? ({ ...prev, geminiAnalysis: analysis, tokenCount }) : null);
    } catch (e: any) {
      setGeminiError(e.message || "AI 분석 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsGeminiLoading(false);
    }
  }, [apiKey, result.files, setResult]);

  useEffect(() => {
    if (isMounted && apiKey && !result.geminiAnalysis && !isGeminiLoading && !geminiError) {
      runAnalysis();
    }
  }, [isMounted, apiKey, result.geminiAnalysis, runAnalysis, isGeminiLoading, geminiError]);

  useEffect(() => {
    if (apiKey && result.geminiAnalysis && !chat) {
      const ai = new GoogleGenAI({ apiKey });
      const initialContextPrompt = `You are an expert AI code assistant. Project analysis: Overview: ${result.geminiAnalysis?.overview}, Tech Stack: ${result.geminiAnalysis?.techStack.join(', ')}. Refer to file contents for accurate answers.`;
      const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: [{ role: 'user', parts: [{ text: initialContextPrompt }] }],
      });
      setChat(newChat);
      setChatMessages([{ role: 'model', text: '안녕하세요! 이 코드베이스에 대해 무엇이 궁금하신가요?' }]);
    }
  }, [apiKey, result.geminiAnalysis, chat]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chat) return;
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);
    try {
      const responseStream = await chat.sendMessageStream({ message });
      let currentResponse = '';
      setChatMessages(prev => [...prev, { role: 'model', text: '' }]);
      for await (const chunk of responseStream) {
        currentResponse += chunk.text;
        setChatMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: currentResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { role: 'model' as const, text: "죄송합니다. 메시지를 처리하는 동안 오류가 발생했습니다." };
      setChatMessages(prev => [...prev.filter(m => !(m.role === 'model' && m.text === '')), errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chat]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-0">
      <div className="xl:col-span-7 flex flex-col gap-6 overflow-y-auto">
        <div className="flex-grow h-0 min-h-[400px]">
          {selectedFile ? (
            <CodeViewer file={selectedFile} highlightLine={highlightLine} onClose={onCloseCodeViewer} />
          ) : (
            <GeminiAnalysisCard
              analysis={result.geminiAnalysis}
              isLoading={isGeminiLoading}
              isKeyMissing={isMounted && !isKeyAvailable}
              error={geminiError}
              onRetry={geminiError ? runAnalysis : undefined}
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="언어 분포">
            <LanguagePieChart data={result.languageDistribution} onSliceClick={onLanguageFilter} activeLanguage={languageFilter} />
          </ChartCard>
          <ChartCard title="상위 10개 코드 파일 (KB)">
            <FileSizeBarChart data={result.fileSizes} onBarClick={path => onFileSelect(path)} />
          </ChartCard>
        </div>
      </div>
      <div className="xl:col-span-5 flex flex-col">
        <ChatInterface
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
          isReady={!!chat && !!result.geminiAnalysis && !isGeminiLoading && !geminiError}
        />
      </div>
    </div>
  );
};

export default Dashboard;
