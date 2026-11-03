import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SEED_NUTRIENTS } from './src/data/nutrients.ts';
import { runDeterministicRuleEngine } from './src/utils/ruleEngine.ts';
import { UserProfile, AdherenceLog, ScheduleResponse } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI lazily with telemetry User-Agent header
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Simple persistent storage in local json file
const DB_PATH = path.join(process.cwd(), 'data', 'store.json');

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt?: string;
}

interface DatabaseAdherenceLog extends AdherenceLog {
  userId?: string;
}

interface DatabaseStore {
  users: DatabaseUser[];
  profiles: Record<string, UserProfile>;
  schedules: Record<string, ScheduleResponse>;
  adherence: DatabaseAdherenceLog[];
  currentSessionUserId?: string;
}

function loadDatabase(): DatabaseStore {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading db store:', err);
  }

  // Default demo user with complete profile
  const defaultProfile: UserProfile = {
    id: 'demo-user-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    age: 29,
    sex: 'male',
    heightCm: 180,
    weightKg: 78,
    useImperial: false,
    pregnantOrNursing: false,
    hasIronDeficiency: false,
    activityLevel: 'moderately_active',
    goals: ['Muscle Gain & Performance', 'Better Sleep', 'Clear/Healthy Skin'],
    dietType: 'omnivore',
    allergies: [],
    existingSupplements: ['Vitamin D3', 'Multivitamin'],
    existingMedications: [],
    wakeTime: '06:30',
    sleepTime: '23:00',
    mealCount: 3,
    breakfastTime: '07:30',
    lunchTime: '12:30',
    dinnerTime: '19:30',
    hasWorkout: true,
    workoutTime: '17:30',
    fastingWindow: ''
  };

  const initialSchedule = runDeterministicRuleEngine(defaultProfile);

  return {
    users: [
      {
        id: 'demo-user-1',
        email: 'alex.rivera@example.com',
        name: 'Alex Rivera'
      }
    ],
    profiles: {
      'demo-user-1': defaultProfile
    },
    schedules: {
      'demo-user-1': initialSchedule
    },
    adherence: [
      {
        date: new Date().toISOString().split('T')[0],
        scheduleItemId: 'sched-protein',
        nutrientName: 'Whey/Plant Protein',
        taken: true,
        timestamp: new Date().toISOString()
      },
      {
        date: new Date().toISOString().split('T')[0],
        scheduleItemId: 'sched-creatine',
        nutrientName: 'Creatine Monohydrate',
        taken: true,
        timestamp: new Date().toISOString()
      }
    ]
  };
}

let db = loadDatabase();

function saveDatabase() {
  try {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db store:', err);
  }
}

// ----------------- API Endpoints -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Nutrient knowledge base catalog (all 28 seed nutrients)
app.get('/api/nutrients', (req, res) => {
  res.json({ nutrients: SEED_NUTRIENTS });
});

app.get('/api/nutrients/:id', (req, res) => {
  const nut = SEED_NUTRIENTS.find((n) => n.id === req.params.id);
  if (!nut) return res.status(404).json({ error: 'Nutrient not found' });
  res.json({ nutrient: nut });
});

// Auth endpoints
// Register a new account
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const newUser: DatabaseUser = {
    id: `user-${Date.now()}`,
    email: email.trim().toLowerCase(),
    name: name?.trim() || email.split('@')[0],
    password, // Store password
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.currentSessionUserId = newUser.id;
  saveDatabase();

  return res.json({
    success: true,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    profile: null,
    schedule: null
  });
});

// Sign In with email & password
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email. Please check your spelling or create an account.' });
  }

  // If password was set on account, verify it
  if (user.password && password && user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  db.currentSessionUserId = user.id;
  saveDatabase();

  const profile = db.profiles[user.id] || null;
  const schedule = db.schedules[user.id] || null;

  return res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    profile,
    schedule
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  db.currentSessionUserId = undefined;
  saveDatabase();
  res.json({ success: true, message: 'Logged out successfully' });
});

// Switch to demo user (Alex Rivera)
app.post('/api/auth/demo', (req, res) => {
  const demoUser = db.users[0];
  db.currentSessionUserId = demoUser.id;
  saveDatabase();

  const profile = db.profiles[demoUser.id];
  const schedule = db.schedules[demoUser.id];
  res.json({
    user: { id: demoUser.id, email: demoUser.email, name: demoUser.name },
    profile,
    schedule
  });
});

