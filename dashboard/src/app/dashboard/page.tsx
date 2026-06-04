'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [plantSettings, setPlantSettings] = useState<PlantSettings | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'support'>('dashboard');

  const addLog = (message: string) => {
    setLogs(prev => [new Date().toLocaleTimeString() + ': ' + message, ...prev.slice(0, 9)]);
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
    } catch (error) {
      addLog('Error fetching sensor data');
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data && data.plantName) setPlantSettings(data);
    } catch (error) {
      console.error('Error fetching settings');
    }
  };

  const manualIrrigate = async () => {
    try {
      await fetch('/api/controls/irrigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      addLog('Manual irrigation command sent');
    } catch (error) {
      addLog('Error sending irrigation command');
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
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
  const temperatureAlert = sensorData && (temperature < minTemperature || temperature > maxTemperature);

  const chartData = history.map((d, i) => ({
    time: i,
    moisture: d.moisture,
    temperature: d.temperature,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
            <span className="text-4xl">💧</span>
          </div>
          <p className="text-2xl font-bold text-white mb-2">HydroFlow</p>
          <p className="text-gray-400">Loading your irrigation system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation Header */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white">
              H
            </div>
            <span className="text-xl font-bold text-white">HydroFlow</span>
            <span className="text-xs text-gray-500">Smart Irrigation</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'support'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💬 Support
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/settings'}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition"
            >
              ⚙️
            </button>
            <button
              onClick={() => window.location.href = '/chat'}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition"
            >
              🤖
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition"
            >
              🚪
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Administrator</h1>
              {plantSettings && (
                <p className="text-lg text-emerald-400">🌱 Currently monitoring: <span className="font-semibold">{plantSettings.plantName}</span></p>
              )}
            </div>

            {/* Alerts */}
            {moistureAlert && (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border-l-4 border-red-500 px-6 py-4 rounded-xl mb-6 flex items-center gap-4 backdrop-blur">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="text-red-200 font-bold text-lg">Critical: Moisture Level Low</p>
                  <p className="text-red-100 text-sm">Current: {moisture.toFixed(1)}% | Required: {minMoisture}% | Immediate action recommended</p>
                </div>
              </div>
            )}

            {temperatureAlert && (
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-l-4 border-orange-500 px-6 py-4 rounded-xl mb-6 flex items-center gap-4 backdrop-blur">
                <span className="text-3xl">🌡️</span>
                <div>
                  <p className="text-orange-200 font-bold text-lg">Warning: Temperature Out of Range</p>
                  <p className="text-orange-100 text-sm">Current: {temperature.toFixed(1)}°C | Ideal: {minTemperature}-{maxTemperature}°C</p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Moisture */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl hover:border-emerald-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Soil Moisture</h2>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center text-2xl">💧</div>
                </div>
                <div className="mb-6">
                  <div className="text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {moisture.toFixed(1)}
                  </div>
                  <p className="text-gray-400 mt-1 text-sm font-semibold">Optimal: {minMoisture}%-{maxMoisture}%</p>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getMoistureColor()}`}
                    style={{ width: `${moisture}%` }}
                  ></div>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl hover:border-orange-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Temperature</h2>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center text-2xl">🌡️</div>
                </div>
                <div className="mb-6">
                  <div className="text-6xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {temperature.toFixed(1)}°
                  </div>
                  <p className="text-gray-400 mt-1 text-sm font-semibold">Optimal: {minTemperature}-{maxTemperature}°C</p>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getTemperatureColor()}`}
                    style={{ width: `${((temperature - 5) / 40) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl hover:border-purple-500/50 transition">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Air Humidity</h2>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-2xl">💨</div>
                </div>
                <div className="mb-6">
                  <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {humidity.toFixed(1)}
                  </div>
                  <p className="text-gray-400 mt-1 text-sm font-semibold">Air moisture level</p>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${humidity}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={manualIrrigate}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-105 mb-8 text-lg"
            >
              💦 Start Manual Irrigation
            </button>

            {/* Chart */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">System Performance</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis yAxisId="left" stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#06b6d4" name="Moisture (%)" strokeWidth={3} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°C)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Logs */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Activity Log</h2>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">System running smoothly - No recent activity</p>
                ) : (
                  logs.map((log, index) => (
                    <p key={index} className="text-sm text-gray-400 font-mono border-l-2 border-emerald-500 pl-3 py-1">
                      <span className="text-emerald-400">●</span> {log}
                    </p>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-5xl shadow-lg">
                  👤
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Administrator Account</h2>
                  <p className="text-gray-400 text-lg mt-1">hydroflow@agriculture.com</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4 text-lg">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Full Name</p>
                      <p className="text-white font-semibold text-lg">Abdullah Sabaaneh</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Organization</p>
                      <p className="text-white font-semibold text-lg">Smart Farm Jordan</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-semibold text-lg">May 2026</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4 text-lg">System Access</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Dashboard Access</span>
                      <span className="text-emerald-400 font-semibold">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">API Access</span>
                      <span className="text-emerald-400 font-semibold">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Settings Management</span>
                      <span className="text-emerald-400 font-semibold">✓ Active</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold transition">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="max-w-4xl">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl mb-6">
              <h2 className="text-3xl font-bold text-white mb-6">Customer Support</h2>
              <p className="text-gray-300 text-lg mb-8">We're here to help you get the most out of your HydroFlow system.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/50 rounded-xl p-6 hover:border-emerald-500 border-2 border-transparent transition cursor-pointer">
                  <h3 className="text-xl font-bold text-white mb-3">📞 Phone Support</h3>
                  <p className="text-gray-400">+966 55 123 4567</p>
                  <p className="text-gray-500 text-sm mt-2">Available 24/7</p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6 hover:border-emerald-500 border-2 border-transparent transition cursor-pointer">
                  <h3 className="text-xl font-bold text-white mb-3">📧 Email Support</h3>
                  <p className="text-gray-400">support@hydroflow.io</p>
                  <p className="text-gray-500 text-sm mt-2">Response within 2 hours</p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6 hover:border-emerald-500 border-2 border-transparent transition cursor-pointer">
                  <h3 className="text-xl font-bold text-white mb-3">💬 Live Chat</h3>
                  <p className="text-gray-400">chat.hydroflow.io</p>
                  <p className="text-gray-500 text-sm mt-2">Real-time assistance</p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-6 hover:border-emerald-500 border-2 border-transparent transition cursor-pointer">
                  <h3 className="text-xl font-bold text-white mb-3">📚 Knowledge Base</h3>
                  <p className="text-gray-400">docs.hydroflow.io</p>
                  <p className="text-gray-500 text-sm mt-2">FAQs & Tutorials</p>
                </div>
              </div>

              <div className="mt-8 bg-emerald-500/10 border-l-4 border-emerald-500 p-6 rounded-lg">
                <h3 className="text-white font-bold mb-2 text-lg">Premium Support Plan</h3>
                <p className="text-gray-300">Upgrade to get priority support, monthly system optimization, and dedicated account manager.</p>
                <button className="mt-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg font-bold transition">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}