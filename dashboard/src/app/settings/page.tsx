'use client';

import { useState, useEffect } from 'react';

const VerdirraLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 60 Q30 45 32 20 Q42 18 52 35 Z" fill="#22c55e"/>
    <path d="M50 60 Q70 45 68 20 Q58 18 48 35 Z" fill="#16a34a"/>
    <line x1="50" y1="60" x2="50" y2="80" stroke="#166534" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M50 75 Q40 80 36 88" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M50 75 Q60 80 64 88" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M63 28 Q70 22 77 28" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M66 22 Q70 17 74 22" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="70" cy="30" r="2" fill="#4ade80"/>
  </svg>
);

export default function SettingsPage() {
  const [plantName, setPlantName] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  // مزامنة الثيم مع localStorage
  useEffect(() => {
    const saved = localStorage.getItem('verdirra-theme');
    if (saved) setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('verdirra-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { if (data && data.plantName) setSettings(data); });
  }, []);

  const handleGetSettings = async () => {
    if (!plantName.trim()) return;
    setLoading(true);
    setError('');
    setAiMessage('🤖 AI is calculating optimal settings...');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Give me the ideal irrigation settings for ${plantName}. Respond ONLY with JSON: {"minMoisture": 40, "maxMoisture": 70, "minTemperature": 18, "maxTemperature": 25}`
      }),
    });

    const data = await res.json();

    try {
      const clean = data.reply.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAiMessage(`✅ AI says ${plantName} needs: ${parsed.minMoisture}-${parsed.maxMoisture}% moisture, ${parsed.minTemperature}-${parsed.maxTemperature}°C`);

      const settingsData = { plantName, minMoisture: parsed.minMoisture, maxMoisture: parsed.maxMoisture, minTemperature: parsed.minTemperature, maxTemperature: parsed.maxTemperature };
      const saveRes = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsData) });
      const saveData = await saveRes.json();

      if (!saveRes.ok) { setError(saveData.error); setLoading(false); return; }
      setSettings(saveData.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('❌ Could not parse AI response. Try again.');
    }
    setLoading(false);
  };

  const theme = {
    bg: darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    nav: darkMode ? 'bg-[#0b1324]/80 border-slate-800' : 'bg-white/80 border-gray-200',
    card: darkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    textSubtle: darkMode ? 'text-gray-500' : 'text-gray-400',
    input: darkMode ? 'bg-slate-800/60 border-slate-700/60 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400',
    cardMoisture: darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100',
    cardTemp: darkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100',
    aiMsg: darkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-blue-50 border-blue-300 text-blue-800',
    errorMsg: darkMode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-300 text-red-700',
    savedMsg: darkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-green-50 border-green-300 text-green-700',
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>

      {/* Navbar */}
      <nav className={`${theme.nav} backdrop-blur-md border-b sticky top-0 z-50 shadow-xl`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VerdirraLogo size={32} />
            <div>
              <span className={`text-base font-bold tracking-tight leading-none ${theme.text}`}>Verdirra</span>
              <p className={`text-[9px] font-medium ${theme.textSubtle}`}>Plant Settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${darkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${theme.text}`}>⚙️ Plant Settings</h1>
          <p className={`text-sm mt-1 ${theme.textMuted}`}>Configure your plant's optimal conditions</p>
        </div>

        {/* Input Card */}
        <div className={`${theme.card} border rounded-2xl p-5 shadow-2xl mb-4`}>
          <h2 className={`text-base font-bold mb-1 ${theme.text}`}>🌱 Set Your Plant</h2>
          <p className={`text-xs mb-4 ${theme.textMuted}`}>Enter your plant name and AI will calculate the ideal settings.</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetSettings()}
              placeholder="e.g. Tomato, Rose, Mint, Cactus..."
              className={`flex-1 ${theme.input} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition`}
            />
            <button
              onClick={handleGetSettings}
              disabled={loading || !plantName}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs disabled:opacity-50 transition whitespace-nowrap"
            >
              {loading ? '⏳ Asking...' : 'Ask AI 🤖'}
            </button>
          </div>

          {aiMessage && (
            <div className={`${theme.aiMsg} border px-4 py-3 rounded-xl mt-3 text-xs font-medium`}>
              {aiMessage}
            </div>
          )}

          {error && (
            <div className={`${theme.errorMsg} border px-4 py-3 rounded-xl mt-3 text-xs font-medium`}>
              {error}
            </div>
          )}
        </div>

        {/* Current Settings Card */}
        {settings && (
          <div className={`${theme.card} border rounded-2xl p-5 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-base font-bold ${theme.text}`}>Current Settings</h2>
                <p className="text-emerald-400 text-xs font-semibold mt-0.5">🌿 {settings.plantName}</p>
              </div>
              {saved && (
                <div className={`${theme.savedMsg} border px-3 py-1.5 rounded-xl text-xs font-bold`}>
                  ✅ Saved!
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`${theme.cardMoisture} border rounded-xl p-4`}>
                <p className={`text-xs font-medium mb-1 ${theme.textMuted}`}>💧 Min Moisture</p>
                <p className="text-2xl font-black text-blue-400">{settings.minMoisture}%</p>
              </div>
              <div className={`${theme.cardMoisture} border rounded-xl p-4`}>
                <p className={`text-xs font-medium mb-1 ${theme.textMuted}`}>💧 Max Moisture</p>
                <p className="text-2xl font-black text-blue-400">{settings.maxMoisture}%</p>
              </div>
              <div className={`${theme.cardTemp} border rounded-xl p-4`}>
                <p className={`text-xs font-medium mb-1 ${theme.textMuted}`}>🌡️ Min Temperature</p>
                <p className="text-2xl font-black text-orange-400">{settings.minTemperature}°C</p>
              </div>
              <div className={`${theme.cardTemp} border rounded-xl p-4`}>
                <p className={`text-xs font-medium mb-1 ${theme.textMuted}`}>🌡️ Max Temperature</p>
                <p className="text-2xl font-black text-orange-400">{settings.maxTemperature}°C</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}