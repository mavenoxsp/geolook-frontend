// components/UpcomingMaintenance.jsx
import React from "react";

const UpcomingMaintenance = () => {
  const tasks = [
    {
      title: "Preventive Maintenance",
      system: "Electrical Systems",
      date: "15/2/2024",
      team: "Maintenance Team A",
      duration: "4 hours",
    },
    {
      title: "System Calibration",
      system: "Sensor Networks",
      date: "22/2/2024",
      team: "Technical Specialists",
      duration: "2 hours",
    },
  ];

  return (
    <div className="bg-[#0f172a] p-4 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
                 Upcoming Maintenance Schedule
              </h2>
      <div className="space-y-4 mt-4">
        {tasks.map((task, i) => (
          <div key={i} className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between font-bold ">
              <p>{task.title}</p>
              <p>{task.system}</p>
            </div>
            <div className="mt-2 text-sm text-gray-300">
              <p>📅 {task.date}</p>
              <p>👥 {task.team}</p>
              <p>⚡ {task.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMaintenance;
