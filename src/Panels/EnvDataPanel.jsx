// src/Panels/EnvDataPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import WindSpeedMonitor from "../components/EnvDataPanelCompos/WindSpeedMonitor";
import LightIntensity from "../components/EnvDataPanelCompos/LightIntensity";
import WaterLevelAnalysis from "../components/EnvDataPanelCompos/WaterLevelAnalysis";
import AcousticEmission from "../components/EnvDataPanelCompos/AcousticEmission";
import ParticleMatter from "../components/EnvDataPanelCompos/ParticleMatter";
import VocLevels from "../components/EnvDataPanelCompos/VocLevels";
import VibrationalAnalysis from "../components/EnvDataPanelCompos/VibrationalAnalysis";
import SensorDashboard from "../components/EnvDataPanelCompos/SensorDashboard";

// Left-to-right slide animation
const slideInLeftToRight = (delay = 0) => ({
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.6, ease: "easeOut" },
  },
});

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const EnvDataPanel = () => {
  const sensorComponents = [
    WindSpeedMonitor,
    LightIntensity,
    WaterLevelAnalysis,
    AcousticEmission,
    ParticleMatter,
    VocLevels,
    VibrationalAnalysis,
  ];

  return (

<>
      {/*    <motion.div
      className="flex flex-col gap-6 p-6 border-1 border-green-700 rounded-xl mt-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
    >
      // Header
      <motion.div
        variants={slideInLeftToRight(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="bg-[#0f172a] rounded-lg p-4 font-mono text-white text-sm shadow-md w-full"
      >
        <div className="text-3xl font-bold text-center bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text flex items-center justify-center gap-2 mb-5">
          <span>&gt;_</span> ADVANCED_TUNNEL_SENSOR_DASHBOARD
        </div>
        <div className="w-full mx-auto border-t border-green-500 mb-5" />
        <p className="text-[13px]">
          <span className="text-white">./tunnel_monitor <span className="text-green-400">--advanced</span></span>
        </p>
        <p className="text-gray-400 text-[13px]">Initializing advanced sensor monitoring...</p>
      </motion.div>

      //Sensor Cards
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensorComponents.map((Component, index) => (
          <motion.div
            key={index}
            variants={slideInLeftToRight(index * 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Component />
          </motion.div>
        ))}
      </div>


      <motion.div
        variants={slideInLeftToRight(0.3)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-white"
      >
        <div className="bg-[#0f172a] border border-green-800 p-4 rounded">
          <p className="text-gray-400">SENSOR_UPTIME</p>
          <p className="text-green-400 text-lg">99.99%</p>
        </div>
        <div className="bg-[#0f172a] border border-green-800 p-4 rounded">
          <p className="text-gray-400">DATA_THROUGHPUT</p>
          <p className="text-cyan-400 text-lg">1.2 GB/s</p>
        </div>
        <div className="bg-[#0f172a] border border-green-800 p-4 rounded">
          <p className="text-gray-400">ACTIVE_SENSORS</p>
          <p className="text-purple-400 text-lg">24/24</p>
        </div>
        <div className="bg-[#0f172a] border border-green-800 p-4 rounded">
          <p className="text-gray-400">SYSTEM_LOAD</p>
          <p className="text-yellow-400 text-lg">42%</p>
        </div>
      </motion.div>


      <motion.div
        variants={slideInLeftToRight(0.4)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono text-white"
      >
        <div className="bg-[#0f172a] border border-green-800 p-4 rounded">
          <p className="text-gray-400">System Information:</p>
          <p>Kernel: TUNNEL_MONITOR v3.5.2</p>
          <p>Uptime: 145 days, 23:12:45</p>
          <p>Last Maintenance: 2024-01-15</p>
        </div>
        <div className="bg-[#0f172a] border border-green-800 p-4 rounded">
          <p className="text-gray-400">Status Log:</p>
          <p className="text-green-400">[OK] All systems operational</p>
          <p className="text-yellow-400">[NOTICE] Scheduled maintenance in 5 days</p>
          <p className="text-cyan-400">[INFO] Last update: 2025-06-22T05:04:52.604Z</p>
        </div>
      </motion.div>
        </motion.div>
      */}


<SensorDashboard/>
</>

  );
};

export default EnvDataPanel;
