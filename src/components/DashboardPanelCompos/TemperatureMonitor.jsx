// components/TemperatureMonitor.jsx
import { useEffect, useState } from "react";

export default function TemperatureMonitor() {
  const [temp, setTemp] = useState(24.9);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = (20 + Math.random() * 10).toFixed(1);
      setTemp(newTemp);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const percentage = ((temp - 20) / 10) * 100; // 20–30°C → 0–100%

  // max stroke length for 240-degree arc ~167.55
  const strokeLength = 167.55;
  const strokeValue = (percentage / 100) * strokeLength;

  return (
    <div className="bg-gray-900 p-5 rounded-md font-mono w-full h-60 border border-cyan-800 text-cyan-400">
      {/* Header */}
      <div className="text-white text-lg font-bold mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">#</span> TEMPERATURE
        </div>
        <div className="text-cyan-400 text-2xl">🌡️</div>
      </div>

      {/* Divider */}
      <div className="border-b border-cyan-800 mb-4"></div>

      {/* Arc gauge */}
      <div className="relative w-full h-32 flex items-center justify-center">
        <svg className="w-36 h-36" viewBox="0 0 120 120">
          {/* Background Arc: 240 degrees */}
          <path
            d="M30,90 A45,45 0 1,1 90,90"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Foreground Arc (Dynamic fill) */}
          <path
            d="M30,90 A45,45 0 1,1 90,90"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${strokeValue}, ${strokeLength}`}
          />
        </svg>

        {/* Temperature value */}
        <div className="absolute text-green-400 text-2xl font-bold">
          {temp}°C
        </div>
      </div>

      {/* Footer */}
      <div className="text-sm mt-2 text-center text-cyan-400">● MONITORING</div>
    </div>
  );
}
