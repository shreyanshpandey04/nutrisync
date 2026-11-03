import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile, ScheduleResponse } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (
    user: { id: string; email: string; name: string },
    profile: UserProfile | null,
    schedule: ScheduleResponse | null
  ) => void;
  initialMode?: 'signin' | 'register';
}

interface SavedUser {
  id: string;
  email: string;
  name: string;
  hasProfile: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'switch'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);

  // Fetch list of local users for quick switching
  useEffect(() => {
    if (!isOpen) return;
    async function fetchUsers() {
      try {
        const res = await fetch('/api/auth/users');
        if (res.ok) {
          const data = await res.json();
          setSavedUsers(data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch user accounts:', err);
      }
    }
    fetchUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create account');
        }

        onAuthSuccess(data.user, null, null);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Error creating account');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign In
      if (!email) {
        setError('Please enter your email address');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials');
        }

        onAuthSuccess(data.user, data.profile, data.schedule);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Error signing in');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectSavedUser = async (userToSwitch: SavedUser) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/current?userId=${userToSwitch.id}`);
      if (res.ok) {
        const data = await res.json();
        onAuthSuccess(data.user, data.profile, data.schedule);
        onClose();
      }
    } catch (err) {
      setError('Could not switch account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsDemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();
      onAuthSuccess(data.user, data.profile, data.schedule);
      onClose();
    } catch (err) {
      setError('Could not load demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-200 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-stone-950 font-normal">
                {mode === 'register'
                  ? 'Establish Member Profile'
                  : mode === 'signin'
                  ? 'Access NutriSync'
                  : 'Switch Profile'}
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {mode === 'register'
                  ? 'Synthesize and persist your personalized chrono-protocol'
                  : 'Access your circadian timeline, adherence, and nutrient stacks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Register vs Switch */}
        <div className="flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 text-xs font-sans font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'signin'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-stone-700" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-stone-700" />
            <span>Register</span>
          </button>
          {savedUsers.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setMode('switch');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'switch'
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-stone-700" />
              <span>Profiles</span>
            </button>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-2.5 font-sans">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE: SWITCH ACCOUNT */}
        {mode === 'switch' ? (
          <div className="space-y-3 font-sans">
            <p className="text-xs text-stone-500">Saved user profiles on this deployment:</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {savedUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectSavedUser(u)}
                  className="w-full text-left p-3.5 rounded-2xl border border-stone-200/90 hover:border-stone-400 hover:bg-stone-50/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-200 flex items-center justify-center font-serif font-medium text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-950">{u.name}</p>
                      <p className="text-[11px] text-stone-500">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-md">
                    {u.hasProfile ? 'Protocol Active' : 'New'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* FORM: SIGN IN OR REGISTER */
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm text-stone-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm text-stone-900"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5">
                  Confirm Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm text-stone-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-sans font-medium py-3 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 mt-3 active:scale-95"
            >
              {isLoading ? (
                <span>Calibrating credentials...</span>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account & Commence Onboarding</span>
                  <ArrowRight className="w-4 h-4 text-amber-200" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-amber-200" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo Fast-Track Button */}
        <div className="pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={handleContinueAsDemo}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-2xl border border-stone-200/90 bg-stone-50/70 hover:bg-stone-100 text-stone-700 text-xs font-sans font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-900" />
            <span>Fast-Track with Demonstration Profile (Alex Rivera)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
