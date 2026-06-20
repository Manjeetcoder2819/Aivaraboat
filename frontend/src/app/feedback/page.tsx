'use client';

import React, { useState } from 'react';
import ChatLayout from '@/components/layout/ChatLayout';
import { useAuth } from '@/context/AuthContext';
import { Star, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

function FeedbackForm() {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please add your feedback comments.');
      return;
    }

    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      toast.success('Thank you! Your feedback has been sent to our medical audit team. 🩺');
      setComment('');
      setRating(5);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 font-sora select-none">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">System Feedback</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Help us audit and improve Aivara's clinical safety and response accuracy</p>
      </header>

      <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Share Your Experience</h2>
            <p className="text-[10px] text-slate-400 font-semibold">We monitor chatbot responses for accuracy and hallucinations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Response Quality Rating</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition duration-150 cursor-pointer"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= rating 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-300 hover:text-amber-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="feedback-comments" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Detailed Comments
            </label>
            <textarea
              id="feedback-comments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could be improved? Did the AI reference matching find correct medical papers?"
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-400 focus:shadow-xs rounded-xl outline-hidden resize-none h-36 transition leading-relaxed text-slate-700"
              required
              disabled={submitting}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold text-xs transition duration-150 cursor-pointer ${
              comment.trim() && !submitting
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-100'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <ChatLayout>
      <FeedbackForm />
    </ChatLayout>
  );
}
