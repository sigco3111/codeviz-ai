
import React, { useState, useRef, useEffect } from 'react';
import { DisplayChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: DisplayChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isReady: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isReady }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const prevIsLoading = useRef(isLoading);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const messagesLength = messages.length;
    if (messagesLength > prevMessagesLength.current) {
      scrollToBottom();
    } 
    else if (prevIsLoading.current && !isLoading) {
      scrollToBottom();
    }
    prevMessagesLength.current = messagesLength;
    prevIsLoading.current = isLoading;
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && isReady) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const placeholderText = isReady ? "코드에 대해 질문해보세요..." : "AI 분석 완료 후 활성화됩니다.";

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col h-full shadow-2xl shadow-slate-950/20">
      <h3 className="text-lg font-semibold text-slate-200 p-4 border-b border-slate-700/50 flex-shrink-0">AI에게 질문하기</h3>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              {msg.role === 'model' && msg.text === '' && isLoading ? (
                <div className="flex items-center space-x-1 py-1">
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
         {!isReady && messages.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-8">
            AI 분석이 완료되고 API 키가 확인되면 채팅 기능이 활성화됩니다.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderText}
            disabled={isLoading || !isReady}
            className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-70"
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !isReady}
            className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
