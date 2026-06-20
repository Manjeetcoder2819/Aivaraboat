'use client';

import React, { useState, useEffect } from 'react';
import { Database, Upload, FileCode, Search, RefreshCw } from 'lucide-react';
import KnowledgeStats from './KnowledgeStats';
import DocumentList from './DocumentList';
import UploadPanel from './UploadPanel';
import TextIngestPanel from './TextIngestPanel';
import TestQueryPanel from './TestQueryPanel';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function KnowledgeStudio() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'

  const loadData = async () => {
    setLoading(true);
    try {
      const docList = await api.getDocuments();
      setDocuments(docList);
      
      const stats = await api.getAnalytics();
      setAnalytics(stats);
    } catch (error) {
      console.error(error);
      toast.error('Failed to reload knowledge dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 font-sora select-none">
      {/* Title Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Knowledge Studio</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Control panel for RAG document ingestion & pgvector metrics</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Hub</span>
        </button>
      </header>

      {/* Analytics Counter Row */}
      <KnowledgeStats analytics={analytics} documentCount={documents.length} />

      {/* Primary Ingestion & Query Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Side: Upload / Paste Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-1 shadow-2xs max-w-sm">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'text' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <UploadPanel onUploadSuccess={loadData} />
          ) : (
            <TextIngestPanel onIngestSuccess={loadData} />
          )}
        </div>

        {/* Right Side: RAG Test Console */}
        <div className="lg:col-span-1">
          <TestQueryPanel />
        </div>
      </div>

      {/* Ingested Documents List */}
      <div className="w-full">
        <DocumentList documents={documents} loading={loading} onRefresh={loadData} />
      </div>
    </div>
  );
}
