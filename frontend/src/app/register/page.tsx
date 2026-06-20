'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import './register.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await signUp(form.email.trim(), form.password, form.full_name.trim());
      if (data && !data.access_token) {
        toast.success(data.message || 'Account created! Please verify your email before logging in.', {
          duration: 6000
        });
        router.push('/login');
      } else {
        toast.success('Welcome to AIVARA! 🎉');
        router.replace('/chat');
      }
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: 'full_name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'John Smith',
      required: false,
      autoComplete: 'name',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
      autoComplete: 'email',
    },
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Minimum 6 characters',
      required: true,
      autoComplete: 'new-password',
    },
  ];

  return (
    <div suppressHydrationWarning className="register-page font-sora">
      <div className="register-container">
        
        {/* Brand Header */}
        <div className="register-logo-section">
          <div className="register-logo bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="register-brand font-bold">
            <span>AIVARA</span>
          </h1>
          <p className="register-subtitle font-medium">
            Create your AI healthcare account
          </p>
        </div>

        {/* Card Panel */}
        <div className="register-card">
          <h2 className="register-title font-bold">
            Create Account
          </h2>
          <p className="register-text font-medium text-slate-500">
            Free forever · Secure · AI Powered
          </p>

          <form onSubmit={handleRegister} className="register-form">
            {fields.map(({ key, label, type, placeholder, required, autoComplete }) => (
              <div key={key} className="field-group">
                <label htmlFor={`register-${key}`} className="field-label font-semibold">
                  {label}
                  {!required && <span className="optional font-medium text-slate-400"> (optional)</span>}
                </label>
                <input
                  id={`register-${key}`}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  required={required}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className="register-input"
                  minLength={key === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="register-btn font-semibold cursor-pointer">
              {loading ? (
                <>
                  <span className="loader mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Free Account →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div />
            <span>or</span>
            <div />
          </div>

          {/* Toggle Login link */}
          <p className="register-footer font-medium">
            Already have an account?{' '}
            <Link href="/login" className="register-link font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="privacy-text font-medium text-slate-400">
          🔒 Your health data is encrypted and secure
        </p>
      </div>
    </div>
  );
}