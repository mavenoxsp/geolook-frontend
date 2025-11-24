import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { WiDust } from 'react-icons/wi';

const ParticleMatter = () => {
  const [pmData, setPmData] = useState([
    { type: 'PM1', value: 15 },
    { type: 'PM2.5', value: 40 },
    { type: 'PM10', value: 43.8 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPmData([
        { type: 'PM1', value: parseFloat((Math.random() * 60).toFixed(2)) },
        { type: 'PM2.5', value: parseFloat((Math.random() * 60).toFixed(2)) },
        { type: 'PM10', value: parseFloat((Math.random() * 60).toFixed(2)) },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] text-white px-3 py-2 rounded shadow-lg border border-green-800 text-center">
          <p className="text-sm">{label}</p>
          <p className="text-green-400 font-bold text-lg">{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-sm xl:max-w-md h-80 bg-gray-900 rounded-2xl shadow-md p-4 flex flex-col font-mono text-white mx-auto border-1 border-green-800">
      {/* Header */}
      <div className="text-lg tracking-wide text-center">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
          <WiDust className="text-4xl" /> PARTICLE_MATTER
        </div>
        <hr className="border-t border-green-800 mt-1" />
      </div>

      <div className="flex-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pmData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="type"
              tick={{ fill: 'limegreen', fontSize: 12 }}
              axisLine={{ stroke: 'limegreen' }}
              tickLine={{ stroke: 'limegreen' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'limegreen', fontSize: 12 }}
              axisLine={{ stroke: 'limegreen' }}
              tickLine={{ stroke: 'limegreen' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
            <Bar
              dataKey="value"
              fill="#ffc107"
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ParticleMatter;
