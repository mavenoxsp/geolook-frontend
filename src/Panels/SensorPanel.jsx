// pages/SensorPanel.jsx
import React from "react";
import SensorList from "../components/SensorList";

const SensorPanel = () => {
  return (
    <div className="bg-gray-900 text-green-400 font-mono p-4 mt-10 border-1 border-green-700 rounded-xl">
      <h1
        className="text-center text-3xl font-extrabold bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text uppercase p-2 mb-4"
      >
        SENSOR DATABASE
      </h1>

      <div className="w-full mx-auto border-t border-green-500 mb-5" />

      {/* Sensor List (handles its own search & filter now) */}
      <SensorList />
    </div>
  );
};

export default SensorPanel;
