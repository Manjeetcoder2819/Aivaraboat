'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Paperclip } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize input bar height based on content lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    
    onSend(text);
    setText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center mt-[60px] border border-[#ddd] rounded-[20px] overflow-hidden bg-white shadow-sm focus-within:border-[#6d28d9] transition duration-200">
        
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask your health question..."
          className="flex-1 resize-none bg-transparent outline-none text-[22px] text-slate-800 p-[25px] max-h-40 min-h-[40px] placeholder-slate-400"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className={`w-[90px] self-stretch flex items-center justify-center transition duration-150 cursor-pointer ${
            text.trim() && !disabled
              ? 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span className="text-[26px]">➤</span>
        </button>

      </div>
    </form>
  );
}
