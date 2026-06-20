'use client';

import React, { useState } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { useAuth } from '@/context/AuthContext';
import { Settings, Save, Sliders, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

function SettingsForm() {
  const { user } = useAuth();
  const [model, setModel] = useState('llama-3.1-70b-versatile');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [temperature, setTemperature] = useState(0.3);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      toast.success('Settings updated successfully! ⚙️');
      setSaving(false);
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto p-[50px] bg-[#ffffff] font-sora select-none">
      <header className="mb-[40px] flex items-center gap-[20px]">
        <div className="w-[80px] h-[80px] bg-[#f5f3ff] text-[#8b5cf6] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#ede9fe]">
          <Settings className="w-[40px] h-[40px]" />
        </div>
        <div>
          <h1 className="text-[48px] font-bold text-slate-900 leading-tight">System Settings</h1>
          <p className="text-[20px] text-slate-500 font-medium mt-1">Customize model preferences and medical default parameters</p>
        </div>
      </header>

      <div className="max-w-[1200px] bg-white border border-[#e5e7eb] rounded-[30px] p-[50px] shadow-sm space-y-[40px]">
        <div className="flex items-center gap-[20px] mb-[30px]">
          <div className="w-[60px] h-[60px] rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Sliders className="w-[30px] h-[30px]" />
          </div>
          <div>
            <h2 className="text-[32px] font-bold text-slate-800">Aivara Configurations</h2>
            <p className="text-[20px] text-slate-500 font-semibold mt-1">Tweak engine behaviors and user account credentials</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-[35px]">
          {/* Default Specialty */}
          <div>
            <label htmlFor="settings-specialty" className="block text-[20px] font-bold text-slate-500 uppercase tracking-wider mb-[15px]">
              Default Clinical Specialty
            </label>
            <select
              id="settings-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full text-[24px] font-semibold px-[25px] py-[20px] bg-[#f8f9fc] border-2 border-[#e5e7eb] focus:bg-white focus:border-violet-400 rounded-[20px] outline-none text-slate-700"
            >
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Diabetology">Diabetology</option>
              <option value="Neurology">Neurology</option>
              <option value="Mental Health">Mental Health</option>
            </select>
          </div>

          {/* Model selection */}
          <div>
            <label htmlFor="settings-model" className="block text-[20px] font-bold text-slate-500 uppercase tracking-wider mb-[15px]">
              LLM Model Architecture
            </label>
            <select
              id="settings-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-[24px] font-semibold px-[25px] py-[20px] bg-[#f8f9fc] border-2 border-[#e5e7eb] focus:bg-white focus:border-violet-400 rounded-[20px] outline-none text-slate-700"
            >
              <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile (Default)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fast response)</option>
              <option value="llama-3.3-70b-specdec">llama-3.3-70b-specdec (High intelligence)</option>
            </select>
          </div>

          {/* LLM Parameters */}
          <div className="border-2 border-[#e5e7eb] rounded-[25px] p-[35px] space-y-[25px] bg-[#f8f9fc]">
            <div className="flex items-center gap-[15px] mb-[10px] text-slate-800 font-bold text-[24px]">
              <Sliders className="w-[28px] h-[28px] text-violet-500" />
              <span>Model Parameters</span>
            </div>
            
            <div className="space-y-[15px]">
              <div className="flex justify-between items-center text-[20px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Temperature</span>
                <span className="text-violet-600 bg-violet-100 px-4 py-1 rounded-full">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-[15px] bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600"
              />
              <span className="block text-[18px] text-slate-500 font-medium pt-2">Lower values represent deterministic and factual answers; higher values produce creative descriptions.</span>
            </div>
          </div>

          {/* User Account info */}
          <div className="border-2 border-[#e5e7eb] rounded-[25px] p-[35px] flex gap-[20px] bg-white items-center">
            <Shield className="w-[40px] h-[40px] text-violet-500 shrink-0" />
            <div className="space-y-[5px] overflow-hidden">
              <span className="text-[24px] font-bold text-slate-800 block">Security & Access</span>
              <span className="text-[20px] text-slate-500 font-medium block truncate">User Email: {user?.email}</span>
              <span className="text-[20px] text-slate-500 font-medium block truncate">Access Token: Active Bearer JWT</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-[25px] rounded-[20px] flex items-center justify-center gap-[15px] bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold text-[24px] transition duration-200 cursor-pointer shadow-md mt-[20px]"
          >
            {saving ? (
              <>
                <span className="w-[30px] h-[30px] border-[4px] border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving configurations...</span>
              </>
            ) : (
              <>
                <Save className="w-[30px] h-[30px]" />
                <span>Save Configurations</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ChatLayout>
      <SettingsForm />
    </ChatLayout>
  );
}
