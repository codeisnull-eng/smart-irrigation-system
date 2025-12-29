'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [moisture, setMoisture] = useState(50);
  const [ph, setPh] = useState(6.5);
  const [logs, setLogs] = useState<string[]>([]);
  const [isAutoIrrigating, setIsAutoIrrigating] = useState(false);
  const [isAutoAdjustingPh, setIsAutoAdjustingPh] = useState(false);
  const [moistureHistory, setMoistureHistory] = useState<number[]>([]);
  const [phHistory, setPhHistory] = useState<number[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [new Date().toLocaleTimeString() + ': ' + message, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Moisture simulation
      let newMoisture = moisture;
      const direction = Math.random() > 0.1 ? -1 : 1; // 90% chance to decrease
      const change = (Math.random() * 2) * direction;
      newMoisture += change;
      newMoisture = Math.max(0, Math.min(100, newMoisture));

      if (newMoisture < 25 && !isAutoIrrigating) {
        setIsAutoIrrigating(true);
        addLog('Auto irrigation started: Moisture below 25%');
      }

      if (isAutoIrrigating) {
        newMoisture += 5; // Irrigate
        if (newMoisture >= 70) {
          setIsAutoIrrigating(false);
          addLog('Auto irrigation stopped: Moisture at 70%');
        }
      }

      setMoisture(newMoisture);
      setMoistureHistory(prev => [...prev.slice(-99), newMoisture]);

      // pH simulation
      let newPh = ph;
      const phDirection = Math.random() > 0.5 ? -1 : 1;
      const phChange = (Math.random() * 0.2) * phDirection;
      newPh += phChange;
      newPh = Math.max(0, Math.min(14, newPh));

      if ((newPh < 4.5 || newPh > 8) && !isAutoAdjustingPh) {
        setIsAutoAdjustingPh(true);
        addLog(`Auto pH adjustment started: pH ${newPh.toFixed(1)} out of range`);
      }

      if (isAutoAdjustingPh) {
        if (newPh < 4.5) {
          newPh += 0.3; // Add base
        } else if (newPh > 8) {
          newPh -= 0.3; // Add acid
        }
        if (newPh >= 4.5 && newPh <= 8) {
          setIsAutoAdjustingPh(false);
          addLog('Auto pH adjustment stopped: pH in range');
        }
      }

      setPh(newPh);
      setPhHistory(prev => [...prev.slice(-99), newPh]);
    }, 1000);

    return () => clearInterval(interval);
  }, [moisture, ph, isAutoIrrigating, isAutoAdjustingPh]);

  const manualIrrigate = () => {
    setMoisture(prev => Math.min(100, prev + 10));
    addLog('Manual irrigation: +10% moisture');
  };

  const manualAdjustPhUp = () => {
    setPh(prev => Math.min(14, prev + 0.5));
    addLog('Manual pH adjustment: +0.5 (added base)');
  };

  const manualAdjustPhDown = () => {
    setPh(prev => Math.max(0, prev - 0.5));
    addLog('Manual pH adjustment: -0.5 (added acid)');
  };

  const getMoistureColor = () => {
    if (moisture < 25) return 'bg-red-500';
    if (moisture > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPhColor = () => {
    if (ph < 4.5 || ph > 8) return 'bg-red-500';
    return 'bg-green-500';
  };

  const chartData = moistureHistory.map((m, i) => ({
    time: i,
    moisture: m,
    ph: phHistory[i] || 0,
  }));

  const moistureStats = moistureHistory.length > 0 ? {
    avg: moistureHistory.reduce((a, b) => a + b, 0) / moistureHistory.length,
    min: Math.min(...moistureHistory),
    max: Math.max(...moistureHistory),
  } : { avg: 0, min: 0, max: 0 };

  const phStats = phHistory.length > 0 ? {
    avg: phHistory.reduce((a, b) => a + b, 0) / phHistory.length,
    min: Math.min(...phHistory),
    max: Math.max(...phHistory),
  } : { avg: 0, min: 0, max: 0 };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Smart Irrigation System Dashboard</h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Moisture Section */}
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
                <span>Critical &lt;25%</span>
                <span>Ideal 25-70%</span>
                <span>High &gt;70%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={manualIrrigate}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={moisture >= 100}
              >
                Manual Irrigate
              </button>
              {isAutoIrrigating && <span className="text-green-600 font-semibold">Auto Irrigating</span>}
            </div>
          </div>

          {/* pH Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">pH Level</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-800 mb-1">
                <span>0</span>
                <span>{ph.toFixed(1)}</span>
                <span>14</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${getPhColor()}`}
                  style={{ width: `${(ph / 14) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span>Critical &lt;4.5</span>
                <span>Ideal 4.5-8</span>
                <span>Critical &gt;8</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={manualAdjustPhDown}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Add Acid
              </button>
              <button 
                onClick={manualAdjustPhUp}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                Add Base
              </button>
              {isAutoAdjustingPh && <span className="text-green-600 font-semibold">Auto Adjusting</span>}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
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
            <h2 className="text-xl font-semibold mb-4 text-black">pH Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{phStats.avg.toFixed(1)}</p>
                <p className="text-sm text-gray-700">Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{phStats.min.toFixed(1)}</p>
                <p className="text-sm text-gray-700">Min</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{phStats.max.toFixed(1)}</p>
                <p className="text-sm text-gray-700">Max</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
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
              <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#82ca9d" name="pH" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Logs Section */}
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
