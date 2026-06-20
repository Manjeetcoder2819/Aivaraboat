'use client';

import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TextIngestPanel({ onIngestSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ingesting, setIngesting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    setIngesting(true);
    try {
      // Create a virtual text file in browser
      const cleanTitle = title.trim();
      const filename = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
      const file = new File([content], filename, { type: 'text/plain' });

      // Ingest via multipart/form-data
      const formData = new FormData();
      formData.append('file', file);

      await api.uploadDocument(formData);
      toast.success(`Successfully ingested "${cleanTitle}" article! 📖`);
      setTitle('');
      setContent('');
      if (onIngestSuccess) onIngestSuccess();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Failed to ingest raw text.';
      toast.error(msg);
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 font-sora shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 mb-1">Direct Article Ingest</h3>
      <p className="text-xs text-slate-400 font-medium mb-4">Paste clinical articles or guideline summaries directly</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="ingest-title" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Document Title
          </label>
          <input
            id="ingest-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. WHO Hypertension Guidelines 2026"
            className="w-full text-xs font-semibold px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-400 focus:shadow-xs rounded-xl outline-hidden transition leading-relaxed text-slate-700"
            required
            disabled={ingesting}
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="ingest-content" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Raw Text Content
          </label>
          <textarea
            id="ingest-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste clinical text, definitions, or symptoms description here..."
            className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-400 focus:shadow-xs rounded-xl outline-hidden resize-none h-44 transition leading-relaxed text-slate-700"
            required
            disabled={ingesting}
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={ingesting || !title.trim() || !content.trim()}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-xs transition duration-150 cursor-pointer ${
            title.trim() && content.trim() && !ingesting
              ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-100'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {ingesting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Processing Ingestion...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Ingest Text Content</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
