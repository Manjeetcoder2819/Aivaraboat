'use client';

import React, { useState } from 'react';
import { Search, ChevronRight, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TestQueryPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const matchedChunks = await api.testQuery(query);
      setResults(matchedChunks);
      if (matchedChunks.length === 0) {
        toast.error('No relevant document chunks found above threshold.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to execute test query search.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 font-sora shadow-xs h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-1">RAG Similarity Console</h3>
      <p className="text-xs text-slate-400 font-medium mb-4">Query vector database directly to audit matched chunks</p>

      {/* Query Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type health keywords..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-400 focus:shadow-xs rounded-xl outline-hidden transition leading-relaxed text-slate-700"
            required
            disabled={searching}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          {searching ? 'Searching...' : 'Scan'}
        </button>
      </form>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3.5">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-100 rounded-xl">
            <Search className="w-8 h-8 text-slate-200 mb-2" />
            <span className="text-xs font-semibold text-slate-400">Scan results will appear here</span>
          </div>
        ) : (
          results.map((res, i) => {
            const similarityPercent = (res.similarity * 100).toFixed(0);
            const docTitle = res.title || res.filename || 'General Document';
            return (
              <div key={i} className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">{docTitle}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">
                    {similarityPercent}% Match
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed max-h-24 overflow-y-auto pr-1">
                  {res.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
