// File: components/DashboardPanelCompos/TemperatureTrend.jsx
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const generateTempData = () => [
  { name: "Mon", value: +(20 + Math.random() * 15).toFixed(1) },
  { name: "Tue", value: +(20 + Math.random() * 15).toFixed(1) },
  { name: "Wed", value: +(20 + Math.random() * 15).toFixed(1) },
  { name: "Thu", value: +(20 + Math.random() * 15).toFixed(1) },
  { name: "Fri", value: +(20 + Math.random() * 15).toFixed(1) },
  { name: "Sat", value: +(20 + Math.random() * 15).toFixed(1) },
  { name: "Sun", value: +(20 + Math.random() * 15).toFixed(1) },
];

export default function TemperatureTrend() {
  const [data, setData] = useState(generateTempData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateTempData());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg w-full h-[360px] border-1 border-green-700">
      <h2 className="font-mono text-xl font-bold mb-5 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text text-center">Temperature Trend</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis domain={[0, 35]} stroke="#ccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#000",
            }}
            labelStyle={{ color: "#000" }}
            formatter={(value) => [`value : ${value}`, ""]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={{ fill: "#fff", stroke: "#f97316", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
