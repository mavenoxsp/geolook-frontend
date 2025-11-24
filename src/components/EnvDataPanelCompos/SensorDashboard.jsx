import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { useSensors } from '../../context/SensorContext1';
import { 
  LuThermometer, 
  LuDroplets, 
  LuWind, 
  LuCompass, 
  LuGauge, 
  LuCloudRain, 
  LuMove,
  LuBatteryLow,
  LuActivity,
  LuTriangleAlert,
  LuCircleCheck,
  LuCircleX,
  LuClock
} from "react-icons/lu";

const SensorDashboard = () => {
  const { sensors, metaData, loading, connectionStatus } = useSensors();
  const [sensorData, setSensorData] = useState({});
  const [sensorHistory, setSensorHistory] = useState({
    critical: [],
    warning: [],
    safe: []
  });
  const LuCheckCircle = LuCircleCheck;
  const LuXCircle = LuCircleX;

  useEffect(() => {
    if (sensors && sensors.length > 0) {
      const data = {};
      const timestamp = metaData.ts_server || new Date().toISOString();
      
      sensors.forEach(sensor => {
        data[sensor.id] = {
          value: parseFloat(sensor.value) || 0,
          timestamp: timestamp
        };
      });
      
      setSensorData(data);
      
      // Update sensor history
      const criticalSensors = [];
      const warningSensors = [];
      const safeSensors = [];
      
      Object.keys(data).forEach(key => {
        const status = getSafetyStatus(key, data[key].value);
        const sensorInfo = {
          id: key,
          value: data[key].value,
          timestamp: data[key].timestamp,
          name: getSensorName(key),
          unit: getSensorUnit(key),
          status: status
        };
        
        if (status === 'critical') {
          criticalSensors.push(sensorInfo);
        } else if (status === 'warning') {
          warningSensors.push(sensorInfo);
        } else {
          safeSensors.push(sensorInfo);
        }
      });
      
      setSensorHistory(prev => {
        // For critical sensors, keep all history
        const updatedCritical = [...prev.critical];
        criticalSensors.forEach(sensor => {
          // Check if this sensor is already in history
          const existingIndex = updatedCritical.findIndex(s => s.id === sensor.id);
          if (existingIndex >= 0) {
            // Update existing entry with latest value and timestamp
            updatedCritical[existingIndex] = sensor;
          } else {
            // Add new critical sensor to history
            updatedCritical.push(sensor);
          }
        });
        
        // For warning sensors, keep all history
        const updatedWarning = [...prev.warning];
        warningSensors.forEach(sensor => {
          const existingIndex = updatedWarning.findIndex(s => s.id === sensor.id);
          if (existingIndex >= 0) {
            updatedWarning[existingIndex] = sensor;
          } else {
            updatedWarning.push(sensor);
          }
        });
        
        // For safe sensors, only keep current ones (no history)
        const updatedSafe = safeSensors;
        
        return {
          critical: updatedCritical,
          warning: updatedWarning,
          safe: updatedSafe
        };
      });
    }
  }, [sensors]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  // Safety thresholds
  const getSafetyStatus = (sensorType, value) => {
    const thresholds = {
      temperature: { safe: [0, 40], warning: [40, 50] },
      hum: { safe: [0, 80], warning: [80, 90] },
      ws_2: { safe: [0, 10], warning: [10, 20] },
      press_h: { safe: [980, 1050], warning: [970, 980] },
      curr_rain: { safe: [0, 10], warning: [10, 30] },
      max_WS: { safe: [0, 15], warning: [15, 25] },
      VP_mbar: { safe: [0, 20], warning: [20, 30] },
      tilt_NS: { safe: [0, 2], warning: [2, 5] },
      tilt_WE: { safe: [0, 2], warning: [2, 5] },
      Strike: { safe: [-1, 1], warning: [-3, -1] },
      bv: { safe: [12, 100], warning: [10, 12] }
    };

    const threshold = thresholds[sensorType];
    if (!threshold) return 'safe';

    if (sensorType === 'Strike') {
      if (Math.abs(value) <= 1) return 'safe';
      if (Math.abs(value) <= 3) return 'warning';
      return 'critical';
    }

    if (sensorType === 'bv') {
      if (value >= threshold.safe[0]) return 'safe';
      if (value >= threshold.warning[0]) return 'warning';
      return 'critical';
    }

    if (sensorType === 'press_h') {
      if (value >= threshold.safe[0] && value <= threshold.safe[1]) return 'safe';
      if (value < 970 || value > 1060) return 'warning';
      return 'critical';
    }

    if (value >= threshold.safe[0] && value <= threshold.safe[1]) return 'safe';
    if (value >= threshold.warning[0] && value <= threshold.warning[1]) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return <LuCheckCircle className="text-green-500" />;
      case 'warning': return <LuTriangleAlert className="text-yellow-500" />;
      case 'critical': return <LuXCircle className="text-red-500" />;
      default: return <LuActivity className="text-gray-500" />;
    }
  };

  const getSensorIcon = (sensorType) => {
    const icons = {
      temperature: <LuThermometer />,
      hum: <LuDroplets />,
      ws_2: <LuWind />,
      wd: <LuCompass />,
      press_h: <LuGauge />,
      curr_rain: <LuCloudRain />,
      max_WS: <LuWind />,
      VP_mbar: <LuDroplets />,
      tilt_NS: <LuMove />,
      tilt_WE: <LuMove />,
      Strike: <LuActivity />,
      bv: <LuBatteryLow />
    };
    return icons[sensorType] || <LuActivity />;
  };

  const getSensorName = (sensorType) => {
    const names = {
      temperature: 'Temperature',
      hum: 'Humidity',
      ws_2: 'Wind Speed',
      wd: 'Wind Direction',
      press_h: 'Pressure',
      curr_rain: 'Current Rain',
      max_WS: 'Max Wind Speed',
      VP_mbar: 'Vapor Pressure',
      tilt_NS: 'Tilt N-S',
      tilt_WE: 'Tilt W-E',
      Strike: 'Structural Stress',
      bv: 'Battery Voltage'
    };
    return names[sensorType] || sensorType;
  };

  const getSensorUnit = (sensorType) => {
    const units = {
      temperature: '°C',
      hum: '%',
      ws_2: 'm/s',
      wd: '°',
      press_h: 'hPa',
      curr_rain: 'mm/hr',
      max_WS: 'm/s',
      VP_mbar: 'mbar',
      tilt_NS: '°',
      tilt_WE: '°',
      Strike: 'units',
      bv: 'V'
    };
    return units[sensorType] || '';
  };

  // Create circular gauge for each sensor showing safety status
  const CircularGauge = ({ sensorType, value }) => {
    const status = getSafetyStatus(sensorType, value);
    const statusColor = getStatusColor(status);
    
    // Determine max value for normalization
    const getMaxValue = (type) => {
      const maxValues = {
        temperature: 60,
        hum: 100,
        ws_2: 30,
        press_h: 1100,
        curr_rain: 50,
        max_WS: 40,
        VP_mbar: 40,
        tilt_NS: 10,
        tilt_WE: 10,
        Strike: 10,
        bv: 15
      };
      return maxValues[type] || 100;
    };
    
    const maxValue = getMaxValue(sensorType);
    const normalizedValue = Math.min(value, maxValue) / maxValue;
    
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    // Spring for animation
    const progress = useSpring(0, {
      stiffness: 100,
      damping: 20,
    });
    
    // Convert progress (0–1) into strokeDashoffset
    const dashOffset = useTransform(progress, (p) => {
      return circumference - p * circumference;
    });
    
    useEffect(() => {
      progress.set(normalizedValue);
    }, [value, progress, normalizedValue]);
    
    return (
      <div className="flex justify-center items-center h-32">
        <svg height={radius * 2} width={radius * 2} className="my-4">
          <circle
            stroke="#1f2937"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          <motion.circle
            stroke={statusColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: dashOffset,
            }}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
          
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy=".3em"
            fontSize="1.2em"
            fill={statusColor}
            fontFamily="monospace"
          >
            {value.toFixed(2)}
          </text>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl">Loading sensors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-mono">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-green-300 text-transparent bg-clip-text mb-2">
          SENSOR MONITORING DASHBOARD
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <LuClock className="text-green-400" />
            Last Updated: {formatTimestamp(metaData.ts_server)}
          </div>
          <div className={`flex items-center gap-1 ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {connectionStatus.toUpperCase()}
          </div>
        </div>
      </div>
      
      {/* Circular Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {Object.keys(sensorData).map(sensorType => {
          const value = sensorData[sensorType].value;
          const status = getSafetyStatus(sensorType, value);

          return (
            <div key={sensorType} className="bg-gray-900 rounded-xl p-4 border border-green-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-green-300">
                  {getSensorIcon(sensorType)}
                  <span className="text-sm font-semibold">{getSensorName(sensorType)}</span>
                </div>
                {getStatusIcon(status)}
              </div>
              
              <CircularGauge sensorType={sensorType} value={value} />
              
              <div className="text-center">
                <div className="text-xl font-bold" style={{ color: getStatusColor(status) }}>
                  {value.toFixed(2)} {getSensorUnit(sensorType)}
                </div>
                <div className="text-xs text-gray-400 capitalize">{status}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Report */}
      <div className="bg-gray-900 rounded-xl p-6 border border-green-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
            <LuActivity />
            SYSTEM STATUS REPORT
          </h2>
          <div className="text-sm text-gray-400 flex items-center gap-1">
            <LuClock className="text-green-400" />
            Timestamp: {formatTimestamp(metaData.ts_server)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical Sensors */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-red-400">
              <LuXCircle />
              <h3 className="font-semibold">CRITICAL SENSORS ({sensorHistory.critical.length})</h3>
            </div>
            <div className="space-y-2">
              {sensorHistory.critical.map(sensor => (
                <div key={sensor.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-red-300">{sensor.name}</span>
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(sensor.timestamp)}
                    </div>
                  </div>
                  <span className="text-white">
                    {sensor.value?.toFixed(2)} {sensor.unit}
                  </span>
                </div>
              ))}
              {sensorHistory.critical.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No critical sensors
                </div>
              )}
            </div>
          </div>

          {/* Warning Sensors */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-yellow-400">
              <LuTriangleAlert />
              <h3 className="font-semibold">WARNING SENSORS ({sensorHistory.warning.length})</h3>
            </div>
            <div className="space-y-2">
              {sensorHistory.warning.map(sensor => (
                <div key={sensor.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-yellow-300">{sensor.name}</span>
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(sensor.timestamp)}
                    </div>
                  </div>
                  <span className="text-white">
                    {sensor.value?.toFixed(2)} {sensor.unit}
                  </span>
                </div>
              ))}
              {sensorHistory.warning.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No warning sensors
                </div>
              )}
            </div>
          </div>

          {/* Safe Sensors */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-green-400">
              <LuCheckCircle />
              <h3 className="font-semibold">SAFE SENSORS ({sensorHistory.safe.length})</h3>
            </div>
            <div className="space-y-2">
              {sensorHistory.safe.map(sensor => (
                <div key={sensor.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-green-300">{sensor.name}</span>
                    <div className="text-xs text-gray-400">
                      Current
                    </div>
                  </div>
                  <span className="text-white">
                    {sensor.value?.toFixed(2)} {sensor.unit}
                  </span>
                </div>
              ))}
              {sensorHistory.safe.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No safe sensors
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Status Summary */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">OVERALL SYSTEM STATUS</h3>
              <p className="text-sm text-gray-400">Report generated: {formatTimestamp(metaData.ts_server)}</p>
            </div>
            <div className="flex items-center gap-2">
              {sensorHistory.critical.length > 0 ? (
                <>
                  <LuXCircle className="text-red-400" />
                  <span className="text-red-400 font-semibold">CRITICAL ALERT</span>
                </>
              ) : sensorHistory.warning.length > 0 ? (
                <>
                  <LuTriangleAlert className="text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">WARNING</span>
                </>
              ) : (
                <>
                  <LuCheckCircle className="text-green-400" />
                  <span className="text-green-400 font-semibold">ALL SYSTEMS NORMAL</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard;