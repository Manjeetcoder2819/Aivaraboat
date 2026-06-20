'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UploadPanel({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
      } else {
        toast.error('Only plain text (.txt) files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
      } else {
        toast.error('Only plain text (.txt) files are supported.');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.uploadDocument(formData);
      toast.success(`Successfully ingested ${file.name}! 🎉`);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Failed to ingest file.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 font-sora shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 mb-1">Upload Medical Document</h3>
      <p className="text-xs text-slate-400 font-medium mb-4">Add new guidelines or studies to the RAG database</p>

      {/* Drag & Drop Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition duration-150 ${
          dragActive 
            ? 'border-violet-500 bg-violet-50/20' 
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".txt" 
          onChange={handleFileChange}
          className="hidden" 
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700 mb-1">{file.name}</span>
            <span className="text-xs text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-700 mb-1">Select or drop file</span>
            <span className="text-xs text-slate-400 font-medium">Plain text documents (.txt) up to 5MB</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {file && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setFile(null)}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs transition duration-150 shadow-md shadow-violet-100 flex items-center justify-center gap-1.5"
          >
            {uploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Ingesting...</span>
              </>
            ) : (
              <span>Start Ingestion</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
