'use client';

import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { useAuth } from '@/context/AuthContext';
import { Stethoscope, FileText, ClipboardList, CheckCircle2, User, Search } from 'lucide-react';

function DoctorPortal() {
  const { user } = useAuth();

  const patients = [
    { name: 'Arthur Dent', age: 42, condition: 'General health consultation', lastActive: '2 hours ago', status: 'Reviewed' },
    { name: 'Tricia McMillan', age: 29, condition: 'Allergy monitoring', lastActive: '1 day ago', status: 'Pending Review' },
    { name: 'Ford Prefect', age: 38, condition: 'Hypertension audit', lastActive: '3 days ago', status: 'Reviewed' },
  ];

  const tasks = [
    { title: 'Approve medical RAG ingestion seed logs', time: 'Today' },
    { title: 'Update cardiology references in Knowledge Studio', time: 'Yesterday' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 font-sora select-none">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Clinical Portal</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Patient logs, memory contexts, and diagnostic references</p>
      </header>

      {/* Stats counter row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Patients</span>
            <span className="text-lg font-bold text-slate-800 block">3 Patients</span>
            <span className="text-[10px] font-medium text-slate-450 block">Active consultation logs</span>
          </div>
          <div className="w-10 h-10 border rounded-xl flex items-center justify-center bg-violet-50 text-violet-600 border-violet-100">
            <User className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Reviews</span>
            <span className="text-lg font-bold text-slate-800 block">1 Pending</span>
            <span className="text-[10px] font-medium text-amber-500 block">Requires physician response</span>
          </div>
          <div className="w-10 h-10 border rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 border-amber-100">
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Status</span>
            <span className="text-lg font-bold text-slate-800 block">RAG Active</span>
            <span className="text-[10px] font-medium text-emerald-500 block">Supabase and Groq online</span>
          </div>
          <div className="w-10 h-10 border rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border-emerald-100">
            <Stethoscope className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Patient Log Records</h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Monitor chatbot interactions and patient health profiles</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 font-medium text-slate-650 transition">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-755 block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{p.age} years old</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">{p.condition}</td>
                    <td className="py-3 px-3 text-slate-400">{p.lastActive}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        p.status === 'Reviewed' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks column */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">To-do Checklist</h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Pending administrative tasks</p>

          <div className="space-y-3">
            {tasks.map((t, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl p-3 flex gap-3 hover:bg-slate-50/40 transition">
                <CheckCircle2 className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-slate-700 block leading-tight">{t.title}</span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-1">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPage() {
  return (
    <ChatLayout>
      <DoctorPortal />
    </ChatLayout>
  );
}