// List all accounts on this instance for quick switcher
app.get('/api/auth/users', (req, res) => {
  const safeUsers = db.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    hasProfile: Boolean(db.profiles[u.id])
  }));
  res.json({ users: safeUsers });
});

// Get current session user
app.get('/api/auth/current', (req, res) => {
  const userId = (req.query.userId as string) || db.currentSessionUserId || db.users[0]?.id;
  const user = db.users.find((u) => u.id === userId) || db.users[0];

  if (!user) {
    return res.json({ user: null, profile: null, schedule: null });
  }

  const profile = db.profiles[user.id] || null;
  const schedule = db.schedules[user.id] || null;
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    profile,
    schedule
  });
});

// Save or Update User Profile & Generate Schedule
app.post('/api/profile', async (req, res) => {
  try {
    const profileData: UserProfile = req.body;
    if (!profileData.id) {
      profileData.id = db.currentSessionUserId || `user-${Date.now()}`;
    }

    // 1. Run deterministic rule engine first (Section 3 & 7 architecture)
    const baseSchedule = runDeterministicRuleEngine(profileData);

    db.profiles[profileData.id] = profileData;
    db.schedules[profileData.id] = baseSchedule;

    // Make sure user name reflects in user object
    const user = db.users.find((u) => u.id === profileData.id);
    if (user && profileData.name) {
      user.name = profileData.name;
    }

    saveDatabase();

    res.json({
      success: true,
      profile: profileData,
      schedule: baseSchedule
    });
  } catch (err: any) {
    console.error('Error saving profile:', err);
    res.status(500).json({ error: err.message || 'Failed to save profile' });
  }
});

// Fetch current schedule
app.get('/api/schedule', (req, res) => {
  const userId = (req.query.userId as string) || db.currentSessionUserId || 'demo-user-1';
  const schedule = db.schedules[userId] || null;
  const profile = db.profiles[userId] || null;
  res.json({ schedule, profile });
});

// Adherence tracking
app.get('/api/adherence', (req, res) => {
  const userId = (req.query.userId as string) || db.currentSessionUserId || 'demo-user-1';
  const userLogs = db.adherence.filter((a) => !a.userId || a.userId === userId);
  res.json({ adherence: userLogs });
});

app.post('/api/adherence/toggle', (req, res) => {
  const { date, scheduleItemId, nutrientName, taken, userId } = req.body;
  const targetUserId = userId || db.currentSessionUserId || 'demo-user-1';

  const existingIdx = db.adherence.findIndex(
    (a) => a.date === date && a.scheduleItemId === scheduleItemId && (a.userId === targetUserId || !a.userId)
  );

  if (existingIdx >= 0) {
    db.adherence[existingIdx].taken = taken;
    db.adherence[existingIdx].userId = targetUserId;
    db.adherence[existingIdx].timestamp = new Date().toISOString();
  } else {
    db.adherence.push({
      date,
      scheduleItemId,
      nutrientName,
      taken,
      userId: targetUserId,
      timestamp: new Date().toISOString()
    });
  }

  saveDatabase();
  const userLogs = db.adherence.filter((a) => !a.userId || a.userId === targetUserId);
  res.json({ success: true, adherence: userLogs });
});

// ----------------- Gemini AI Reasoning Layer -----------------

