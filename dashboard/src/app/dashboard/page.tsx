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
    if (moisture < minMoisture) return 'bg-red-500';
    if (moisture > maxMoisture) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTemperatureColor = () => {
    if (temperature < minTemperature || temperature > maxTemperature) return 'bg-red-500';
    return 'bg-green-500';
  };

  const moistureAlert = sensorData && moisture < minMoisture;
  const temperatureAlert = sensorData && (temperature < minTemperature || temperature > maxTemperature);

  const chartData = history.map((d, i) => ({
    time: i,
    moisture: d.moisture,
    temperature: d.temperature,
  }));

  const moistureHistory = history.map(d => d.moisture);
  const temperatureHistory = history.map(d => d.temperature);

  const moistureStats = moistureHistory.length > 0 ? {
    avg: moistureHistory.reduce((a, b) => a + b, 0) / moistureHistory.length,
    min: Math.min(...moistureHistory),
    max: Math.max(...moistureHistory),
  } : { avg: 0, min: 0, max: 0 };

  const temperatureStats = temperatureHistory.length > 0 ? {
    avg: temperatureHistory.reduce((a, b) => a + b, 0) / temperatureHistory.length,
    min: Math.min(...temperatureHistory),
    max: Math.max(...temperatureHistory),
  } : { avg: 0, min: 0, max: 0 };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading sensor data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Smart Irrigation System Dashboard</h1>
            {plantSettings && (
              <p className="text-gray-600 mt-1">🌱 Plant: <span className="font-semibold text-green-600">{plantSettings.plantName}</span></p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = '/settings'}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Settings ⚙️
            </button>
            <button
              onClick={() => window.location.href = '/chat'}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Plant Assistant 🌱
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {!sensorData && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
            No sensor data yet. Waiting for ESP32 to send data...
          </div>
        )}

        {moistureAlert && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
            🚨 Moisture too low! Current: {moisture.toFixed(1)}% — Minimum for {plantSettings?.plantName}: {minMoisture}%
          </div>
        )}

        {temperatureAlert && (
          <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded mb-4">
            🌡️ Temperature out of range! Current: {temperature.toFixed(1)}°C — Ideal for {plantSettings?.plantName}: {minTemperature}-{maxTemperature}°C
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Moisture Level</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-800 mb-1">
                <span>0%</span>
                <span>{moisture.toFixed(1)}%</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${getMoistureColor()}`}
                  style={{ width: `${moisture}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span>Critical &lt;{minMoisture}%</span>
                <span>Ideal {minMoisture}-{maxMoisture}%</span>
                <span>High &gt;{maxMoisture}%</span>
              </div>
            </div>
            <button 
              onClick={manualIrrigate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Manual Irrigate
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Soil Temperature</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-800 mb-1">
                <span>10°C</span>
                <span>{temperature.toFixed(1)}°C</span>
                <span>40°C</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${getTemperatureColor()}`}
                  style={{ width: `${((temperature - 10) / 30) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span>Cold &lt;{minTemperature}°C</span>
                <span>Ideal {minTemperature}-{maxTemperature}°C</span>
                <span>Hot &gt;{maxTemperature}°C</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Humidity: {humidity.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Moisture Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{moistureStats.avg.toFixed(1)}%</p>
                <p className="text-sm text-gray-700">Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{moistureStats.min.toFixed(1)}%</p>
                <p className="text-sm text-gray-700">Min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{moistureStats.max.toFixed(1)}%</p>
                <p className="text-sm text-gray-700">Max</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">Temperature Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{temperatureStats.avg.toFixed(1)}°C</p>
                <p className="text-sm text-gray-700">Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{temperatureStats.min.toFixed(1)}°C</p>
                <p className="text-sm text-gray-700">Min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{temperatureStats.max.toFixed(1)}°C</p>
                <p className="text-sm text-gray-700">Max</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">Historical Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#8884d8" name="Moisture (%)" />
              <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#82ca9d" name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">System Logs</h2>
          <div className="max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-700">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <p key={index} className="text-sm text-black border-b border-gray-100 py-1">
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}