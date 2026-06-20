'use client';

import React from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { useAuth } from '@/context/AuthContext';
import { Activity, ShieldAlert, Heart, Calendar, Pill, Search } from 'lucide-react';
import Link from 'next/link';

function PatientDashboard() {
  const { user } = useAuth();

  const metrics = [
    { label: 'Pulse Rate', value: '72 bpm', desc: 'Normal (resting)', icon: Heart, color: 'text-rose-500 bg-rose-50 border-rose-100' },
    { label: 'Blood Pressure', value: '120/80', desc: 'Optimal range', icon: Activity, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
    { label: 'Active Reminders', value: '2 Medications', desc: 'Metformin, Lisinopril', icon: Pill, color: 'text-violet-500 bg-violet-50 border-violet-100' },
  ];

  const upcomingAppointments = [
    { doctor: 'Dr. Sarah Connor', specialty: 'Endocrinology', date: 'June 25, 2026', time: '10:00 AM' },
    { doctor: 'Dr. James Howlett', specialty: 'Neurology', date: 'July 12, 2026', time: '2:30 PM' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 font-sora select-none">
      <header className="mb-4">
        <h1 className="text-base font-extrabold text-slate-800 tracking-tight">Health Dashboard</h1>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Personalized metrics, medical reminders, and clinical summaries</p>
      </header>

      {/* Welcome banner */}
      <div className="bg-linear-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 text-white mb-4 shadow-sm shadow-violet-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold">Welcome back, {user?.full_name || 'Health Patient'}! 👋</h2>
          <p className="text-[10px] text-violet-100 font-medium">Your healthcare companion is active. Keep your health profile updated to receive personalized RAG summaries.</p>
        </div>
        <Link 
          href="/profile" 
          className="px-3 py-1.5 bg-white hover:bg-violet-50 text-violet-600 font-bold text-[10px] rounded-lg shadow-sm transition shrink-0"
        >
          Update Profile
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{m.label}</span>
                <span className="text-base font-bold text-slate-800 block">{m.value}</span>
                <span className="text-[9px] font-medium text-slate-400 block">{m.desc}</span>
              </div>
              <div className={`w-8 h-8 border rounded-lg flex items-center justify-center ${m.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Appointments column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 mb-0.5">Upcoming Consultations</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-3">Your appointments and wellness checkups schedule</p>

          <div className="space-y-2">
            {upcomingAppointments.map((app, idx) => (
              <div key={idx} className="border border-slate-100 rounded-lg p-2.5 flex items-center justify-between hover:bg-slate-50/40 transition">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">{app.doctor}</span>
                    <span className="text-[9px] font-medium text-slate-400">{app.specialty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600 block">{app.date}</span>
                  <span className="text-[9px] font-semibold text-violet-500">{app.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical alerts */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 mb-0.5">Wellness Feed</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-3">AI generated health tips based on profile</p>

          <div className="border border-amber-100 bg-amber-50/20 rounded-lg p-3 text-amber-800 flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <span className="text-xs font-bold block mb-0.5">High Allergens Alert</span>
              <p className="text-[9px] font-semibold text-amber-700/80 leading-relaxed">Pollen count is elevated in your region. Keep your rescue inhaler handy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ChatLayout>
      <PatientDashboard />
    </ChatLayout>
  );
}
