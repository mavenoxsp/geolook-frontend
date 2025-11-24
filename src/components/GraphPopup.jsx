import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const getStatusColor = (value, type) => {
  if (type === "TEMPERATURE") {
    if (value > 30) return "#FF0000";
    if (value > 25) return "#FFA500";
    return "#00FF00";
  }
  return "#00FF00";
};

const groupEvents = (entries, targetStatus) => {
  const groups = [];
  let currentGroup = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const status = getStatusColor(entry.value, entry.type);

    if (status === targetStatus) {
      if (!currentGroup) {
        currentGroup = { start: entry.timestamp, end: entry.timestamp };
      } else {
        currentGroup.end = entry.timestamp;
      }
    } else if (currentGroup) {
      groups.push(currentGroup);
      currentGroup = null;
    }
  }

  if (currentGroup) groups.push(currentGroup);
  return groups;
};

const getHourlyData = (history) => {
  const now = new Date();
  const points = [];

  for (let i = 0; i < 24; i++) {
    const target = new Date(now);
    target.setHours(target.getHours() - i);
    target.setSeconds(0);
    target.setMilliseconds(0);

    const match = history.find((entry) => {
      const ts = new Date(entry.timestamp);
      return (
        ts.getHours() === target.getHours() &&
        ts.getDate() === target.getDate() &&
        ts.getMinutes() === target.getMinutes()
      );
    });

    if (match) {
      points.unshift(match);
    } else if (i === 0 && history.length > 0) {
      points.unshift(history[history.length - 1]);
    }
  }

  return points;
};

const GraphPopup = ({ isOpen, onClose, sensor, history }) => {
  const [view, setView] = useState("LIVE");
  const displayData = view === "LIVE" ? history.slice(-10) : getHourlyData(history);

  const criticalEvents = groupEvents(displayData, "CRITICAL");
  const warningEvents = groupEvents(displayData, "WARNING");

  const pointColors = displayData.map((entry) =>
    getStatusColor(entry.value, sensor.type)
  );

  const chartData = {
    labels: displayData.map((d) => d.timestamp),
    datasets: [
      {
        label: `${sensor.id} (${sensor.type})`,
        data: displayData.map((d) => d.value),
        borderColor: "#00FFFF",
        backgroundColor: "rgba(0,255,255,0.2)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: pointColors,
        pointHoverRadius: 6,
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", axis: "x", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "#00FFFF",
        borderWidth: 1,
        titleColor: "#00FFFF",
        bodyColor: "#00FFFF",
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => `value : ${item.raw}`,
        },
        displayColors: false,
        padding: 12,
        titleFont: { weight: "normal", size: 14 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#00FFFF" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#00FFFF" },
        min: 0,
        max: sensor.type === "TEMPERATURE" ? 40 : undefined,
        grid: { display: false },
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="min-h-screen w-full px-4 py-6 flex flex-col items-center"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-white text-3xl self-end mb-4"
            >
              &times;
            </button>

            {/* Container */}
            <div className="bg-[#0f172a] border border-cyan-500 rounded-xl shadow-2xl w-full max-w-[1000px] text-cyan-300 p-4 sm:p-6">
              <h2 className="text-center text-xl sm:text-2xl font-semibold mb-4">
                Detailed Graph: {sensor.id} ({sensor.type})
              </h2>

              {/* View Toggle */}
              <div className="flex justify-center gap-4 mb-4">
                {["LIVE", "1D"].map((label) => (
                  <button
                    key={label}
                    onClick={() => setView(label)}
                    className={`px-4 py-2 rounded-full border transition ${
                      view === label
                        ? "bg-cyan-400 text-black"
                        : "text-cyan-300 border-cyan-400 hover:bg-cyan-700/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Chart Section */}
              <div className="w-full overflow-x-auto mb-6">
                <div className="min-w-[800px] h-[300px]">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Event Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-red-400 mb-2 font-bold">CRITICAL EVENTS</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {criticalEvents.length === 0 && <li>No critical events.</li>}
                    {criticalEvents.map((e, i) => (
                      <li key={i}>{e.start} → {e.end}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-yellow-400 mb-2 font-bold">WARNING EVENTS</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {warningEvents.length === 0 && <li>No warning events.</li>}
                    {warningEvents.map((e, i) => (
                      <li key={i}>{e.start} → {e.end}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GraphPopup;
