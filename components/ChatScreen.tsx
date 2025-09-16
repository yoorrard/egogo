
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { ChatMessage } from '../types';
import { SendIcon, RestartIcon } from './icons/Icons';

interface ChatScreenProps {
  characterImageUrl: string;
  systemInstruction: string;
  initialMessages: ChatMessage[];
  onRestart: () => void;
}

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const DAILY_LIMIT = 20;

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1.5 p-2">
    <span className="typing-dot"></span>
    <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
    <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
  </div>
);

// FIX: Correctly type the component with React.FC<ChatScreenProps> to accept props.
const ChatScreen: React.FC<ChatScreenProps> = ({
  characterImageUrl,
  systemInstruction,
  initialMessages,
  onRestart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('egogo-chat-date');
    const storedCount = parseInt(localStorage.getItem('egogo-chat-count') || '0', 10);

    if (storedDate === today) {
        setDailyCount(storedCount);
        if (storedCount >= DAILY_LIMIT) {
            setLimitReached(true);
        }
    } else {
        localStorage.setItem('egogo-chat-date', today);
        localStorage.setItem('egogo-chat-count', '0');
        setDailyCount(0);
        setLimitReached(false);
    }
  }, []);

  useEffect(() => {
    const chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
      },
    });
    setChat(chatInstance);
  }, [systemInstruction]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading || limitReached) return;

    const newCount = dailyCount + 1;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setDailyCount(newCount);
    localStorage.setItem('egogo-chat-count', newCount.toString());
    setInput('');
    setIsLoading(true);

    const aiMessageId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, sender: 'ai', text: '' },
    ]);

    try {
      const result = await chat.sendMessageStream({ message: input });
      let text = '';
      for await (const chunk of result) {
        text += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: '음... 그런 표현은 나를 조금 슬프게 해. 우리 더 예쁜 말로 대화해볼까?' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (newCount >= DAILY_LIMIT) {
        setLimitReached(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 2, sender: 'ai', text: '오늘 너와 정말 깊은 대화를 나눴네! 우리의 이야기는 내일 또 이어가자. 내일 다시 만나!' }
          ]);
        }, 500);
      }
    }
  }, [input, chat, isLoading, dailyCount, limitReached]);

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA]">
      <div className="hidden md:flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-white via-white to-gray-50 p-8 border-r border-gray-200 shadow-lg">
        <img
          src={characterImageUrl}
          alt="Persona Character"
          className="w-64 h-64 rounded-full object-cover shadow-2xl shadow-[#FF8FAB]/30"
        />
        <h2 className="text-4xl mt-6 text-[#3D405B]">
          나의 에고
        </h2>
        <p className="text-[#7A7C8B] mt-2 text-lg text-center">
          언제나 네 곁에서 이야기를 들어줄게.
        </p>
        <button
          onClick={onRestart}
          className="mt-8 flex items-center gap-2 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-[#3D405B] text-lg py-2 px-5 rounded-full transition-colors"
        >
          <RestartIcon />
          다시 시작하기
        </button>
      </div>
      <div className="flex flex-col w-full md:w-2/3 h-screen">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
                <img src={characterImageUrl} alt="Persona" className="w-12 h-12 rounded-full object-cover" />
                <h2 className="text-2xl text-[#3D405B]">나의 에고</h2>
            </div>
            <button onClick={onRestart} className="p-2 text-gray-500 hover:text-[#3D405B]">
                <RestartIcon />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 message-bubble-animation ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <img
                  src={characterImageUrl}
                  alt="AI Avatar"
                  className="w-10 h-10 rounded-full object-cover self-start shadow-md"
                />
              )}
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-md text-lg ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-[#FF8FAB] to-[#ff75a0] text-white rounded-br-none'
                    : 'bg-gradient-to-br from-[#A2D2FF] to-[#BDE0FE] text-[#3D405B] rounded-bl-none'
                }`}
              >
                {message.sender === 'ai' && !message.text ? (
                    <TypingIndicator />
                ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.05)]">
            {limitReached ? (
                <div className="text-center text-gray-500 text-lg p-3">
                    오늘의 대화가 모두 끝났어요. 내일 또 만나요!
                </div>
            ) : (
                <>
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-4"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            disabled={isLoading}
                            className="w-full bg-gray-100 border-transparent rounded-full px-5 py-4 text-[#3D405B] focus:ring-2 focus:ring-[#FF8FAB] transition-colors disabled:opacity-50 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`bg-[#FF8FAB] text-white rounded-full p-4 hover:bg-[#ff75a0] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-110 ${!isLoading && input.trim() ? 'pulse-glow-animation' : ''}`}
                        >
                            <SendIcon />
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-2">
                        오늘 남은 대화: {Math.max(0, DAILY_LIMIT - dailyCount)}회
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
