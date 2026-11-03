import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  BookOpen,
  ShieldAlert,
  CalendarCheck,
  Search,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Settings,
  Scale,
  Activity,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'timeline' | 'nutrients' | 'warnings' | 'adherence' | 'lookup';
  setActiveTab: (tab: 'home' | 'timeline' | 'nutrients' | 'warnings' | 'adherence' | 'lookup') => void;
  warningCount: number;
  user: { id: string; email: string; name: string } | null;
  profile: UserProfile | null;
  onOpenOnboarding: () => void;
  onOpenSettings: () => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  onLogout: () => void;
  onResynthesize?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  warningCount,
  user,
  profile,
  onOpenOnboarding,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  onResynthesize
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#fbfaf7]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Mark */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab(user ? 'timeline' : 'home')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-950 text-amber-50 flex items-center justify-center border border-stone-800 transition-all group-hover:bg-stone-900 shadow-2xs">
              <span className="font-serif text-lg font-normal tracking-wider text-amber-200/90">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl tracking-tight text-stone-950 font-normal leading-none">
                  NutriSync
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-stone-600 bg-stone-100/90 border border-stone-200/80 px-2 py-0.5 rounded-md">
                  Clinical Chronobiology
                </span>
              </div>
              <p className="text-[11px] font-sans text-stone-500 tracking-wide mt-0.5 hidden md:block">
                Circadian supplement timing & receptor optimization
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (when logged in) */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/70 shadow-2xs">
              <button
                id="nav-timeline-tab"
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-white text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-stone-700" />
                <span>Today&apos;s Protocol</span>
              </button>

              <button
                id="nav-warnings-tab"
                onClick={() => setActiveTab('warnings')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all relative cursor-pointer ${
                  activeTab === 'warnings'
                    ? 'bg-white text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-stone-700" />
                <span>Safety & Interactions</span>
                {warningCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-500 text-white leading-none">
                    {warningCount}
                  </span>
                )}
              </button>

              <button
                id="nav-nutrients-tab"
                onClick={() => setActiveTab('nutrients')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all cursor-pointer ${
                  activeTab === 'nutrients'
                    ? 'bg-white text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                <span>Compounds (28)</span>
              </button>

              <button
                id="nav-adherence-tab"
                onClick={() => setActiveTab('adherence')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all cursor-pointer ${
                  activeTab === 'adherence'
                    ? 'bg-white text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 text-stone-700" />
                <span>Adherence</span>
              </button>

              <button
                id="nav-lookup-tab"
                onClick={() => setActiveTab('lookup')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all cursor-pointer ${
                  activeTab === 'lookup'
                    ? 'bg-white text-stone-950 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Ask AI</span>
              </button>
            </nav>
          )}

          {/* User Profile / Auth Area */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-full border border-stone-200/90 bg-white hover:border-stone-300 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-200 flex items-center justify-center text-xs font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-medium text-stone-950 leading-tight">
                      {user.name || 'Your Protocol'}
                    </p>
                    <p className="text-[10px] text-stone-500 font-sans leading-none mt-0.5">
                      {profile?.regimenTier || 'Beginner'} · {profile?.weightKg ? `${profile.weightKg}kg` : 'Calibrated'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Account & Protocol Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-950">{user.name}</p>
                      <p className="text-[11px] text-stone-500 font-sans truncate">{user.email}</p>
                      {profile && (
                        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                          <span className="flex items-center gap-1">
                            <Scale className="w-3 h-3 text-stone-400" />
                            {profile.weightKg} kg · {profile.age} yrs
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-800 text-[10px]">
                            {profile.regimenTier || 'Beginner'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-400" />
                        <span>Edit Health Stats & Timing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenOnboarding();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                        <span>Full Protocol Assessment</span>
                      </button>

                      {onResynthesize && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onResynthesize();
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Re-Synthesize Schedule</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 rounded-xl text-xs font-medium bg-stone-950 hover:bg-stone-900 text-stone-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (when logged in) */}
        {user && (
          <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-stone-200/60 no-scrollbar gap-1 text-xs">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Protocol
            </button>
            <button
              onClick={() => setActiveTab('warnings')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-1 ${
                activeTab === 'warnings'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <span>Safety</span>
              {warningCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                  {warningCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('nutrients')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === 'nutrients'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Compounds
            </button>
            <button
              onClick={() => setActiveTab('adherence')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === 'adherence'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Adherence
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === 'lookup'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Ask AI
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
