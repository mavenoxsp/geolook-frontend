import React from "react";
import { motion } from "framer-motion";
import AIMaintenancePredictions from "../components/MaintenancePanelCompos/AIMaintenancePredictions";
import PerformanceMetrics from "../components/MaintenancePanelCompos/PerformanceMetrics";
import PriorityDistribution from "../components/MaintenancePanelCompos/PriorityDistribution";
import UpcomingMaintenance from "../components/MaintenancePanelCompos/UpcomingMaintenance";

// Fast left-to-right animation
const slideIn = (delay = 0) => ({
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay, duration: 0.4, ease: "easeOut" },
  },
});

const MaintenancePanel = () => {
  return (
    <motion.div
      className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 bg-[#0f172a] text-white border-1 border-green-700 mt-5 rounded-xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={slideIn(0)}
    >
      {/* Header + AI Maintenance */}
      <motion.div
        className="md:col-span-2"
        variants={slideIn(0)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text items-center justify-center gap-2 mb-5 text-center">
          Maintenance
        </h2>
        <div className="w-full mx-auto border-t border-green-500 mb-5" />
        <AIMaintenancePredictions />
      </motion.div>

      {/* Metrics */}
      <motion.div
        variants={slideIn(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <PerformanceMetrics />
      </motion.div>

      {/* Distribution */}
      <motion.div
        variants={slideIn(0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <PriorityDistribution />
      </motion.div>

      {/* Upcoming Maintenance */}
      <motion.div
        className="md:col-span-2"
        variants={slideIn(0.3)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <UpcomingMaintenance />
      </motion.div>
    </motion.div>
  );
};

export default MaintenancePanel;
