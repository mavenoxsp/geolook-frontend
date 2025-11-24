// Panels/SettingsPanel.jsx
import React from "react";
import { motion } from "framer-motion";
import SystemSettings from "../components/SettingPanelCompos/SystemSettings";

// Slide-in animation config
const slideIn = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function SettingsPanel() {
  return (
    <motion.div
      className="w-full max-h-screen bg-gray-900 px-4 pt-20 pb-10"
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* System Settings Block */}
      <motion.div
        className="w-full max-w-5xl mx-auto"
        variants={slideIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <SystemSettings />
      </motion.div>
    </motion.div>
  );
}
