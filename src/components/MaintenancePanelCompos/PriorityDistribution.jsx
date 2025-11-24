import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PriorityDistribution() {
  const data = {
    labels: ["High", "Medium"],
    datasets: [
      {
        label: "Priority",
        data: [50, 50],
        backgroundColor: ["#ef4444", "#facc15"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    rotation: -90,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="p-4 rounded-lg text-white h-80 bg-gray-900 border-1 border-green-500">
      <h2 className="text-xl font-mono mb-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text"><span className="text-white">📊</span> Priority Distribution</h2>
      <div className="h-[70%] mt-5"><Pie data={data} options={options} /></div>
    </div>
  );
}