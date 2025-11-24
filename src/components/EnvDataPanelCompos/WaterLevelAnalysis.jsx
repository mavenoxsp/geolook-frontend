import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { FiDroplet } from 'react-icons/fi';

const WaterLevelAnalysis = () => {
  const [data, setData] = useState([
    { name: 'CUR', value: 1 },
    { name: 'FLOW', value: 2 },
    { name: 'PRES', value: 90 },
  ]);

  const generateData = () => ([
    { name: 'CUR', value: parseFloat((Math.random() * 5).toFixed(2)) },
    { name: 'FLOW', value: parseFloat((Math.random() * 10).toFixed(2)) },
    { name: 'PRES', value: parseFloat((Math.random() * 100).toFixed(2)) },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateData());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] px-4 py-2 rounded shadow-lg text-white text-center border border-gray-600">
          <p className="text-sm">{label}</p>
          <p className="text-green-400 font-bold text-lg">{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-sm xl:max-w-md h-80 bg-gray-900 rounded-2xl shadow-md p-4 flex flex-col font-mono text-white mx-auto border-1 border-green-800">
      <div className="text-lg tracking-wide text-center">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
          <FiDroplet className="text-xl" /> WATER_LEVEL_ANALYSIS
        </div>
        <hr className="border-t border-green-800 mt-1" />
      </div>

      <div className="flex-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
          >
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="name"
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
              fill="#00e6ff"
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

export default WaterLevelAnalysis;
