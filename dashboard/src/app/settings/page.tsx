'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [plantName, setPlantName] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.plantName) setSettings(data);
      });
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

      const settingsData = {
        plantName,
        minMoisture: parsed.minMoisture,
        maxMoisture: parsed.maxMoisture,
        minTemperature: parsed.minTemperature,
        maxTemperature: parsed.maxTemperature,
      };

      const saveRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });

      const saveData = await saveRes.json();
      
      if (!saveRes.ok) {
        setError(saveData.error);
        setLoading(false);
        return;
      }

      setSettings(saveData.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('❌ Could not parse AI response. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Plant Settings ⚙️</h1>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Set Your Plant</h2>
          <p className="text-gray-600 mb-4">Enter your plant name and AI will calculate the ideal settings.</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetSettings()}
              placeholder="e.g. Tomato, Rose, Mint, Cactus..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleGetSettings}
              disabled={loading || !plantName}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Asking AI...' : 'Ask AI 🤖'}
            </button>
          </div>

          {aiMessage && (
            <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded mt-4">
              {aiMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
        </div>

        {settings && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Current Settings — {settings.plantName}
            </h2>
            
            {saved && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded mb-4">
                ✅ Settings saved successfully!
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Min Moisture</p>
                <p className="text-2xl font-bold text-blue-600">{settings.minMoisture}%</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Max Moisture</p>
                <p className="text-2xl font-bold text-blue-600">{settings.maxMoisture}%</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Min Temperature</p>
                <p className="text-2xl font-bold text-orange-600">{settings.minTemperature}°C</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Max Temperature</p>
                <p className="text-2xl font-bold text-orange-600">{settings.maxTemperature}°C</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}