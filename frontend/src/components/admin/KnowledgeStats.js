'use client';

import React from 'react';
import { Database, Cpu, Activity, ShieldCheck } from 'lucide-react';

export default function KnowledgeStats({ analytics, documentCount }) {
  const stats = [
    {
      label: 'Knowledge Pool',
      value: `${documentCount} Documents`,
      desc: 'Active medical references',
      icon: Database,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'API Requests',
      value: analytics.total_logged_requests || 0,
      desc: 'Queries processed',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Avg Response Time',
      value: `${analytics.average_response_ms || 0} ms`,
      desc: 'System response latency',
      icon: Cpu,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      label: 'RAG Model Pipeline',
      value: 'MiniLM-L6 / Llama 3',
      desc: 'Local embedder + Groq LLM',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-sora">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{s.label}</span>
              <span className="text-lg font-bold text-slate-800 block">{s.value}</span>
              <span className="text-[10px] font-medium text-slate-400 block">{s.desc}</span>
            </div>
            <div className={`w-11 h-11 border rounded-xl flex items-center justify-center ${s.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
