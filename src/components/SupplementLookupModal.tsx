import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Send,
  MessageSquare,
  RefreshCw,
  Clock,
  Utensils,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ScheduleResponse, UserProfile } from '../types';

interface SupplementLookupProps {
  profile: UserProfile | null;
  schedule: ScheduleResponse | null;
}

export const SupplementLookupModal: React.FC<SupplementLookupProps> = ({
  profile,
  schedule
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'lookup'>('chat');

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hi! Ask me any question about your vitamins and supplements in plain English. For example, you can ask when to take them, whether to take them with food, or what to avoid mixing together."
    }
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Quick Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  const handleSendChat = async (textToSend?: string) => {
    const msg = (textToSend || chatInput).trim();
    if (!msg || isSendingChat) return;

    const newHistory = [...chatMessages, { role: 'user' as const, text: msg }];
    setChatMessages(newHistory);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const conversationHistory = chatMessages
        .filter((m, idx) => idx > 0 || m.role === 'user') // Skip welcome greeting
        .slice(-4)
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          text: m.text
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: msg,
          profile,
          schedule,
          history: conversationHistory
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || "Take vitamins with food and keep Iron and Calcium 2 hours apart for best results." }
      ]);
    } catch (err) {
      // Fallback answers in simple language
      let fallbackText = "Here is a simple rule of thumb: take vitamins A, D, E, and K with a meal that has some healthy fat (like eggs, yogurt, or nuts). Take relaxing minerals like Magnesium in the evening, and always keep Iron and Calcium at least 2 hours apart.";
      const lower = msg.toLowerCase();
      if (lower.includes('coffee') || lower.includes('caffeine')) {
        fallbackText = "It is best to wait 30 to 60 minutes after drinking coffee before taking your vitamins. Coffee can lower how well your body absorbs minerals like Iron and Calcium.";
      } else if (lower.includes('magnesium')) {
        fallbackText = "Magnesium is best taken in the evening or 30 to 60 minutes before bed with dinner or a light snack, because it helps relax your muscles and supports restful sleep.";
      } else if (lower.includes('iron') && lower.includes('calcium')) {
        fallbackText = "Keep Iron and Calcium at least 2 hours apart! If taken together, Calcium blocks your body from absorbing the Iron properly.";
      } else if (lower.includes('iron')) {
        fallbackText = "Iron is best absorbed with Vitamin C (like citrus fruit or juice). Keep it at least 2 hours away from Calcium, coffee, or dairy.";
      } else if (lower.includes('zinc')) {
        fallbackText = "Take Zinc with a full meal to prevent nausea. If you take Zinc daily, make sure you also get some Copper from nuts or seeds.";
      } else if (lower.includes('creatine')) {
        fallbackText = "Creatine can be taken any time of day, but works great with a meal or post-workout drink. The most important key is taking it every single day with plenty of water.";
      } else if (lower.includes('ashwagandha')) {
        fallbackText = "Ashwagandha helps with stress and calmness. Most people like taking it in the evening with food or warm milk.";
      } else if (lower.includes('food') || lower.includes('empty')) {
        fallbackText = "Most vitamins (like Vitamin D, Multivitamins, and Zinc) are much gentler on your stomach and absorb best when taken with food. Only a few supplements, like some amino acids or probiotics, work best on an empty stomach.";
      }
      setChatMessages((prev) => [...prev, { role: 'assistant', text: fallbackText }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleLookup = async (queryToSearch?: string) => {
    const q = (queryToSearch || lookupQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setLookupResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch('/api/gemini/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ query: q })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      const data = await res.json();
      if (data && data.nutrient) {
        setLookupResult(data);
      } else {
        throw new Error('No data');
      }
    } catch (err: any) {
      // Basic fallback
      setLookupResult({
        isVerifiedSeed: false,
        nutrient: {
          name: q,
          type: 'Supplement',
          bestTiming: 'With breakfast or lunch',
          withFood: true,
          withFoodNotes: 'Take with a meal and a tall glass of water',
          synergizesWith: ['Water', 'Healthy meals'],
          avoidPairingWith: ['Coffee right away', 'Heavy minerals at the same time'],
          typicalAdultRange: 'Follow directions on bottle',
          cyclingNotes: 'Safe for daily use',
          safetyNotice: 'If taking medications or pregnant, check with your doctor.'
        },
        badge: 'General guidance',
        disclaimer: 'General tips. Check your product label for exact directions.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQuestions = [
    'Can I take Vitamin D with morning coffee?',
    'Why should Magnesium be taken before bed?',
    'Can I take Iron and Calcium together?',
    'Should I take Omega-3 with food or empty stomach?'
  ];

  const popularSupplements = ['Vitamin D3', 'Magnesium', 'Iron', 'Creatine', 'Zinc', 'Ashwagandha'];

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-3">
      {/* Minimal Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                Plain English AI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal tracking-tight">
              Ask AI
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans">
              Simple, clear answers about when to take your vitamins and what not to mix.
            </p>
          </div>

          {/* Minimal 2-tab switch */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-medium self-start sm:self-center shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-stone-950 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-700" />
              <span>Ask a Question</span>
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'lookup'
                  ? 'bg-white text-stone-950 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-stone-700" />
              <span>Quick Lookup</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ASK A QUESTION (CHAT) */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-2xs space-y-4">
          {/* Messages Feed */}
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs sm:text-sm ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl max-w-lg leading-relaxed text-xs sm:text-sm ${
                    m.role === 'user'
                      ? 'bg-stone-900 text-stone-50 rounded-tr-xs'
                      : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isSendingChat && (
              <div className="flex gap-2.5 text-xs text-stone-500 items-center">
                <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Finding simple answer...</span>
              </div>
            )}
          </div>

          {/* Quick One-Tap Questions */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <span className="text-[11px] text-stone-400 font-medium">Tap to ask:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSendChat(q)}
                  disabled={isSendingChat}
                  className="bg-stone-50 hover:bg-stone-100 text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs transition-colors cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything, e.g. What is the best time to take zinc?"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm font-sans"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatInput.trim()}
              className="bg-stone-900 hover:bg-stone-800 text-amber-200 px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: QUICK LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="Type any supplement (e.g. Magnesium, Zinc, Creatine, Ashwagandha)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs sm:text-sm"
                />
              </div>

              <button
                onClick={() => handleLookup()}
                disabled={isSearching || !lookupQuery.trim()}
                className="bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              >
                {isSearching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-200" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-amber-200" />
                )}
                <span>Check</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-stone-400 text-[11px] font-medium mr-1">Popular:</span>
              {popularSupplements.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setLookupQuery(item);
                    handleLookup(item);
                  }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Simple, Non-Expert Result Card */}
          {lookupResult && lookupResult.nutrient && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif text-stone-950 font-normal">
                    {lookupResult.nutrient.name}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {lookupResult.nutrient.type || 'Dietary supplement'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Easy Guide
                </span>
              </div>

              {/* 4 Clean Attribute Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Best Time */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-700 font-medium text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Best Time</span>
                  </div>
                  <p className="text-stone-950 font-medium pl-5">
                    {lookupResult.nutrient.bestTiming || 'With breakfast or dinner'}
                  </p>
                </div>

                {/* With Food? */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-700 font-medium text-xs">
                    <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Take With Food?</span>
                  </div>
                  <p className="text-stone-950 font-medium pl-5">
                    {lookupResult.nutrient.withFood
                      ? 'Yes, take with a meal'
                      : 'Can take with or without food'}
                  </p>
                  {lookupResult.nutrient.withFoodNotes && (
                    <p className="text-[11px] text-stone-500 pl-5">
                      {lookupResult.nutrient.withFoodNotes}
                    </p>
                  )}
                </div>

                {/* Good pairings */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-700 font-medium text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pairs Well With</span>
                  </div>
                  <div className="pl-5 pt-0.5 flex flex-wrap gap-1">
                    {lookupResult.nutrient.synergizesWith && lookupResult.nutrient.synergizesWith.length > 0 ? (
                      lookupResult.nutrient.synergizesWith.map((s: string) => (
                        <span key={s} className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-800 text-[11px]">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-500 text-[11px]">Regular meals and plenty of water</span>
                    )}
                  </div>
                </div>

                {/* What to avoid mixing */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-700 font-medium text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Keep 2 Hours Away From</span>
                  </div>
                  <div className="pl-5 pt-0.5 flex flex-wrap gap-1">
                    {lookupResult.nutrient.avoidPairingWith && lookupResult.nutrient.avoidPairingWith.length > 0 ? (
                      lookupResult.nutrient.avoidPairingWith.map((a: string) => (
                        <span key={a} className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-500 text-[11px]">No common conflicts</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Typical Dose and Safety Note */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/60">
                <div>
                  <span className="text-stone-500 font-medium">Typical Daily Dose: </span>
                  <span className="text-stone-900 font-semibold">{lookupResult.nutrient.typicalAdultRange}</span>
                </div>
                {lookupResult.nutrient.cyclingNotes && (
                  <div className="text-stone-500">
                    <span className="font-medium">Directions: </span>
                    <span>{lookupResult.nutrient.cyclingNotes}</span>
                  </div>
                )}
              </div>

              {lookupResult.nutrient.safetyNotice && (
                <p className="text-[11px] text-stone-500 bg-stone-100/70 px-3.5 py-2 rounded-xl">
                  <strong>Note: </strong> {lookupResult.nutrient.safetyNotice}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
