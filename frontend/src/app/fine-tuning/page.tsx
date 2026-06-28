'use client';

import React, { useState, useEffect } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { Upload, FileText, CheckCircle, BrainCircuit, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/api';


export default function FineTuningPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && jobStatus?.status !== 'completed') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/finetune/status/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobStatus(data);
            if (data.status === 'completed') {
              toast.success('Fine-tuning completed successfully!');
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.jsonl')) {
        toast.error('Only JSONL files are supported for fine-tuning');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleStartTraining = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/finetune/start`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to start training');
      }
      
      const data = await res.json();
      setJobId(data.job_id);
      toast.success('Training job submitted successfully');
    } catch (err) {
      toast.error('Error submitting training job');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col h-full bg-[#ffffff] select-none p-[50px] overflow-y-auto">
        <header className="flex items-center gap-[20px] mb-[40px]">
          <div className="w-[80px] h-[80px] bg-[#f5f3ff] text-[#8b5cf6] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#ede9fe]">
            <BrainCircuit className="w-[40px] h-[40px]" />
          </div>
          <div>
            <h1 className="text-[48px] font-bold text-slate-900 leading-tight">
              LLM Fine-Tuning
            </h1>
            <span className="text-[20px] text-[#6b7280] block mt-1">
              Train local Parameter-Efficient Fine-Tuning (PEFT/LoRA) adapters
            </span>
          </div>
        </header>

        <div className="max-w-[1200px] space-y-[40px]">
          <div className="bg-[#f8f9fc] border border-[#e5e7eb] rounded-[30px] p-[40px] shadow-sm">
            <h2 className="text-[32px] font-bold text-slate-800 mb-[20px]">Upload Training Dataset</h2>
            <p className="text-[20px] text-slate-600 leading-relaxed font-sora mb-[30px]">
              Upload a valid <code className="bg-slate-200 px-2 py-1 rounded text-slate-800">.jsonl</code> file containing your Q&A examples. Aivara will structurally adapt its weights to specialize in your custom domain knowledge.
            </p>
            
            <div className="flex items-center gap-[20px]">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-[#8b5cf6] bg-white hover:bg-violet-50 transition-colors rounded-[20px] p-[40px] flex flex-col items-center justify-center gap-[15px]">
                  <Upload className="w-[40px] h-[40px] text-[#8b5cf6]" />
                  <span className="text-[24px] font-bold text-slate-700">
                    {file ? file.name : "Click to upload JSONL dataset"}
                  </span>
                </div>
                <input type="file" accept=".jsonl" className="hidden" onChange={handleFileChange} />
              </label>

              <button 
                onClick={handleStartTraining}
                disabled={!file || uploading || (jobStatus && jobStatus.status === 'running')}
                className="px-[40px] py-[40px] rounded-[20px] bg-[#6d28d9] hover:bg-[#5b21b6] disabled:opacity-50 text-white font-bold text-[24px] shadow-md transition-colors h-[155px] flex items-center"
              >
                {uploading ? 'Uploading...' : 'Start LoRA Training'}
              </button>
            </div>
          </div>

          {jobStatus && (
            <div className="bg-white border-2 border-[#e5e7eb] rounded-[30px] p-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-[30px]">
                <div className="flex items-center gap-[15px]">
                  <Activity className="w-[35px] h-[35px] text-blue-500" />
                  <h2 className="text-[28px] font-bold text-slate-800">Training Progress</h2>
                </div>
                {jobStatus.status === 'completed' ? (
                  <span className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-bold text-[18px]">
                    <CheckCircle className="w-5 h-5" /> Completed
                  </span>
                ) : (
                  <span className="text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-bold text-[18px] animate-pulse">
                    Running...
                  </span>
                )}
              </div>

              <div className="space-y-[15px]">
                <div className="flex justify-between text-[20px] font-bold text-slate-500">
                  <span>{jobStatus.message}</span>
                  <span>{jobStatus.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-[20px] bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${jobStatus.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatLayout>
  );
}
