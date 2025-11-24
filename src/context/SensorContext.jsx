// context/SensorContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

const SensorContext = createContext();

const generateSensorData = () => {
  const sensors = [
    { id: "SENSOR-001", type: "TEMPERATURE" },
    { id: "SENSOR-002", type: "PRESSURE" },
    { id: "SENSOR-003", type: "VIBRATION" },
    { id: "SENSOR-004", type: "HUMIDITY" },
    { id: "SENSOR-005", type: "TEMPERATURE" },
    { id: "SENSOR-006", type: "PRESSURE" },
    { id: "SENSOR-007", type: "VIBRATION" },
    { id: "SENSOR-008", type: "HUMIDITY" },
    { id: "SENSOR-009", type: "TEMPERATURE" },
    { id: "SENSOR-010", type: "TEMPERATURE" },
    { id: "SENSOR-011", type: "TEMPERATURE" },
    { id: "SENSOR-012", type: "TEMPERATURE" },
    { id: "SENSOR-013", type: "TEMPERATURE" },
  ];

  return sensors.map(({ id, type }) => {
    let currentValue = 0;
    let status = "GOOD";
    const randomBetween = (min, max, float = false) => {
      const value = Math.random() * (max - min) + min;
      return float ? parseFloat(value.toFixed(2)) : Math.round(value);
    };

    switch (type) {
      case "TEMPERATURE":
        currentValue = randomBetween(15, 30, true);
        if (currentValue < 18 || currentValue > 28) status = "WARNING";
        if (currentValue < 16 || currentValue > 30) status = "CRITICAL";
        break;
      case "PRESSURE":
        currentValue = randomBetween(980, 1030);
        if (currentValue < 1000 || currentValue > 1025) status = "WARNING";
        if (currentValue < 985 || currentValue > 1030) status = "CRITICAL";
        break;
      case "VIBRATION":
        currentValue = randomBetween(0.05, 0.3, true);
        if (currentValue > 0.2) status = "WARNING";
        if (currentValue > 0.28) status = "CRITICAL";
        break;
      case "HUMIDITY":
        currentValue = randomBetween(0.1, 0.3, true);
        if (currentValue < 0.12 || currentValue > 0.25) status = "WARNING";
        if (currentValue < 0.10 || currentValue > 0.28) status = "CRITICAL";
        break;
    }

    return {
      id,
      type,
      currentValue,
      status,
      lastUpdated: new Date().toISOString(),
    };
  });
};

export const SensorProvider = ({ children }) => {
  const [sensors, setSensors] = useState(generateSensorData());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const interval = setInterval(() => {
      const newSensors = generateSensorData();
      setSensors(newSensors);

      newSensors.forEach((sensor) => {
        const entry = {
          timestamp: new Date().toISOString(),
          value: sensor.currentValue,
          type: sensor.type,
        };
        const storageKey = `sensor_history_${sensor.id}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const updated = [...existing, entry].slice(-24 * 3600); // up to 24 hrs at 1 reading/second (safe cap)
        localStorage.setItem(storageKey, JSON.stringify(updated));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredSensors = sensors.filter(({ id, status }) => {
    const matchSearch = id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <SensorContext.Provider
      value={{
        sensors: filteredSensors,
        totalSensors: sensors.length,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (!context) throw new Error("useSensors must be used within SensorProvider");
  return context;
};
