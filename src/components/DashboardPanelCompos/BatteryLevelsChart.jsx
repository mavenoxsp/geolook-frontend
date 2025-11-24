// File: components/DashboardPanelCompos/BatteryLevelsChart.jsx
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const batteryData = [
  { name: "SENSOR-001", value: 82 },
  { name: "SENSOR-002", value: 75 },
  { name: "SENSOR-003", value: 28 },
  { name: "SENSOR-004", value: 61 },
  { name: "SENSOR-005", value: 73 },
  { name: "SENSOR-006", value: 44 },
  { name: "SENSOR-007", value: 55 },
  { name: "SENSOR-008", value: 50 },
  { name: "SENSOR-009", value: 68 },
  { name: "SENSOR-010", value: 52 },
  { name: "SENSOR-011", value: 47 },
  { name: "SENSOR-012", value: 61 },
  { name: "SENSOR-013", value: 50 },
];

export default function BatteryLevelsChart() {
  return (
    <div className="bg-gray-900 p-4 rounded-lg w-full h-[360px] border-1 border-green-700">
      <h2 className="font-mono text-xl font-bold mb-5 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text text-center ">Battery Levels</h2>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={batteryData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis domain={[0, 100]} stroke="#ccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#000",
            }}
            labelStyle={{ color: "#000" }}
            formatter={(value) => [`${value}%`, "Battery"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            fill="#064e3b"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
