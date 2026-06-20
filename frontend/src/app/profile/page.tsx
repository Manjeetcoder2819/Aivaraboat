'use client';

import './profile.css';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HealthProfile {
  age?: number;
  gender?: string;
  blood_type?: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  family_history: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<HealthProfile>({
    allergies: [],
    chronic_conditions: [],
    current_medications: [],
    family_history: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    api.getProfile()
      .then((data) => {
        setProfile({
          age: data.age || undefined,
          gender: data.gender || '',
          blood_type: data.blood_type || '',
          allergies: data.allergies || [],
          chronic_conditions: data.chronic_conditions || [],
          current_medications: data.current_medications || [],
          family_history: data.family_history || [],
        });
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profile);
      toast.success('Profile saved! AI will personalize your responses.');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateList = (field: keyof HealthProfile, value: string) => {
    const arr = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setProfile((p) => ({
      ...p,
      [field]: arr,
    }));
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="profile-loading font-sora py-12 text-center text-slate-500 font-medium">
        Loading health profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page font-sora select-none">
      <div className="profile-container">
        
        {/* Back Button */}
        <button onClick={() => router.push('/chat')} className="profile-back-btn cursor-pointer">
          <ArrowLeft size={15} />
          <span>Back to Chat</span>
        </button>

        <div className="profile-card">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-icon bg-violet-100 border border-violet-200 text-violet-600 flex items-center justify-center">
              <User size={24} className="profile-user-icon" />
            </div>
            <div>
              <h1 className="profile-title font-bold">
                Health Profile
              </h1>
              <p className="profile-subtitle font-medium text-slate-500">
                Personalizes every AI response to your specific health context
              </p>
            </div>
          </div>

          <div className="profile-list-section">
            {/* Basic Info Row */}
            <div className="profile-grid">
              <div className="profile-field">
                <label className="profile-label font-semibold">Age</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      age: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className="profile-input"
                  placeholder="e.g. 28"
                />
              </div>

              <div className="profile-field">
                <label className="profile-label font-semibold">Gender</label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      gender: e.target.value,
                    }))
                  }
                  className="profile-select"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="profile-field">
                <label className="profile-label font-semibold">Blood Type</label>
                <select
                  value={profile.blood_type || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      blood_type: e.target.value,
                    }))
                  }
                  className="profile-select"
                >
                  <option value="">Unknown</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Fields */}
            {[
              {
                field: 'allergies' as const,
                label: 'Allergies',
                placeholder: 'penicillin, peanuts, latex',
                hint: 'Enter allergies separated by commas',
              },
              {
                field: 'chronic_conditions' as const,
                label: 'Chronic Conditions',
                placeholder: 'hypertension, type 2 diabetes',
                hint: 'Any ongoing health conditions',
              },
              {
                field: 'current_medications' as const,
                label: 'Current Medications',
                placeholder: 'metformin 500mg, lisinopril 10mg',
                hint: 'Medications you currently take',
              },
              {
                field: 'family_history' as const,
                label: 'Family History',
                placeholder: 'heart disease, diabetes, cancer',
                hint: 'Health conditions in your family',
              },
            ].map(({ field, label, placeholder, hint }) => (
              <div key={field} className="profile-field">
                <label className="profile-label font-semibold">{label}</label>
                <p className="profile-hint font-medium text-slate-400">{hint}</p>
                <input
                  type="text"
                  value={(profile[field] || []).join(', ')}
                  onChange={(e) => updateList(field, e.target.value)}
                  className="profile-input"
                  placeholder={`e.g. ${placeholder}`}
                />
              </div>
            ))}

            {/* Save Button */}
            <button onClick={handleSave} disabled={saving} className="profile-save-btn font-semibold cursor-pointer">
              {saving ? (
                <>
                  <span className="profile-loader mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Health Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}