'use client';

import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import { useChat } from '@/context/ChatContext';

export default function ChatWindow() {
  const { messages, chat, isLoading } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#ffffff] select-none relative">
      {/* Header Panel */}
      <header className="px-[50px] pt-[30px] bg-white flex items-center justify-between pb-4">
        <div className="flex items-center gap-[20px]">
          <div className="w-[80px] h-[80px] bg-[#ede9fe] rounded-full flex items-center justify-center shrink-0">
            <span className="text-[40px]">🤖</span>
          </div>
          <div>
            <h1 className="text-[48px] font-bold text-slate-900 leading-tight">
              Aivara AI Assistant
            </h1>
            <span className="text-[20px] text-[#6b7280] block mt-1">
              Your AI Healthcare Companion
            </span>
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-[15px] absolute top-[30px] right-[50px]">
          <button className="w-[55px] h-[55px] rounded-full border border-[#ddd] bg-white flex items-center justify-center text-[22px] hover:bg-slate-50 transition cursor-pointer shadow-sm">
            ☀️
          </button>
          <div className="w-[55px] h-[55px] rounded-full border border-[#ddd] bg-white flex items-center justify-center text-[22px] select-none cursor-pointer shadow-sm">
            👤
          </div>
        </div>
      </header>

      {/* Message List Panel */}
      <div className="flex-1 overflow-y-auto px-[50px] pb-[30px] bg-[#ffffff]">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="w-full pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Form Panel */}
      <div className="px-[50px] pb-[40px]">
        <ChatInput onSend={chat} disabled={isLoading} />
      </div>
    </div>
  );
}
