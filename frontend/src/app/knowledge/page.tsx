'use client';

import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { BookOpen, FileText, Search } from 'lucide-react';

export default function KnowledgePage() {
  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col h-full bg-[#ffffff] select-none p-[50px] overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-[40px]">
          <div className="flex items-center gap-[20px]">
            <div className="w-[80px] h-[80px] bg-[#eff6ff] text-[#3b82f6] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#dbeafe]">
              <BookOpen className="w-[40px] h-[40px]" />
            </div>
            <div>
              <h1 className="text-[48px] font-bold text-slate-900 leading-tight">
                Knowledge Base
              </h1>
              <span className="text-[20px] text-[#6b7280] block mt-1">
                Medical Literature & Reference Documents
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-[24px] h-[24px] text-slate-400 absolute left-[20px] top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search library..." 
              className="pl-[60px] pr-[30px] py-[15px] w-[400px] bg-[#f8f9fc] border-2 border-[#e5e7eb] rounded-full text-[20px] outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="max-w-[1200px] space-y-[30px]">
          
          <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-[30px] p-[40px] shadow-sm">
            <h2 className="text-[32px] font-bold text-slate-800 mb-[20px]">Available Resources</h2>
            <p className="text-[24px] text-slate-600 leading-relaxed font-sora">
              Aivara uses the following clinical guidelines and verified medical literature to ground its responses.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[20px]">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border border-[#e5e7eb] rounded-[20px] p-[30px] shadow-sm flex items-center gap-[30px] hover:border-[#3b82f6] transition-colors cursor-pointer group">
                <div className="w-[60px] h-[60px] bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-[#dbeafe] group-hover:text-[#3b82f6] transition-colors">
                  <FileText className="w-[30px] h-[30px]" />
                </div>
                <div>
                  <h3 className="text-[28px] font-bold text-slate-800">Medical Guideline Document {item}</h3>
                  <p className="text-[20px] text-slate-500 mt-1">
                    Uploaded and indexed for Aivara's RAG pipeline.
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </ChatLayout>
  );
}
