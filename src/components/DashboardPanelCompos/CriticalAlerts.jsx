// components/CriticalAlerts.jsx
import { useEffect, useState } from "react";

export default function CriticalAlerts() {
  const [alerts, setAlerts] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 p-5 rounded-md text-red-500 font-mono w-full h-60 border border-red-800">
      <div className="text-white text-lg font-bold mb-1 flex items-center gap-2">
        <span className="text-red-500">!</span> CRITICAL_ALERTS
      </div>

      <div className="border-b border-red-800 mb-4"></div>

      <div className="text-3xl font-bold">{alerts}</div>
      <div className="mt-4 text-base tracking-wide text-red-500 break-words text-center">
        REQUIRES_IMMEDIATE_ACTION
      </div>
    </div>
  );
}
