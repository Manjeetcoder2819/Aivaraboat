'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back! 👋');
      router.push('/chat');
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning className="login-page font-sora">
      <div className="login-container">
        
        {/* Brand Header */}
        <div className="login-logo-section">
          <div className="login-logo bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="login-brand font-bold">
            <span>AIVARA</span>
          </h1>
          <p className="login-subtitle font-medium">
            AI-Powered Healthcare Companion
          </p>
        </div>

        {/* Form Card */}
        <div className="login-card">
          <h2 className="login-title font-bold">
            Welcome back
          </h2>
          <p className="login-text font-medium text-slate-500">
            Sign in to continue to Aivara
          </p>

          <form onSubmit={handleLogin} className="login-form" autoComplete="off">
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label font-semibold">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="login-input"
                placeholder="you@example.com"
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password" className="login-label font-semibold">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                autoComplete="off"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="login-btn font-semibold cursor-pointer">
              {loading ? (
                <>
                  <span className="login-loader mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div />
            <span>or</span>
            <div />
          </div>

          <p className="login-footer font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="login-link font-semibold">
              Create one free
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="login-privacy font-medium text-slate-400">
          🔒 Your health data is private and encrypted
        </p>
      </div>
    </div>
  );
}