// 1. Plain-Language "Why" Explanations for each schedule slot (Grounded in Seed Table)
app.post('/api/gemini/explain', async (req, res) => {
  const { schedule, profile } = req.body;
  if (!schedule || !Array.isArray(schedule.schedule)) {
    return res.status(400).json({ error: 'Valid schedule required' });
  }

  const ai = getGenAI();
  if (!ai) {
    // If no API key configured, provide clean deterministic fallback explanations
    const fallbackExplanations: Record<string, string> = {};
    schedule.schedule.forEach((item: any) => {
      const scalingRationale = item.dosageScaling?.clinicalRationale ? ` ${item.dosageScaling.clinicalRationale}` : '';
      fallbackExplanations[item.id] =
        `Personalized dose of ${item.dosage} tailored to your body metrics (${item.dosageScaling?.metricSummary || `${profile?.weightKg || 70}kg`}).${scalingRationale} Scheduled at ${item.recommendedTime} (${item.slot}) to maximize bioavailability. ${item.withFoodInstructions}. Pairings: ${item.synergyPartners.join(', ') || 'Independent'}.`;
    });
    return res.json({ explanations: fallbackExplanations, grounded: true, isAIGenerated: false });
  }

  try {
    const contextItems = schedule.schedule.map((item: any) => {
      const seedNutrient = SEED_NUTRIENTS.find((n) => n.id === item.nutrientId);
      return {
        id: item.id,
        name: item.nutrientName,
        slot: item.slot,
        time: item.recommendedTime,
        dosage: item.dosage,
        dosageScaling: item.dosageScaling,
        reasons: item.reasons,
        withFood: item.withFood,
        foodRule: item.withFoodInstructions,
        synergies: item.synergyPartners,
        conflicts: item.conflictWarnings,
        cyclingNotes: item.cyclingNote,
        seedDataRow: seedNutrient
      };
    });

    const prompt = `You are NutriSync's Grounded Chrono-Nutrition AI.
User Profile:
- Name: ${profile?.name || 'User'}
- Age: ${profile?.age || 30}, Sex: ${profile?.sex || 'adult'}, Weight: ${profile?.weightKg || 70} kg, Height: ${profile?.heightCm || 175} cm
- Calculated BMI: ${schedule?.computedBmi || 23} (${schedule?.bmiCategory || 'Normal weight'})
- Primary Goals: ${(profile?.goals || []).join(', ') || 'General Wellness'}
- Routine: Wake ${profile?.wakeTime || '07:00'}, Sleep ${profile?.sleepTime || '23:00'}, Meals ${profile?.mealCount || 3}

Here is the exact computed schedule items and their verified seed rows, including deterministic dosage scaling by body weight and BMI:
${JSON.stringify(contextItems, null, 2)}

TASK:
For each schedule item by its 'id', produce a friendly, warm, 2-to-3 sentence explanation covering:
1. HOW and WHY this exact dosage (${contextItems.map((c: any) => `${c.name}: ${c.dosage}`).join(', ')}) was scaled for their body weight (${profile?.weightKg || 70} kg) and BMI (${schedule?.computedBmi || 23}, ${schedule?.bmiCategory || 'Normal weight'}), referencing the deterministic dosageScaling rule and clinical rationale provided in the data.
2. WHY this time of day and food pairing makes biochemical sense (e.g. fat absorption, avoiding mineral competition, circadian cortisol/melatonin rhythm).
3. Relevant cycling or synergy rule from the data.

STRICT GROUNDING RULES:
- Ground all facts strictly in the provided dosageScaling and seed data rows.
- Do NOT provide medical diagnosis or cure claims.
- If mentioning duration, stick strictly to the seed table's cycling notes.
- Respond with a JSON object mapping item id to string explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsed: Record<string, string> = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {};
    }

    res.json({
      explanations: parsed,
      grounded: true,
      isAIGenerated: true
    });
  } catch (err: any) {
    console.error('Gemini explain error:', err);
    // Graceful fallback
    const fallbackExplanations: Record<string, string> = {};
    schedule.schedule.forEach((item: any) => {
      fallbackExplanations[item.id] =
        `Scheduled for ${item.recommendedTime} in accordance with ${item.withFoodInstructions}. Synergizes with ${item.synergyPartners.join(', ') || 'standard routine'}.`;
    });
    res.json({ explanations: fallbackExplanations, grounded: true, isAIGenerated: false, error: err.message });
  }
});

// 2. Free-text "Ask about a supplement" lookup (Section 9.7)
app.post('/api/gemini/lookup', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query required' });
  }

  const cleanQuery = query.trim().toLowerCase();

  // First: check if query matches our verified seed table!
  const matchedSeed = SEED_NUTRIENTS.find((n) =>
    n.name.toLowerCase().includes(cleanQuery) ||
    cleanQuery.includes(n.name.toLowerCase()) ||
    cleanQuery.includes(n.id)
  );

  if (matchedSeed) {
    return res.json({
      isVerifiedSeed: true,
      nutrient: matchedSeed,
      badge: 'NutriSync Verified Seed Database',
      disclaimer: 'Data verified from clinical reference values and seed dataset.'
    });
  }

  // Not in seed table: Call Gemini with grounding context
  const ai = getGenAI();
  if (!ai) {
    return res.json({
      isVerifiedSeed: false,
      badge: 'AI-generated, not verified — confirm with a professional',
      disclaimer: 'This supplement is outside the core seed table. Please consult a healthcare provider.',
      nutrient: {
        name: query,
        type: 'Nutritional Supplement',
        bestTiming: 'Consult product label or clinical provider',
        withFood: true,
        withFoodNotes: 'Generally take with water and a meal unless otherwise indicated',
        synergizesWith: [],
        avoidPairingWith: [],
        absorptionInhibitors: [],
        typicalAdultRange: 'Check manufacturer packaging',
        cyclingNotes: 'Consult healthcare specialist',
        notes: 'Outside verified 28-nutrient seed database.'
      }
    });
  }

  try {
    const prompt = `You are a helpful supplement assistant.
The user is asking about: "${query}".

CRITICAL RULE:
- Do NOT use medical or expert jargon. Use simple, everyday words that anyone can easily understand.
- Provide clear, basic information:
  1. name: Exact name of the supplement
  2. type: Simple type (e.g. Mineral, Vitamin, Herbal, Energy booster)
  3. bestTiming: Simple best time to take it (e.g. Morning with breakfast, Evening before bed)
  4. withFood: boolean (true if best with a meal, false if empty stomach)
  5. withFoodNotes: Simple advice on what food to take it with (e.g. "Take with breakfast or food with healthy fats")
  6. synergizesWith: Array of 1-3 simple items that go well with it
  7. avoidPairingWith: Array of 1-3 items to keep 2 hours away from (e.g. "Coffee", "Calcium")
  8. typicalAdultRange: Typical daily amount (e.g. "200–400 mg daily")
  9. cyclingNotes: Simple directions (e.g. "Safe for daily use")
  10. safetyNotice: Simple safety note (e.g. "Ask your doctor if you take prescription medications or are pregnant")
- No medical claims: Do not claim it cures, treats, or diagnoses any illness.
- Return JSON strictly matching this structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      isVerifiedSeed: false,
      nutrient: parsed,
      badge: 'Helpful general guidance',
      disclaimer: 'General advice. Always check the label on your bottle and ask your doctor if you take medications.'
    });
  } catch (err: any) {
    console.error('Gemini lookup error:', err);
    // Return friendly, basic fallback instead of 500
    res.json({
      isVerifiedSeed: false,
      nutrient: {
        name: query,
        type: 'Supplement',
        bestTiming: 'With breakfast or lunch',
        withFood: true,
        withFoodNotes: 'Take with a regular meal and a tall glass of water',
        synergizesWith: ['Water', 'Healthy meals'],
        avoidPairingWith: ['Coffee or tea right away', 'Heavy minerals at the exact same minute'],
        typicalAdultRange: 'Check the product label for daily dose',
        cyclingNotes: 'Follow the directions on your bottle',
        safetyNotice: 'If you are pregnant or taking prescription medications, check with your doctor.'
      },
      badge: 'General guidance',
      disclaimer: 'General tips for this supplement. Check your bottle label for exact directions.'
    });
  }
});

