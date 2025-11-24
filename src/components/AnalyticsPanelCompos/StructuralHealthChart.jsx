import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

const data = [
  { month: "Jul", health: 93 },
  { month: "Aug", health: 91 },
  { month: "Sept", health: 89 },
  { month: "Oct", health: 96 },
  { month: "Nov", health: 97 },
  { month: "Dec", health: 90 },
  { month: "Jan", health: 93.56 },
  { month: "Feb", health: 94 },
  { month: "Mar", health: 96 },
  { month: "Apr", health: 98 },
  { month: "May", health: 98 },
  { month: "Jun", health: 95 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-green-400 p-3 text-xs text-green-400 font-mono rounded shadow">
        <p className="mb-1">{label}</p>
        <p>health : {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function StructuralHealthChart() {
  return (
    <div className="bg-gray-900 rounded-xl px-2 sm:px-6 py-6 w-full mb-6">
      {/* Scroll wrapper */}
      <div className="overflow-x-auto">
        {/* Fixed-width chart container inside scroll wrapper */}
        <div className="min-w-[600px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#14f195" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14f195" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#14f195" fontSize={12} />
              <YAxis domain={[80, 100]} stroke="#14f195" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="health"
                stroke="#14f195"
                fill="url(#colorHealth)"
                strokeWidth={2}
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              />
              <ReferenceDot x="Jun" y={95} r={5} fill="#0f172a" stroke="#fff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-green-400 text-center mt-4 text-sm sm:text-base font-mono">
        [STRUCTURAL_HEALTH_ANALYSIS]
      </p>
    </div>
  );
}
