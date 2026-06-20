'use client';

import React from 'react';
import { FileText, Trash2, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DocumentList({ documents, loading, onRefresh }) {
  
  const handleDelete = async (docId, filename) => {
    if (!confirm(`Are you sure you want to delete ${filename || 'this document'}? This will remove all of its text chunks from the vector database.`)) {
      return;
    }
    
    try {
      await api.deleteDocument(docId);
      toast.success('Document deleted successfully.');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete document.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 font-sora shadow-xs flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-semibold text-slate-400">Loading document list...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 font-sora shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Ingested Documents</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Documents loaded in the RAG knowledge pool</p>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {documents.length} Total
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-100 rounded-xl">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">No documents ingested yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Title / Label</th>
                <th className="py-2.5 px-3">Date Added</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const formattedDate = doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Unknown';

                return (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50 font-medium text-slate-600 transition">
                    <td className="py-3 px-3 flex items-center gap-2 max-w-[200px] truncate">
                      <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate font-semibold text-slate-700">
                      {doc.title || 'General Reference'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.filename)}
                        title="Delete document & chunks"
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