// 3. Conversational Q&A about User's Schedule (Ask AI)
app.post('/api/gemini/chat', async (req, res) => {
  const { message, profile, schedule, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // Intelligent plain-English helper for immediate answers or fallback
  const getPlainEnglishAnswer = (qText: string) => {
    const q = (qText || '').toLowerCase();
    if (q.includes('coffee') || q.includes('caffeine')) {
      return "It's best to wait 30 to 60 minutes after drinking coffee before taking your vitamins. Coffee can lower how well your body absorbs key minerals like Iron, Calcium, and Zinc.";
    }
    if (q.includes('magnesium')) {
      return "Magnesium is best taken in the evening or about 30 to 60 minutes before bed. It helps relax your muscles, calms your mind, and supports deep, restful sleep.";
    }
    if (q.includes('iron') && q.includes('calcium')) {
      return "Keep Iron and Calcium at least 2 hours apart! If taken together, Calcium blocks your body from absorbing the Iron.";
    }
    if (q.includes('iron')) {
      return "Iron is absorbed best with Vitamin C (like a glass of orange juice or citrus fruit). Take it at least 2 hours away from Calcium, coffee, or tea.";
    }
    if (q.includes('zinc') || q.includes('copper')) {
      return "Take Zinc with a substantial meal to avoid an upset stomach. If you take Zinc daily, make sure to include foods with Copper (like nuts or seeds) so your minerals stay balanced.";
    }
    if (q.includes('creatine')) {
      return "Creatine can be taken any time of day, but it works especially well with a meal or post-workout shake. The most important thing is consistency every single day, along with plenty of water.";
    }
    if (q.includes('ashwagandha')) {
      return "Ashwagandha is an adaptogenic herb that helps with stress and calm. Most people like taking it in the evening with food or warm milk, or split between morning and night.";
    }
    if (q.includes('omega') || q.includes('fish oil')) {
      return "Take Omega-3 fish oil with a meal that contains healthy fats (like breakfast or dinner). This helps your body absorb it and prevents any fishy aftertaste.";
    }
    if (q.includes('vitamin d') || q.includes('d3')) {
      return "Vitamin D3 dissolves in fat, so take it with a meal that has healthy fats (like eggs, yogurt, nuts, or avocado). Morning or lunch is ideal so it doesn't interfere with sleep.";
    }
    if (q.includes('probiotic')) {
      return "Most probiotics are best taken about 30 minutes before breakfast with a glass of water, or right before bed on an empty stomach.";
    }
    if (q.includes('empty stomach') || q.includes('with food')) {
      return "Most vitamins (like Vitamin D, Multivitamins, and Zinc) are much gentler on your stomach and absorb best with a meal. Only amino acids and certain probiotics are best on an empty stomach.";
    }
    if (q.includes('workout') || q.includes('gym') || q.includes('exercise')) {
      return "Take energizing supplements (like electrolytes or pre-workout) 30 to 45 minutes before exercise. Take protein and creatine after your workout to help your muscles recover.";
    }
    return "Here is a simple rule of thumb: take fat-soluble vitamins (A, D, E, and K) and multivitamins with food that has some healthy fat. Take relaxing minerals like Magnesium in the evening, and always keep Iron and Calcium at least 2 hours apart.";
  };

  const ai = getGenAI();
  if (!ai) {
    return res.json({ reply: getPlainEnglishAnswer(message) });
  }

  try {
    const userScheduleSummary = (schedule?.schedule || []).map(
      (s: any) => `${s.slot} (${s.recommendedTime}): ${s.nutrientName} - ${s.dosage} (${s.withFoodInstructions})`
    ).join('\n');

    const systemInstruction = `You are NutriSync's friendly supplement assistant.
CRITICAL INSTRUCTION:
- Speak in plain, simple, everyday English. Keep it basic!
- NEVER use expert or clinical jargon. Avoid words like "pharmacokinetics", "bioavailability", "divalent cations", "chelation", "micellar", or "transporter saturation".
- Speak like a friendly, clear health guide.
- Keep answers short and easy to read (1 to 2 short paragraphs max).
- Explain rules simply:
  * For Vitamin D and fish oil: "Take with food that has healthy fats (like eggs, yogurt, or avocado) so your body absorbs it easily."
  * For Iron and Calcium: "Keep them at least 2 hours apart because your body cannot absorb both at the same time."
  * For Magnesium: "Best taken in the evening or 30-60 minutes before bed to help relax your muscles and sleep better."
  * For Coffee: "Wait about 30 to 60 minutes between coffee and vitamins because caffeine can block absorption."

CURRENT USER SCHEDULE:
${userScheduleSummary || 'None active yet'}

Always keep your answer basic, direct, and helpful.`;

    // Sanitize conversation turns for Gemini
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (!h || !h.text || typeof h.text !== 'string' || !h.text.trim()) continue;
        const targetRole = h.role === 'model' || h.role === 'assistant' ? 'model' : 'user';
        // Avoid starting with model
        if (contents.length === 0 && targetRole === 'model') continue;
        // Avoid consecutive identical roles
        if (contents.length > 0 && contents[contents.length - 1].role === targetRole) {
          contents[contents.length - 1].parts[0].text += `\n${h.text}`;
        } else {
          contents.push({ role: targetRole, parts: [{ text: h.text }] });
        }
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${message}`;
    } else {
      contents.push({ role: 'user', parts: [{ text: message }] });
    }

    // Race Gemini with a 6-second timeout so the user never gets an unresponsive UI
    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
      },
    });

    const timeoutPromise = new Promise<{ text?: string }>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 6000)
    );

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const replyText = response.text?.trim() || getPlainEnglishAnswer(message);

    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini chat error or timeout, providing fallback:', err?.message || err);
    res.json({ reply: getPlainEnglishAnswer(message) });
  }
});

// ----------------- Vite Integration -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriSync server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
