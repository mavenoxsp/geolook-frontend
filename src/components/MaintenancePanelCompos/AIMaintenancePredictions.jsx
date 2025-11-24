import React, { useState } from "react";
import { FiActivity } from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import { IoChevronDownSharp, IoChevronUpSharp } from "react-icons/io5";
import { PiShieldWarningLight } from "react-icons/pi";
import { FaChartLine } from "react-icons/fa";

const AIMaintenancePredictions = () => {
  const [expanded, setExpanded] = useState([false, false]); // Default to open for demo

  const toggleExpand = (index) => {
    setExpanded((prev) =>
      prev.map((item, i) => (i === index ? !item : item))
    );
  };

  const data = [
    {
      title: "Tunnel Ventilation System",
      risk: "HIGH",
      desc: "Potential fan bearing wear detected",
      action: "Immediate inspection and lubrication",
      confidence: 75,
    },
    {
      title: "Structural Integrity Sensor",
      risk: "MEDIUM",
      desc: "Minor stress concentration in support structure",
      action: "Detailed structural assessment",
      confidence: 45,
    },
  ];

  return (
    <div className="bg-[#0f172a] text-white p-4 rounded-lg shadow font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-600 pb-2">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
          <FiActivity /> AI Maintenance Predictions
        </h2>
        <span className="text-sm text-gray-400">{data.length} Predictions</span>
      </div>

      {/* Cards */}
      <div className="mt-4 space-y-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-[#1e293b] border border-gray-600 rounded-lg px-4 py-4 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              {/* Icon + Title */}
              <div className="flex gap-3">
                <div className="text-yellow-400 text-xl pt-1">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <p className="bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text font-semibold text-base sm:text-lg">
                    {item.title}
                    <span className="ml-2 text-sm text-green-300">{item.risk}</span>
                  </p>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>

              {/* Toggle Arrow */}
              <button
                onClick={() => toggleExpand(index)}
                className="text-green-400 text-xl mt-1"
              >
                {expanded[index] ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
              </button>
            </div>

            {/* Expanded section */}
            {expanded[index] && (
              <div className="mt-4 space-y-4">
                {/* Action */}
                <div>
                  <p className="text-green-400 text-sm">Recommended Action</p>
                  <p className="text-white text-base">{item.action}</p>
                </div>

                {/* Confidence + Risk */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                  <div className="flex items-center gap-2 text-red-400">
                    <PiShieldWarningLight className="text-lg" />
                    <span className="text-green-400 text-sm">Risk Level</span>
                  </div>

                  <div className="text-right w-full sm:w-1/2">
                    <p className="text-green-400 text-sm">Confidence</p>
                    <div className="w-full h-2 bg-gray-600 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <p className="text-red-400 text-sm flex items-center gap-1 mt-1 justify-end">
                      <FaChartLine className="text-xs" /> {item.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIMaintenancePredictions;
