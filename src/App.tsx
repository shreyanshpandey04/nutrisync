import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTimeline } from './components/DashboardTimeline';
import { OnboardingWizard } from './components/OnboardingWizard';
import { HomeScreen } from './components/HomeScreen';
import { ConflictWarningBanner } from './components/ConflictWarningBanner';
import { NutrientCatalog } from './components/NutrientCatalog';
import { AdherenceTracker } from './components/AdherenceTracker';
import { SupplementLookupModal } from './components/SupplementLookupModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { AuthModal } from './components/AuthModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { UserProfile, ScheduleResponse, AdherenceLog, ScheduleItem, RegimenTier, HealthGoal } from './types';
import { runDeterministicRuleEngine } from './utils/ruleEngine';
import { Sparkles, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { ChronoSynthesisExperience } from './components/ChronoSynthesisExperience';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'nutrients' | 'warnings' | 'adherence' | 'lookup'>('home');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [adherenceLogs, setAdherenceLogs] = useState<AdherenceLog[]>([]);
  const [adherenceMap, setAdherenceMap] = useState<Record<string, boolean>>({});

  // Modals & Flows
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');

  // Live Chrono-Synthesis Engine states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [pendingProfileForSynthesis, setPendingProfileForSynthesis] = useState<UserProfile | null>(null);
  const [pendingUserForSynthesis, setPendingUserForSynthesis] = useState<AuthUser | null>(null);

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasAIGenerated, setHasAIGenerated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load adherence for specific user
  const loadUserAdherence = async (userId: string) => {
    try {
      const res = await fetch(`/api/adherence?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAdherenceLogs(data.adherence || []);
        const todayStr = new Date().toISOString().split('T')[0];
        const map: Record<string, boolean> = {};
        (data.adherence || []).forEach((log: AdherenceLog) => {
          if (log.date === todayStr) {
            map[log.scheduleItemId] = log.taken;
          }
        });
        setAdherenceMap(map);
      }
    } catch (err) {
      console.error('Error fetching adherence:', err);
    }
  };

  // Load active session on startup
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/auth/current');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
          if (data.profile) {
            setProfile(data.profile);
            setSchedule(data.schedule || runDeterministicRuleEngine(data.profile));
            if (data.user?.id) {
              loadUserAdherence(data.user.id);
            }
            setActiveTab('timeline');
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    initSession();
  }, []);

  // Execute deterministic rule engine and persist profile
  const executeSaveProfile = async (newProfile: UserProfile) => {
    if (currentUser?.id) {
      newProfile.id = currentUser.id;
      newProfile.email = currentUser.email;
    }

    // 1. Immediately calculate deterministic schedule client-side
    const computedSchedule = runDeterministicRuleEngine(newProfile);
    setProfile(newProfile);
    setSchedule(computedSchedule);
    setIsOnboardingOpen(false);
    setActiveTab('timeline');
    setHasAIGenerated(false);

    // Update current user name if changed
    if (currentUser && newProfile.name) {
      setCurrentUser({ ...currentUser, name: newProfile.name });
    }

    // 2. Persist to backend
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
    } catch (err) {
      console.error('Failed to persist profile:', err);
    }
  };

  // Launch interactive Chrono-Synthesis Experience
  const handleInitiateSynthesis = (newProfile: UserProfile) => {
    setPendingProfileForSynthesis(newProfile);
    setIsSynthesizing(true);
  };

  // Conclude Chrono-Synthesis and transition to finalized schedule
  const handleFinishSynthesis = () => {
    const target = pendingProfileForSynthesis || profile;
    if (pendingUserForSynthesis) {
      setCurrentUser(pendingUserForSynthesis);
      setPendingUserForSynthesis(null);
    }
    if (target) {
      executeSaveProfile(target);
    }
    setIsSynthesizing(false);
    setPendingProfileForSynthesis(null);
  };

  // Re-run synthesis on demand
  const handleResynthesize = () => {
    if (profile) {
      setPendingProfileForSynthesis(profile);
      setIsSynthesizing(true);
    }
  };

  // Switch regimen complexity tier (Pareto Principle: Beginner 80/20, Intermediate, Advanced)
  const handleUpdateTier = (newTier: RegimenTier) => {
    if (!profile) return;
    const updatedProfile: UserProfile = { ...profile, regimenTier: newTier };
    executeSaveProfile(updatedProfile);
  };

  // Toggle adherence
  const handleToggleAdherence = async (item: ScheduleItem, taken: boolean, dateStr?: string) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    // Optimistically update local state
    if (targetDate === todayStr) {
      setAdherenceMap((prev) => ({ ...prev, [item.id]: taken }));
    }

    setAdherenceLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === targetDate && l.scheduleItemId === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], taken, timestamp: new Date().toISOString() };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: targetDate,
            scheduleItemId: item.id,
            nutrientName: item.nutrientName,
            taken,
            timestamp: new Date().toISOString()
          }
        ];
      }
    });

    // Sync to backend
    try {
      await fetch('/api/adherence/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: targetDate,
          scheduleItemId: item.id,
          nutrientName: item.nutrientName,
          taken,
          userId: currentUser?.id
        })
      });
    } catch (err) {
      console.error('Failed to sync adherence:', err);
    }
  };

  // Generate Gemini Explanations
  const handleGenerateAIExplanations = async () => {
    if (!schedule || isLoadingAI) return;
    setIsLoadingAI(true);

    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule,
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.explanations) {
          const updatedItems = schedule.schedule.map((item) => ({
            ...item,
            aiExplanation: data.explanations[item.id] || item.aiExplanation
          }));

          setSchedule({
            ...schedule,
            schedule: updatedItems
          });
          setHasAIGenerated(true);
        }
      }
    } catch (err) {
      console.error('Error fetching AI explanations:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Auth callbacks
  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (
    user: AuthUser,
    newProfile: UserProfile | null,
    newSchedule: ScheduleResponse | null
  ) => {
    setCurrentUser(user);
    if (newProfile) {
      setProfile(newProfile);
      setSchedule(newSchedule || runDeterministicRuleEngine(newProfile));
      loadUserAdherence(user.id);
      setIsOnboardingOpen(false);
    } else {
      // Brand new user without a profile -> launch onboarding
      setProfile(null);
      setSchedule(null);
      setAdherenceLogs([]);
      setAdherenceMap({});
      setIsOnboardingOpen(true);
    }
    setActiveTab('timeline');
  };

  const handleFastTrackDemo = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPendingUserForSynthesis(data.user);
        setPendingProfileForSynthesis(data.profile);
        setIsSynthesizing(true);
      }
    } catch (err) {
      console.error('Fast-track demo failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleStartPersonalSchedule = async (params?: { name?: string; goals?: HealthGoal[]; bedtime?: string; wakeTime?: string }) => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const customName = params?.name?.trim() || 'You';
        const baseUser = { ...data.user, name: customName };
        const baseProfile: UserProfile = {
          ...data.profile,
          name: customName,
          goals: params?.goals && params.goals.length > 0 ? params.goals : (data.profile.goals || ['Better Sleep', 'More Energy']),
          sleepTime: params?.bedtime || data.profile.sleepTime || '23:00',
          wakeTime: params?.wakeTime || data.profile.wakeTime || '07:00'
        };
        setPendingUserForSynthesis(baseUser);
        setPendingProfileForSynthesis(baseProfile);
        setIsSynthesizing(true);
      }
    } catch (err) {
      console.error('Personal schedule creation failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleOpenWizardAsGuest = async () => {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setProfile(data.profile);
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.error('Failed to open wizard:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setProfile(null);
    setSchedule(null);
    setAdherenceLogs([]);
    setAdherenceMap({});
    setActiveTab('home');
  };

  const warningCount = (schedule?.warnings || []).length;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-600">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">Initializing NutriSync Chrono-Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/80 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        warningCount={warningCount}
        user={currentUser}
        profile={profile}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onResynthesize={handleResynthesize}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {!currentUser ? (
          /* Gated Non-Authenticated State: Serene, luxury editorial landing page */
          <HomeScreen
            onOpenAuth={handleOpenAuth}
            onFastTrackDemo={handleFastTrackDemo}
            onCreateSchedule={handleStartPersonalSchedule}
            onOpenWizard={handleOpenWizardAsGuest}
          />
        ) : (
          /* Authenticated Protocol Workspace */
          <>
            {isOnboardingOpen ? (
              <div className="space-y-4">
                <OnboardingWizard
                  initialProfile={profile}
                  onComplete={handleInitiateSynthesis}
                  onCancel={profile ? () => setIsOnboardingOpen(false) : undefined}
                />
              </div>
            ) : (
              <>
                {/* TAB 1: DAILY TIMELINE */}
                {activeTab === 'timeline' && (
                  <DashboardTimeline
                    scheduleItems={schedule?.schedule || []}
                    profile={profile}
                    adherenceMap={adherenceMap}
                    onToggleAdherence={handleToggleAdherence}
                    onGenerateAIExplanations={handleGenerateAIExplanations}
                    isLoadingAI={isLoadingAI}
                    hasAIGenerated={hasAIGenerated}
                    onUpdateTier={handleUpdateTier}
                    onResynthesize={handleResynthesize}
                  />
                )}

                {/* TAB 2: NUTRIENT KNOWLEDGE BASE */}
                {activeTab === 'nutrients' && <NutrientCatalog />}

                {/* TAB 3: SAFETY & CONFLICT WARNINGS */}
                {activeTab === 'warnings' && (
                  <ConflictWarningBanner
                    warnings={schedule?.warnings || []}
                    onNavigateToTimeline={() => setActiveTab('timeline')}
                  />
                )}

                {/* TAB 4: ADHERENCE & HEATMAP */}
                {activeTab === 'adherence' && (
                  <AdherenceTracker
                    adherenceLogs={adherenceLogs}
                    scheduleItems={schedule?.schedule || []}
                    adherenceMap={adherenceMap}
                    onToggleAdherence={handleToggleAdherence}
                  />
                )}

                {/* TAB 5: ASK AI / SUPPLEMENT LOOKUP */}
                {activeTab === 'lookup' && (
                  <SupplementLookupModal profile={profile} schedule={schedule} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Interactive Bespoke Chrono-Synthesis Experience */}
      {isSynthesizing && (pendingProfileForSynthesis || profile) && (
        <ChronoSynthesisExperience
          profile={(pendingProfileForSynthesis || profile)!}
          onFinish={handleFinishSynthesis}
          onCancel={() => {
            setIsSynthesizing(false);
            setPendingProfileForSynthesis(null);
            setPendingUserForSynthesis(null);
          }}
        />
      )}

      {/* Quick Profile Settings Dialog */}
      {isSettingsOpen && profile && (
        <ProfileSettingsModal
          profile={profile}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(updatedProfile) => {
            setIsSettingsOpen(false);
            handleInitiateSynthesis(updatedProfile);
          }}
          onReopenFullOnboarding={() => {
            setIsSettingsOpen(false);
            setIsOnboardingOpen(true);
          }}
        />
      )}

      {/* Authentication Modal (Sign In / Register / Switch Account) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
        />
      )}

      {/* Non-Negotiable Medical & Regulatory Disclaimer Footer */}
      <DisclaimerFooter />
    </div>
  );
}
