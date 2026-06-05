'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SensorData {
  moisture: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

interface PlantSettings {
  plantName: string;
  minMoisture: number;
  maxMoisture: number;
  minTemperature: number;
  maxTemperature: number;
}

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

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [plantSettings, setPlantSettings] = useState<PlantSettings | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai_agent' | 'profile'>('dashboard');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [darkMode, setDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('verdirra-theme');
    if (saved) setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('verdirra-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [showQuickWaterModal, setShowQuickWaterModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isIrrigating, setIsIrrigating] = useState(false);
  const [irrigationDuration, setIrrigationDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [waterFlowRate] = useState(0.05);
  const [customDuration, setCustomDuration] = useState<number>(25);
  const [inputError, setInputError] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; image?: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const phoneNumber = '+962 7 7671 8430';

  const theme = {
    bg: darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    nav: darkMode ? 'bg-[#0b1324]/80 border-slate-800' : 'bg-white/80 border-gray-200',
    card: darkMode ? 'bg-[#111827]/90 border-slate-800/80' : 'bg-white border-gray-200',
    text: darkMode ? 'text-slate-200' : 'text-gray-800',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    textSubtle: darkMode ? 'text-gray-500' : 'text-gray-400',
    chartGrid: darkMode ? '#1f2937' : '#e5e7eb',
    chartText: darkMode ? '#6b7280' : '#9ca3af',
    chartTooltipBg: darkMode ? '#111827' : '#ffffff',
    chartTooltipBorder: darkMode ? '#1f2937' : '#e5e7eb',
    input: darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400',
    tabBg: darkMode ? 'bg-slate-950/50' : 'bg-gray-100',
    modalBg: darkMode ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800' : 'bg-white border-gray-200',
    progressBg: darkMode ? 'bg-slate-800' : 'bg-gray-200',
    sectionBg: darkMode ? 'bg-slate-900/50 border-slate-800/60' : 'bg-gray-50 border-gray-200',
    bottomNav: darkMode ? 'bg-[#0b1324]/95 border-slate-800' : 'bg-white/95 border-gray-200',
  };

  const calculateHealthScore = () => {
    if (!sensorData || !plantSettings) return null;
    const m = sensorData.moisture;
    const t = sensorData.temperature;
    const minM = plantSettings.minMoisture;
    const maxM = plantSettings.maxMoisture;
    const minT = plantSettings.minTemperature;
    const maxT = plantSettings.maxTemperature;
    let score = 100;
    const moistureDiff = m < minM ? minM - m : m > maxM ? m - maxM : 0;
    const tempDiff = t < minT ? minT - t : t > maxT ? t - maxT : 0;
    score -= moistureDiff * 2;
    score -= tempDiff * 3;
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const healthScore = calculateHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'from-emerald-500 to-green-400', label: 'Excellent 🌿' };
    if (score >= 60) return { text: 'text-yellow-400', bg: 'from-yellow-500 to-orange-400', label: 'Good 🌱' };
    if (score >= 40) return { text: 'text-orange-400', bg: 'from-orange-500 to-red-400', label: 'Fair ⚠️' };
    return { text: 'text-red-400', bg: 'from-red-500 to-red-600', label: 'Poor 🚨' };
  };

  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (today - 6 + i + 7) % 7;
      const slice = history.slice(Math.floor((i / 7) * history.length), Math.floor(((i + 1) / 7) * history.length));
      const avgMoisture = slice.length ? Math.round(slice.reduce((s, d) => s + d.moisture, 0) / slice.length) : Math.round(40 + Math.random() * 40);
      const avgTemp = slice.length ? Math.round(slice.reduce((s, d) => s + d.temperature, 0) / slice.length) : Math.round(18 + Math.random() * 12);
      return { day: days[dayIndex], moisture: avgMoisture, temperature: avgTemp };
    });
  })();

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('00962776718430');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addLog = (message: string) => {
    setLogs(prev => [new Date().toLocaleTimeString() + ': ' + message, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/chat-history');
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setChatMessages(data.messages.map((m: any) => ({ role: m.role, text: m.text, image: m.image })));
        } else {
          setChatMessages([{ role: 'assistant', text: 'Hello! I am your Verdirra AI Assistant. Ask me anything about farming tips, plant care, or take a photo of your plant for instant analysis! 🌱📷' }]);
        }
      } catch {
        setChatMessages([{ role: 'assistant', text: 'Hello! I am your Verdirra AI Assistant. 🌱📷' }]);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const saveMessage = async (role: string, text: string, image?: string) => {
    await fetch('/api/chat-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, text, image }),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      const base64Data = imageDataUrl.split(',')[1];
      setChatMessages(prev => [...prev, { role: 'user', text: '📷 Analyze this plant photo', image: imageDataUrl }]);
      await saveMessage('user', '📷 Analyze this plant photo', imageDataUrl);
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Please analyze this plant image. Identify the plant species if possible, assess its health condition, check for any diseases, pests, or nutrient deficiencies. Then provide specific care recommendations including watering schedule, sunlight needs, and any treatments needed.', image: base64Data }),
        });
        const data = await res.json();
        const reply = data.reply || 'Unable to analyze the image.';
        setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        await saveMessage('assistant', reply);
      } catch {
        setChatMessages(prev => [...prev, { role: 'assistant', text: '❌ Failed to analyze image.' }]);
      } finally {
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiLoading(true);
    await saveMessage('user', userMsg);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      const reply = data.reply || 'Sorry, no response received.';
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      await saveMessage('assistant', reply);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: '❌ Connection failed.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearChat = async () => {
    await fetch('/api/chat-history', { method: 'DELETE' });
    const welcome = 'Hello! I am your Verdirra AI Assistant. Ask me anything about farming tips, plant care, or take a photo of your plant for instant analysis! 🌱📷';
    setChatMessages([{ role: 'assistant', text: welcome }]);
    await saveMessage('assistant', welcome);
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sensors');
      const data = await res.json();
      if (data && data.moisture !== undefined) {
        setSensorData(data);
        setHistory(prev => [...prev.slice(-99), data]);
      }
      setLoading(false);
    } catch {
      addLog('Error fetching sensor data');
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data && data.plantName) setPlantSettings(data);
    } catch { console.error('Error fetching settings'); }
  };

  const handleStartIrrigationClick = () => {
    if (customDuration < 5 || customDuration > 45) { setInputError('Duration must be between 5 and 45 seconds.'); return; }
    setInputError('');
    startIrrigation(customDuration);
  };

  const startIrrigation = async (seconds: number) => {
    try {
      await fetch('/api/controls/irrigate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', duration: seconds }) });
      setIrrigationDuration(seconds); setTimeLeft(seconds); setIsIrrigating(true); setShowQuickWaterModal(false);
      addLog(`Manual irrigation started for ${seconds}s`);
    } catch { addLog('Error sending irrigation command'); }
  };

  const stopIrrigation = async () => {
    try {
      await fetch('/api/controls/irrigate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'stop' }) });
      setIsIrrigating(false); setTimeLeft(0);
      addLog('Manual irrigation stopped by administrator');
    } catch { addLog('Error sending stop command'); }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isIrrigating && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { setIsIrrigating(false); addLog('Irrigation completed'); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isIrrigating, timeLeft]);

  useEffect(() => {
    fetchData(); fetchSettings();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const moisture = sensorData?.moisture ?? 0;
  const temperature = sensorData?.temperature ?? 0;
  const humidity = sensorData?.humidity ?? 0;
  const minMoisture = plantSettings?.minMoisture ?? 25;
  const maxMoisture = plantSettings?.maxMoisture ?? 70;
  const minTemperature = plantSettings?.minTemperature ?? 15;
  const maxTemperature = plantSettings?.maxTemperature ?? 30;

  const getMoistureColor = () => {
    if (moisture < minMoisture) return 'from-red-500 to-red-600';
    if (moisture > maxMoisture) return 'from-yellow-500 to-yellow-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const getTemperatureColor = () => {
    if (temperature < minTemperature || temperature > maxTemperature) return 'from-red-500 to-red-600';
    return 'from-blue-500 to-blue-600';
  };

  const moistureAlert = sensorData && moisture < minMoisture;
  const chartData = history.map((d, i) => ({ time: i, moisture: d.moisture, temperature: d.temperature }));
  const elapsedSeconds = irrigationDuration - timeLeft;
  const waterUsed = (elapsedSeconds * waterFlowRate).toFixed(1);
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs < 10 ? '0' : ''}${secs}`; };

  const t = {
    en: { dir: 'ltr' as const, welcome: 'Welcome back, Administrator', monitoring: 'Currently monitoring:', dashboard: 'Dashboard', profile: 'Profile', support: 'Support', aiAgent: 'AI Agent', moisture: 'Soil Moisture', temperature: 'Temperature', humidity: 'Air Humidity', optimal: 'Optimal', startManual: '💦 Start Manual Irrigation' },
    ar: { dir: 'rtl' as const, welcome: 'مرحباً بك مجدداً، المسؤول', monitoring: 'يتم مراقبة حالياً:', dashboard: 'الرئيسية', profile: 'الحساب', support: 'الدعم', aiAgent: 'المساعد الذكي', moisture: 'رطوبة التربة', temperature: 'درجة الحرارة', humidity: 'رطوبة الهواء', optimal: 'المثالي', startManual: '💦 بدء الري اليدوي' }
  }[language];

  return (
    <div className={`min-h-screen ${theme.bg} w-full overflow-x-hidden ${theme.text} pb-12 transition-colors duration-300`} dir={t.dir}>

      {/* Navbar */}
      <nav className={`${theme.nav} backdrop-blur-md border-b sticky top-0 z-50 shadow-xl w-full transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VerdirraLogo size={36} />
            <div className="flex flex-col justify-center">
              <span className={`text-base font-bold tracking-tight leading-none ${darkMode ? 'text-white' : 'text-gray-800'}`}>Verdirra</span>
              <span className={`text-[9px] font-medium mt-0.5 ${theme.textSubtle}`}>Smart Irrigation</span>
            </div>
          </div>
          <div className={`hidden md:flex ${theme.tabBg} p-1 rounded-xl gap-1`}>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-semibold text-xs transition ${activeTab === 'dashboard' ? 'bg-[#059669] text-white shadow-md' : theme.textMuted}`}>📊 {t.dashboard}</button>
            <button onClick={() => setActiveTab('ai_agent')} className={`px-4 py-2 rounded-lg font-semibold text-xs transition ${activeTab === 'ai_agent' ? 'bg-[#059669] text-white shadow-md' : theme.textMuted}`}>✨ {t.aiAgent}</button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg font-semibold text-xs transition ${activeTab === 'profile' ? 'bg-[#059669] text-white shadow-md' : theme.textMuted}`}>👤 {t.profile}</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSupportModal(true)} className={`hidden md:block ${theme.textMuted} hover:text-emerald-400 text-xs transition`}>💬 {t.support}</button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => window.location.href = '/settings'} className={`w-9 h-9 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'} border rounded-xl flex items-center justify-center ${theme.textMuted} hover:text-emerald-400 shadow-lg transition`}>⚙️</button>
          </div>
        </div>
      </nav>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-orange-500/20 border-b border-orange-500/40 px-4 py-2 text-center">
          <p className="text-orange-400 text-xs font-bold">
            📡 You're offline — showing last saved data
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 w-full box-border">

        {activeTab === 'dashboard' && (
          <>
            <div className="mb-4 md:mb-6 flex items-start justify-between">
              <div>
                <h1 className={`text-xl md:text-3xl font-bold mb-1 tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t.welcome}</h1>
                {plantSettings && <p className="text-xs md:text-sm text-emerald-500 flex items-center gap-1.5">🌱 {t.monitoring} <span className="font-semibold">{plantSettings.plantName}</span></p>}
              </div>
              <button
                onClick={() => setShowWeeklyReport(true)}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold transition"
              >
                📊 Weekly Report
              </button>
            </div>

            {healthScore !== null && (
              <div className={`${theme.card} border rounded-2xl p-4 mb-4 shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🌿 Plant Health Score</h3>
                    <p className={`text-[10px] ${theme.textSubtle} mt-0.5`}>{plantSettings?.plantName || 'Current plant'} status</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${getHealthColor(healthScore).text}`}>{healthScore}</span>
                    <span className={`text-xs ${theme.textSubtle}`}>/100</span>
                    <p className={`text-[10px] font-semibold ${getHealthColor(healthScore).text} mt-0.5`}>{getHealthColor(healthScore).label}</p>
                  </div>
                </div>
                <div className={`w-full h-2.5 ${theme.progressBg} rounded-full overflow-hidden`}>
                  <div className={`h-full bg-gradient-to-r ${getHealthColor(healthScore).bg} rounded-full transition-all duration-1000`} style={{ width: `${healthScore}%` }} />
                </div>
                <div className={`flex justify-between text-[9px] ${theme.textSubtle} mt-1`}>
                  <span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
                </div>
              </div>
            )}

            {isIrrigating && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 md:p-6 border border-blue-500 shadow-2xl mb-4 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-base animate-bounce">💧</div>
                    <div>
                      <h3 className="text-sm font-bold">Manual Override Active</h3>
                      <p className="text-blue-200 text-[11px]">System is running manually</p>
                    </div>
                  </div>
                  <button onClick={stopIrrigation} className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 px-4 py-1.5 rounded-xl font-bold transition text-xs">🛑 Stop</button>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center bg-blue-950/30 p-3 rounded-xl border border-white/10">
                  <div><p className="text-lg font-black">{formatTime(elapsedSeconds)}</p><p className="text-blue-200 text-[9px] uppercase font-bold tracking-wider">Elapsed</p></div>
                  <div><p className="text-lg font-black">{waterUsed}L</p><p className="text-blue-200 text-[9px] uppercase font-bold tracking-wider">Water Used</p></div>
                  <div><p className="text-lg font-black">{formatTime(timeLeft)}</p><p className="text-blue-200 text-[9px] uppercase font-bold tracking-wider">Time Left</p></div>
                </div>
              </div>
            )}

            {moistureAlert && !isIrrigating && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-l-4 border-red-500 p-3 rounded-xl mb-4 flex items-center gap-2.5">
                <span className="text-base">⚠️</span>
                <p className="text-red-400 font-bold text-xs">Critical: Moisture Level Low</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
              {[
                { label: t.moisture, value: `${moisture.toFixed(1)}%`, sub: `${t.optimal}: ${minMoisture}%-${maxMoisture}%`, icon: '💧', color: getMoistureColor(), width: Math.min(Math.max(moisture, 0), 100) },
                { label: t.temperature, value: `${temperature.toFixed(1)}°C`, sub: `${t.optimal}: ${minTemperature}-${maxTemperature}°C`, icon: '🌡️', color: getTemperatureColor(), width: Math.min(Math.max(((temperature - 5) / 40) * 100, 0), 100) },
                { label: t.humidity, value: `${humidity.toFixed(1)}%`, sub: 'Air moisture level', icon: '💨', color: 'from-purple-500 to-pink-500', width: Math.min(Math.max(humidity, 0), 100) },
              ].map((card, i) => (
                <div key={i} className={`${theme.card} border rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col justify-between ${i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`text-xs md:text-sm font-semibold ${theme.textMuted}`}>{card.label}</h2>
                    <div className={`w-8 h-8 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} rounded-lg flex items-center justify-center text-sm`}>{card.icon}</div>
                  </div>
                  <div className="mb-3">
                    <div className={`text-3xl md:text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{card.value}</div>
                    <p className={`mt-0.5 text-[10px] md:text-[11px] font-medium ${theme.textSubtle}`}>{card.sub}</p>
                  </div>
                  <div className={`w-full h-1.5 ${theme.progressBg} rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${card.color}`} style={{ width: `${card.width}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6 pt-1">
              <button onClick={() => setShowQuickWaterModal(true)} className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg text-xs">{t.startManual}</button>
              <button onClick={() => setShowWeeklyReport(true)} className="sm:hidden flex-1 bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 px-4 py-3 rounded-xl font-bold text-xs">📊 Weekly Report</button>
            </div>

            <div className={`${theme.card} border rounded-2xl p-4 md:p-6 shadow-2xl mb-5 w-full overflow-hidden`}>
              <h2 className={`text-sm md:text-base font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>System Performance</h2>
              <div className="w-full h-[220px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis dataKey="time" stroke={theme.chartText} fontSize={10} />
                    <YAxis yAxisId="left" stroke={theme.chartText} fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.chartText} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: theme.chartTooltipBg, border: `1px solid ${theme.chartTooltipBorder}`, borderRadius: '8px', fontSize: '11px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#06b6d4" name="Moisture (%)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°C)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai_agent' && (
          <div className="max-w-3xl mx-auto w-full mb-12">
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            <div className={`${darkMode ? 'bg-[#111827]/95 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl border shadow-2xl flex flex-col h-[580px]`}>
              <div className={`p-4 border-b ${darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-gray-100 bg-gray-50/40'} flex items-center justify-between rounded-t-2xl`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-emerald-900/40 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'} border flex items-center justify-center`}>
                    <VerdirraLogo size={28} />
                  </div>
                  <div>
                    <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Verdirra AI Advisor</h2>
                    <p className={`text-[10px] ${theme.textSubtle}`}>Powered by Llama 3.3 via Groq • Plant analysis & farming tips</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleClearChat} className={`${theme.textSubtle} hover:text-red-400 text-xs transition p-1.5 rounded-lg hover:bg-red-400/10`}>🗑️</button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50">
                    📷 Scan Plant
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`max-w-[80%] rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white self-end rounded-tr-none' : `${darkMode ? 'bg-slate-800 text-slate-200 border-slate-700/60' : 'bg-gray-100 text-gray-700 border-gray-200'} self-start rounded-tl-none border`}`}>
                    {msg.image && <img src={msg.image} alt="plant" className="w-full rounded-t-2xl max-h-48 object-cover" />}
                    <p className="p-3 whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                {(isAiLoading || isAnalyzing) && (
                  <div className={`${darkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-gray-100 border-gray-200'} self-start rounded-2xl rounded-tl-none border p-3 text-xs flex items-center gap-2`}>
                    {isAnalyzing && <span className="text-emerald-400 mr-1">🔍 Analyzing plant...</span>}
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className={`p-3 border-t ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-100 bg-gray-50/40'} rounded-b-2xl flex gap-2`}>
                <input
                  type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isAiLoading || isAnalyzing}
                  placeholder={isAnalyzing ? 'Analyzing image...' : isAiLoading ? 'AI is thinking...' : 'Ask about your plants...'}
                  className={`flex-1 ${theme.input} border rounded-xl px-3 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50 h-10`}
                />
                <button onClick={handleSendMessage} disabled={isAiLoading || isAnalyzing} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50">Send</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto w-full mb-12">
            <div className={`${theme.card} border rounded-2xl p-4 md:p-6 shadow-2xl space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-lg">👤</div>
                <div>
                  <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Administrator Account</h2>
                  <p className={`text-[11px] ${theme.textSubtle}`}>verdirra@agriculture.com</p>
                </div>
              </div>
              <div className={`${theme.sectionBg} border rounded-xl p-4`}>
                <h3 className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider mb-3">System Settings</h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Interface Language / لغة الواجهة</p>
                    <p className={`text-[10px] mt-0.5 ${theme.textSubtle}`}>Choose dashboard language • اختر لغة التحكم</p>
                  </div>
                  <div className={`flex ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'} p-1 rounded-lg border self-start sm:self-auto`}>
                    <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${language === 'en' ? 'bg-emerald-600 text-white' : theme.textSubtle}`}>English</button>
                    <button onClick={() => setLanguage('ar')} className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${language === 'ar' ? 'bg-emerald-600 text-white' : theme.textSubtle}`}>العربية</button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Theme / المظهر</p>
                    <p className={`text-[10px] mt-0.5 ${theme.textSubtle}`}>Dark or Light mode</p>
                  </div>
                  <div className={`flex ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'} p-1 rounded-lg border self-start sm:self-auto`}>
                    <button onClick={() => setDarkMode(true)} className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${darkMode ? 'bg-emerald-600 text-white' : theme.textSubtle}`}>🌙 Dark</button>
                    <button onClick={() => setDarkMode(false)} className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${!darkMode ? 'bg-emerald-600 text-white' : theme.textSubtle}`}>☀️ Light</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 ${theme.bottomNav} backdrop-blur-lg border-t z-50 py-2 px-3 flex items-center justify-around shadow-2xl`}>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'dashboard' ? 'text-emerald-400' : theme.textMuted}`}>
          <span className="text-base">📊</span><span>{t.dashboard}</span>
        </button>
        <button onClick={() => setActiveTab('ai_agent')} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'ai_agent' ? 'text-yellow-400' : theme.textMuted}`}>
          <span className="text-base">✨</span><span>{t.aiAgent}</span>
        </button>
        <button onClick={() => setShowSupportModal(true)} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${theme.textMuted}`}>
          <span className="text-base">💬</span><span>{t.support}</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'profile' ? 'text-emerald-400' : theme.textMuted}`}>
          <span className="text-base">👤</span><span>{t.profile}</span>
        </button>
      </div>

      {/* Weekly Report Modal */}
      {showWeeklyReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`${theme.modalBg} border rounded-3xl p-5 max-w-lg w-full shadow-2xl`} dir="ltr">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>📊 Weekly Report</h3>
                <p className={`text-[10px] ${theme.textSubtle} mt-0.5`}>{plantSettings?.plantName || 'Plant'} • Last 7 days</p>
              </div>
              <button onClick={() => setShowWeeklyReport(false)} className={`${theme.textMuted} hover:text-red-400 text-lg`}>✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Avg Moisture', value: `${Math.round(weeklyData.reduce((s, d) => s + d.moisture, 0) / 7)}%`, color: 'text-cyan-400' },
                { label: 'Avg Temp', value: `${Math.round(weeklyData.reduce((s, d) => s + d.temperature, 0) / 7)}°C`, color: 'text-orange-400' },
                { label: 'Health Score', value: healthScore ? `${healthScore}` : 'N/A', color: healthScore ? getHealthColor(healthScore).text : 'text-gray-400' },
              ].map((s, i) => (
                <div key={i} className={`${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'} border rounded-xl p-3 text-center`}>
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className={`text-[9px] ${theme.textSubtle} font-medium mt-0.5`}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className={`${darkMode ? 'bg-slate-900/40' : 'bg-gray-50'} rounded-2xl p-3 mb-3`}>
              <p className={`text-[11px] font-bold ${theme.textMuted} mb-2`}>💧 Moisture % — Daily Average</p>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis dataKey="day" stroke={theme.chartText} fontSize={9} />
                    <YAxis stroke={theme.chartText} fontSize={9} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: theme.chartTooltipBg, border: `1px solid ${theme.chartTooltipBorder}`, borderRadius: '6px', fontSize: '10px' }} />
                    <Bar dataKey="moisture" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Moisture %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={`${darkMode ? 'bg-slate-900/40' : 'bg-gray-50'} rounded-2xl p-3`}>
              <p className={`text-[11px] font-bold ${theme.textMuted} mb-2`}>🌡️ Temperature °C — Daily Average</p>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis dataKey="day" stroke={theme.chartText} fontSize={9} />
                    <YAxis stroke={theme.chartText} fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: theme.chartTooltipBg, border: `1px solid ${theme.chartTooltipBorder}`, borderRadius: '6px', fontSize: '10px' }} />
                    <Bar dataKey="temperature" fill="#f97316" radius={[4, 4, 0, 0]} name="Temperature °C" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button onClick={() => setShowWeeklyReport(false)} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-2.5 rounded-xl text-xs font-bold">Close Report</button>
          </div>
        </div>
      )}

      {/* Quick Water Modal */}
      {showQuickWaterModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`${theme.modalBg} border rounded-3xl p-5 max-w-sm w-full shadow-2xl text-left`} dir="ltr">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 text-sm">💧</div>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Manual Irrigation</h3>
              </div>
              <button onClick={() => { setShowQuickWaterModal(false); setInputError(''); }} className={`${theme.textMuted} text-xs`}>✕</button>
            </div>
            <div className={`${darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-4 mb-4 text-center`}>
              <span className="block text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Duration</span>
              <div className="flex items-baseline justify-center gap-0.5 font-mono my-1">
                <span className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>{customDuration}</span>
                <span className={`text-[10px] uppercase ${theme.textSubtle}`}>sec</span>
              </div>
              <input type="range" min={5} max={45} value={customDuration} onChange={(e) => setCustomDuration(Number(e.target.value))} className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none mt-2"/>
            </div>
            {inputError && <div className="mb-3 text-red-400 text-[11px] text-center">⚠️ {inputError}</div>}
            <div className="flex gap-2">
              <button onClick={() => { setShowQuickWaterModal(false); setInputError(''); }} className={`flex-1 ${darkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'} font-semibold py-2 rounded-xl text-xs`}>Cancel</button>
              <button onClick={handleStartIrrigationClick} className="flex-[2] bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold py-2 rounded-xl text-xs">🚀 Start</button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className={`${theme.modalBg} border rounded-3xl p-5 max-w-sm w-full text-right`} dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>الدعم الفني</h3>
              <button onClick={() => setShowSupportModal(false)} className={`${theme.textMuted} hover:text-white`}>✕</button>
            </div>
            <div className={`${darkMode ? 'bg-slate-900/60' : 'bg-gray-50'} p-4 rounded-2xl mb-4 text-xs ${theme.textMuted} space-y-1.5`}>
              <p>أنظمة <strong className={darkMode ? 'text-white' : 'text-gray-800'}>Verdirra</strong> الذكية لإدارة الموارد المائية وحلول الأتمتة الزراعية.</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'} border p-3 rounded-xl flex items-center justify-between mb-4`} dir="ltr">
              <span className="font-mono text-cyan-400 font-bold text-sm">{phoneNumber}</span>
              <button onClick={handleCopyNumber} className={`${darkMode ? 'bg-slate-800' : 'bg-gray-200'} px-2.5 py-1 rounded-lg text-[10px] ${darkMode ? 'text-white' : 'text-gray-700'} font-medium`}>{copied ? '✓' : 'Copy'}</button>
            </div>
            <div className="flex gap-2" dir="ltr">
              <button onClick={() => setShowSupportModal(false)} className={`flex-1 ${darkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-700'} py-2 rounded-xl text-xs`}>Close</button>
              <a href="tel:00962776718430" className="flex-[2] bg-gradient-to-r from-cyan-600 to-emerald-600 py-2 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-1">📞 Call</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}