'use client';

import React from 'react';
import { Heart, Activity, Stethoscope, Brain } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export default function WelcomeScreen() {
  const { chat } = useChat();

  const samples = [
    { text: 'What are the common symptoms of diabetes?', icon: Activity, desc: 'Analyze endocrinology conditions' },
    { text: 'What are the symptoms of dengue?', icon: Stethoscope, desc: 'Query infectious disease profiles' },
    { text: 'How is asthma diagnosed and managed?', icon: Heart, desc: 'Check respiratory guidelines' },
    { text: 'What are key warning signs of clinical depression?', icon: Brain, desc: 'Access mental health diagnostics' }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto select-none">
      <div className="w-12 h-12 border border-violet-100 bg-violet-50/50 rounded-xl flex items-center justify-center mb-4 shrink-0 overflow-hidden shadow-xs">
        <svg className="w-7 h-7 text-violet-600 fill-violet-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      
      <h1 className="font-sora font-extrabold text-base text-slate-800 mb-1">
        Aivara AI Healthcare Assistant
      </h1>
      
      <p className="text-slate-500 text-xs mb-6 max-w-sm leading-relaxed">
        Your intelligent clinical companion. Query verified medical texts and retrieve evidence-based guidance. Ask a health question below to get started.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {samples.map((sample, i) => {
          const Icon = sample.icon;
          return (
            <div
              key={i}
              onClick={() => chat(sample.text)}
              className="p-3 rounded-lg border border-slate-200 bg-white hover:border-violet-300 hover:shadow-2xs hover:shadow-violet-50/50 text-left cursor-pointer transition duration-150 group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-slate-100 group-hover:bg-violet-50 text-slate-500 group-hover:text-violet-600 transition">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                  {sample.desc}
                </span>
              </div>
              <p className="text-slate-700 text-[12px] font-semibold leading-snug">
                {sample.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
