// File: pages/DashboardPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import AlertItemList from '../components/AlertPanelCompos/AlertItemList';
import ActiveSensors from '../components/DashboardPanelCompos/ActiveSensors';
import BatteryHealth from '../components/DashboardPanelCompos/BatteryHealth';
import CriticalAlerts from '../components/DashboardPanelCompos/CriticalAlerts';
import TemperatureMonitor from '../components/DashboardPanelCompos/TemperatureMonitor';
import BatteryLevelsChart from '../components/DashboardPanelCompos/BatteryLevelsChart';
import TemperatureTrend from '../components/DashboardPanelCompos/TemperatureTrend';
import { useSensors } from "../context/SensorContext";
import SensorPanel from './SensorPanel';
import AnalyticsPanel from './AnalyticsPanel';
import EnvDataPanel from './EnvDataPanel';
import MaintenancePanel from './MaintenancePanel';

// Slide-in animation from left
const slideIn = (delay = 0) => ({
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.4, ease: "easeOut" },
  },
});

export default function DashboardPanel() {
  return (
    <div className="bg-[#0f172a] min-h-screen pb-10 w-full">
      {/* Sensor Summary Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4 pt-4 w-full"
        variants={slideIn(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <ActiveSensors />
        <CriticalAlerts />
        <TemperatureMonitor />
        <BatteryHealth />
      </motion.div>

      {/* Alerts */}
      <motion.div
        className="px-4 mt-6 mb-10 w-full"
        variants={slideIn(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="w-full max-w-7xl mx-auto">
          <AlertItemList />
        </div>
      </motion.div>

      {/* Analytics */}
      <motion.div
        className="w-full px-4"
        variants={slideIn(0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          <AnalyticsPanel />
        </div>
      </motion.div>

      {/* Environmental Data */}
      <motion.div
        className="w-full px-4 mt-10"
        variants={slideIn(0.3)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          <EnvDataPanel />
        </div>
      </motion.div>

      {/* Sensor Table */}
      <motion.div
        className="w-full px-4 mt-10 overflow-x-auto"
        variants={slideIn(0.4)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          <SensorPanel />
        </div>
      </motion.div>

      {/* Dual Chart Section */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mt-10 px-4 w-full max-w-7xl mx-auto"
        variants={slideIn(0.5)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="w-full sm:w-1/2 min-w-0 overflow-auto">
          <TemperatureTrend />
        </div>
        <div className="w-full sm:w-1/2 min-w-0 overflow-auto">
          <BatteryLevelsChart />
        </div>
      </motion.div>

      {/* Maintenance */}
      <motion.div
        className="w-full px-4 mt-10"
        variants={slideIn(0.6)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-7xl mx-auto">
          <MaintenancePanel />
        </div>
      </motion.div>
    </div>
  );
}
