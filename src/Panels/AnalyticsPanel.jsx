import React, { useState } from "react";
import { useSensors } from "../context/SensorContext1";
import DailySensorGraph from "../components/DailySensorGraph";
import CustomDateRangeViewer from "../components/Graphs/CustomDateRangeViewer";

const AnalyticsPanel = () => {
  const { sensors } = useSensors();
  const [showAll, setShowAll] = useState(false);
  const [currentView, setCurrentView] = useState("daily"); // 'daily' or 'custom'
  const [selectedSensorType, setSelectedSensorType] = useState("temperature");

  // Define all 12 sensor types with their display names
  const sensorTypes = [
    { id: "hum", name: "Humidity", unit: "%" },
    { id: "temperature", name: "Temperature", unit: "°C" },
    { id: "ws_2", name: "Wind Speed", unit: "m/s" },
    { id: "wd", name: "Wind Direction", unit: "°" },
    { id: "press_h", name: "Pressure", unit: "hPa" },
    { id: "curr_rain", name: "Rainfall", unit: "mm" },
    { id: "max_WS", name: "Max Wind Speed", unit: "m/s" },
    { id: "VP_mbar", name: "Vapor Pressure", unit: "mbar" },
    { id: "tilt_NS", name: "Tilt NS", unit: "°" },
    { id: "tilt_WE", name: "Tilt WE", unit: "°" },
    { id: "Strike", name: "Lightning Strikes", unit: "count" },
    { id: "bv", name: "Battery Voltage", unit: "V" },
  ];

  const visibleSensors = sensorTypes.slice(0, 6);
  const hiddenSensors = sensorTypes.slice(6);

  const handleViewCustomRange = (sensorType) => {
    setSelectedSensorType(sensorType);
    setCurrentView("custom");
  };

  const handleBackToDaily = () => {
    setCurrentView("daily");
  };

  // If in custom view, show the CustomDateRangeViewer
  if (currentView === "custom") {
    return (
      <div className="mt-10">
        <CustomDateRangeViewer
          sensorType={selectedSensorType}
          onBack={handleBackToDaily}
        />
      </div>
    );
  }

  // Default daily view
  return (
    <div className="bg-gray-900 text-green-400 font-mono p-4 mt-10 border-1 border-green-700 rounded-xl">
      {/* Header */}
      <h1
        className="w-full sm:w-auto text-2xl sm:text-3xl font-extrabold 
        bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text uppercase text-center mb-5"
      >
        ANALYTICS PANEL
      </h1>

      <div className="w-full mx-auto border-t border-green-500 mb-5" />

      {/* Daily Sensor Graphs Section */}
      <div className="mt-8">
        <div className="text-green-400 text-sm mb-1">
          load_analytics --type=daily_sensor_readings
        </div>
        <p className="text-gray-400 text-xs mb-4">
          Analyzing daily sensor trends...
        </p>
      </div>

      {/* First 6 Daily Graphs */}
      <div className="grid grid-cols-1 gap-6">
        {visibleSensors.map((sensor) => (
          <div key={sensor.id} className="h-96 w-full">
            <DailySensorGraph
              sensorType={sensor.id}
              onViewCustomRange={handleViewCustomRange}
            />
          </div>
        ))}
      </div>

      {/* View All Button */}
      {!showAll && sensorTypes.length > 6 && (
        <div className="mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 px-4 text-center border border-green-700 text-white rounded-lg backdrop-blur-md bg-transparent hover:bg-green-800/10 transition-all duration-300"
          >
            View All Sensors
          </button>
        </div>
      )}

      {/* Remaining Daily Graphs */}
      {showAll && hiddenSensors.length > 0 && (
        <div className="grid grid-cols-1 gap-6 mt-6">
          {hiddenSensors.map((sensor) => (
            <div key={sensor.id} className="h-96 w-full">
              <DailySensorGraph
                sensorType={sensor.id}
                onViewCustomRange={handleViewCustomRange}
              />
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-8 p-4 border border-green-700 rounded-lg">
        <div className="text-green-400 text-sm mb-2">
          load_analytics --type=summary_stats
        </div>
        <p className="text-gray-400 text-xs mb-3">
          Daily summary statistics...
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-green-400 text-xs">Total Sensors</div>
            <div className="text-white text-lg">{sensorTypes.length}</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-green-400 text-xs">Last Update</div>
            <div className="text-white text-sm">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-green-400 text-xs">Data Points</div>
            <div className="text-white text-lg">1440+</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-green-400 text-xs">Monitoring</div>
            <div className="text-green-400 text-lg">Active</div>
          </div>
        </div>

        {/* Custom Range Info */}
        <div className="mt-4 p-3 bg-gray-800 border border-cyan-500 rounded">
          <div className="text-cyan-400 text-sm mb-2">
            Custom Date Range Analysis
          </div>
          <p className="text-gray-400 text-xs mb-2">
            Click the "View" button on any graph to access custom date range
            analysis with flexible time intervals.
          </p>
          <div className="text-cyan-400 text-xs">
            Features: Historical data analysis • Custom time intervals • Data
            export • Advanced filtering
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
