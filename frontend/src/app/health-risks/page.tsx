'use client';

import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { Heart, Activity, AlertCircle } from 'lucide-react';

export default function HealthRisksPage() {
  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col h-full bg-[#ffffff] select-none p-[50px] overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center gap-[20px] mb-[40px]">
          <div className="w-[80px] h-[80px] bg-[#fff1f2] text-[#e11d48] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#ffe4e6]">
            <Heart className="w-[40px] h-[40px]" />
          </div>
          <div>
            <h1 className="text-[48px] font-bold text-slate-900 leading-tight">
              Health Risks
            </h1>
            <span className="text-[20px] text-[#6b7280] block mt-1">
              Personalized Risk Analysis & Early Warnings
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="max-w-[1200px] space-y-[30px]">
          
          <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-[30px] p-[40px] shadow-sm">
            <div className="flex items-center gap-[15px] mb-[20px]">
              <Activity className="w-[32px] h-[32px] text-[#6d28d9]" />
              <h2 className="text-[32px] font-bold text-slate-800">Your Overview</h2>
            </div>
            <p className="text-[24px] text-slate-600 leading-relaxed font-sora">
              Aivara continuously analyzes your conversations to detect potential health risk factors. Connect more data or continue chatting to build a comprehensive health profile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
            <div className="bg-white border border-[#e5e7eb] rounded-[30px] p-[40px] shadow-sm hover:border-[#6d28d9] transition-colors cursor-pointer">
              <div className="flex items-center gap-[15px] mb-[15px]">
                <AlertCircle className="w-[28px] h-[28px] text-amber-500" />
                <h3 className="text-[28px] font-bold text-slate-800">Pending Assessments</h3>
              </div>
              <p className="text-[20px] text-slate-500">
                You have 2 recommended lifestyle assessments available to complete your profile.
              </p>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-[30px] p-[40px] shadow-sm hover:border-[#6d28d9] transition-colors cursor-pointer">
              <div className="flex items-center gap-[15px] mb-[15px]">
                <Heart className="w-[28px] h-[28px] text-rose-500" />
                <h3 className="text-[28px] font-bold text-slate-800">Cardio Health</h3>
              </div>
              <p className="text-[20px] text-slate-500">
                Based on recent chats, your cardiovascular risk appears low. Keep maintaining a balanced diet!
              </p>
            </div>
          </div>

        </div>

      </div>
    </ChatLayout>
  );
}
