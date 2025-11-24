// context/SensorContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const SensorContext = createContext();

export const SensorProvider1 = ({ children }) => {
  const [sensors, setSensors] = useState([]);
  const [metaData, setMetaData] = useState({ ts_server: "", createdAt: "" });
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socket, setSocket] = useState(null);

  // Configuration
  const API_BASE_URL = "http://localhost:7000";
  const SOCKET_URL = "http://localhost:7000";

  // Transform sensor data from API format to component format
  const transformSensorData = (sensorData) => {
    const { ts_server, createdAt, _id, updatedAt, __v, ...sensorFields } = sensorData;

    const transformed = Object.entries(sensorFields).map(([key, value]) => ({
      id: key,
      value,
    }));

    return {
      sensors: transformed,
      metaData: { ts_server, createdAt }
    };
  };

  // Fetch sensors from API
  const fetchSensors = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching sensor data...");
      
      const res = await axios.get(`${API_BASE_URL}/api/sensors`, {
        timeout: 10000 // 10 second timeout
      });
      
      const rawData = res.data;
      
      // Handle both paginated response and direct array
      let latest;
      if (rawData.sensors && Array.isArray(rawData.sensors)) {
        // Paginated response
        latest = rawData.sensors[0];
      } else if (Array.isArray(rawData)) {
        // Direct array response
        latest = rawData[0];
      } else {
        // Single object response
        latest = rawData;
      }

      if (latest) {
        const { sensors: transformedSensors, metaData: transformedMetaData } = transformSensorData(latest);
        setSensors(transformedSensors);
        setMetaData(transformedMetaData);
        console.log("✅ Sensor data loaded:", transformedSensors.length, "sensors");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching sensors:", err.message);
      setLoading(false);
      
      // Try to get latest data as fallback
      try {
        const res = await axios.get(`${API_BASE_URL}/api/sensors/latest`);
        if (res.data) {
          const { sensors: transformedSensors, metaData: transformedMetaData } = transformSensorData(res.data);
          setSensors(transformedSensors);
          setMetaData(transformedMetaData);
          console.log("✅ Latest sensor data loaded as fallback");
        }
      } catch (fallbackErr) {
        console.error("❌ Fallback fetch also failed:", fallbackErr.message);
      }
    }
  };

  // Manually trigger data fetch from external API
  const triggerDataFetch = async () => {
    try {
      console.log("🔄 Triggering manual data fetch...");
      const res = await axios.get(`${API_BASE_URL}/api/sensors/fetch`);
      console.log("✅ Manual fetch completed:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Manual fetch failed:", err.message);
      throw err;
    }
  };

  // Start smart polling on server
  const startPolling = async (interval = 30000) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sensors/start-polling`, {
        interval
      });
      console.log("✅ Smart polling started:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Failed to start polling:", err.message);
      throw err;
    }
  };

  // Stop smart polling on server
  const stopPolling = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sensors/stop-polling`);
      console.log("✅ Smart polling stopped:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Failed to stop polling:", err.message);
      throw err;
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSensors();

    // Connect socket
    console.log("🔌 Connecting to socket server...");
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setConnectionStatus('connected');
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setConnectionStatus('disconnected');
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setConnectionStatus('connected');
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
      setConnectionStatus('reconnecting');
    });

    // When new sensor data comes in
    socketInstance.on("newSensorData", (newSensor) => {
      console.log("📊 New sensor data received:", newSensor);
      
      const { sensors: transformedSensors, metaData: transformedMetaData } = transformSensorData(newSensor);
      setSensors(transformedSensors);
      setMetaData(transformedMetaData);
    });

    // When sensor data is updated
    socketInstance.on("updateSensorData", (updatedSensor) => {
      console.log("🔄 Sensor data updated:", updatedSensor);
      
      const { sensors: transformedSensors, metaData: transformedMetaData } = transformSensorData(updatedSensor);
      setSensors(transformedSensors);
      setMetaData(transformedMetaData);
    });

    // When sensor data is deleted
    socketInstance.on("deleteSensorData", (deletedData) => {
      console.log("🗑️ Sensor data deleted:", deletedData);
      // Optionally refresh data or handle deletion
      fetchSensors();
    });

    // Handle socket errors
    socketInstance.on("error", (error) => {
      console.error("❌ Socket error:", error);
      setConnectionStatus('error');
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting socket...");
      socketInstance.disconnect();
      setSocket(null);
    };
  }, []);

  // Provide context value
  const contextValue = {
    // Data
    sensors,
    metaData,
    loading,
    connectionStatus,
    
    // Methods
    fetchSensors,
    triggerDataFetch,
    startPolling,
    stopPolling,
    
    // Socket instance for advanced usage
    socket
  };

  return (
    <SensorContext.Provider value={contextValue}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error("useSensors must be used within SensorProvider1");
  }
  return context;
};