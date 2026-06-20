'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  History, 
  Settings, 
  Trash2, 
  LogOut,
  User as UserIcon,
  MessageSquare,
  Heart
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { sessions, sessionId, loadSession, initSession, deleteSession } = useChat();

  const handleNewChat = async () => {
    await initSession();
    if (pathname !== '/chat') {
      router.push('/chat');
    }
  };

  const navItems = [
    { label: 'Health Risks', icon: Heart, path: '/health-risks' },
    { label: 'Chat History', icon: History, path: '/chat' },
    { label: 'Knowledge', icon: MessageSquare, path: '/knowledge' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-[320px] bg-[#f7f7f9] border-r border-[#e5e7eb] flex flex-col h-screen select-none shrink-0 overflow-y-auto">
      {/* Brand Logo */}
      <div className="p-[30px] flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center text-[#6d28d9]">
          <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
             <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div>
          <span className="font-extrabold text-[40px] text-slate-800 tracking-wider">AIVARA</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-[30px] mb-6 mt-2">
        <button 
          onClick={handleNewChat}
          className="w-full py-[12px] px-4 rounded-xl bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] text-white font-bold flex items-center justify-start gap-3 shadow-md transition duration-200 text-[16px] cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-[20px] space-y-2 block">
        {/* Navigation Routes */}
        <div className="space-y-2 mb-8 mt-[20px] block">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-[14px] rounded-xl text-[18px] font-semibold transition duration-200 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-[#1f2937] hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Chat History List */}
        {pathname === '/chat' && sessions.length > 0 && (
          <div className="mt-6 px-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Past Chats</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {sessions.map((sess) => {
                const isActive = sess.id === sessionId;
                return (
                  <div 
                    key={sess.id}
                    onClick={() => loadSession(sess.id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium cursor-pointer transition duration-150 ${
                      isActive 
                        ? 'bg-[#eef2ff] text-[#6d28d9]' 
                        : 'text-[#1f2937] hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="truncate flex-1 pr-3">{sess.title || 'Conversation'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(sess.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-rose-500 transition duration-150 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-6 border-t border-slate-200 bg-white">
        {user ? (
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-[#eef2ff] text-[#6d28d9] flex items-center justify-center font-bold text-xl select-none border border-indigo-100 shrink-0">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <span className="block text-lg font-bold text-slate-800 truncate leading-tight">
                  {user.full_name || 'Aivara User'}
                </span>
                <span className="block text-sm text-slate-400 truncate leading-none mt-1.5">
                  {user.email}
                </span>
              </div>
            </div>
            <button 
              onClick={signOut}
              title="Sign Out"
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition duration-150 cursor-pointer shrink-0"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link 
              href="/login"
              className="w-full py-4 text-center text-lg font-bold text-[#6d28d9] bg-[#eef2ff] hover:bg-indigo-100 rounded-xl transition duration-150 block"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
