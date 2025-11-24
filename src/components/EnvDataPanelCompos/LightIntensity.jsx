import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { WiDaySunny } from "react-icons/wi";

const LightIntensity = () => {
  const [data, setData] = useState([
    { band: 'VIS', value: 800 },
    { band: 'IR', value: 300 },
    { band: 'UV', value: 50 },
  ]);

  const getRandomValue = () => parseFloat((Math.random() * 800).toFixed(2));

  useEffect(() => {
    const interval = setInterval(() => {
      setData([
        { band: 'VIS', value: getRandomValue() },
        { band: 'IR', value: getRandomValue() },
        { band: 'UV', value: getRandomValue() },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] text-white px-4 py-2 rounded shadow-lg border border-gray-700">
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
                <WiDaySunny className="text-xl" /> LIGHT_INTENSITY
              </div>
              <hr className="border-t border-green-800 mt-1" />
            </div>

      <div className="flex-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="band"
              tick={{ fill: 'limegreen', fontSize: 12 }}
              axisLine={{ stroke: 'limegreen' }}
              tickLine={{ stroke: 'limegreen' }}
            />
            <YAxis
              domain={[0, 850]}
              tick={{ fill: 'limegreen', fontSize: 12 }}
              axisLine={{ stroke: 'limegreen' }}
              tickLine={{ stroke: 'limegreen' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#ccc', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#b36bff"
              strokeWidth={2}
              dot={{ r: 4, stroke: '#b36bff', strokeWidth: 2, fill: '#0f172a' }}
              activeDot={{ r: 6, fill: 'white', stroke: '#b36bff', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LightIntensity;
