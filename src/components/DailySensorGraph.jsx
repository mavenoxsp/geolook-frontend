import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import axios from "axios"; // Changed to use default axios like context
import moment from "moment-timezone";
import { 
  Eye, 
  Move, 
  ZoomIn, 
  RotateCcw, 
  Download, 
  TrendingUp,
  BarChart3,
  Settings
} from "lucide-react";

// Register required chart elements + zoom
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  zoomPlugin
);

const DailySensorGraph = ({ sensorType = "temperature", onViewCustomRange }) => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiInfo, setApiInfo] = useState({});
  const [interactionMode, setInteractionMode] = useState('zoom'); // 'zoom' or 'pan'
  const [showStatistics, setShowStatistics] = useState(false);
  const [statistics, setStatistics] = useState({});
  
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // API Configuration - match your context
  const API_BASE_URL = "https://api.geolook.in";

  // Sensor configuration
  const sensorConfig = {
    temperature: { label: "Temperature", unit: "°C", color: "#FF6B6B" },
    hum: { label: "Humidity", unit: "%", color: "#4ECDC4" },
    ws_2: { label: "Wind Speed", unit: "m/s", color: "#45B7D1" },
    wd: { label: "Wind Direction", unit: "°", color: "#96CEB4" },
    press_h: { label: "Pressure", unit: "hPa", color: "#FECA57" },
    curr_rain: { label: "Rainfall", unit: "mm", color: "#54A0FF" },
    max_WS: { label: "Max Wind Speed", unit: "m/s", color: "#5F27CD" },
    VP_mbar: { label: "Vapor Pressure", unit: "mbar", color: "#00D2D3" },
    tilt_NS: { label: "Tilt NS", unit: "°", color: "#FF9FF3" },
    tilt_WE: { label: "Tilt WE", unit: "°", color: "#F368E0" },
    Strike: { label: "Strikes", unit: "count", color: "#FF9F43" },
    bv: { label: "Battery Voltage", unit: "V", color: "#EE5253" },
  };

  const config = sensorConfig[sensorType] || sensorConfig.temperature;

  const timeToPosition = (timeValue) => {
    return timeValue / 60; // minutes → hours
  };

  const getCurrentISTTime = () => {
    const nowIST = moment().tz("Asia/Kolkata");
    return {
      full: nowIST,
      hour: nowIST.hour(),
      minute: nowIST.minute(),
      timeInMinutes: nowIST.hour() * 60 + nowIST.minute(),
      timeString: nowIST.format("HH:mm"),
      dateString: nowIST.format("YYYY-MM-DD"),
      fullString: nowIST.format("YYYY-MM-DD HH:mm:ss"),
    };
  };

  // Calculate statistics for the data
  const calculateStatistics = (data) => {
    if (!data || data.length === 0) return {};
    
    const values = data.map(d => parseFloat(d[sensorType] || 0));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    
    // Calculate trend (simple linear regression slope)
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = values.reduce((sum, _, i) => sum + (i * i), 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      median: median.toFixed(2),
      trend: slope > 0.01 ? 'Increasing' : slope < -0.01 ? 'Decreasing' : 'Stable',
      dataPoints: data.length
    };
  };

  // const fetchDailyData = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // console.log(`🔄 Fetching daily data for ${sensorType}...`);

  //     const response = await axios.get(
  //       `${API_BASE_URL}/api/sensors/daily`,
  //       {
  //         timeout: 10000 // 10 second timeout
  //       }
  //     );

  //     // console.log("📊 Daily API Response:", response.data);

  //     // if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
  //     //   throw new Error("Invalid response format from API");
  //     // }

  //     if (!response.data || response.data.totalRecords === 0) {
  //       await fetchCustomRangeData()
  //     }

  //     setApiInfo({
  //       currentTime: response.data.currentTime,
  //       currentTimeString: response.data.currentTimeString,
  //       currentTimeIST: response.data.currentTimeIST,
  //       date: response.data.date,
  //       totalRecords: response.data.totalRecords,
  //       processedRecords: response.data.processedRecords,
  //       skippedFutureRecords: response.data.skippedFutureRecords,
  //       dataPoints: response.data.dataPoints,
  //       timezone: response.data.timezone,
  //       debug: response.data.debug,
  //     });

  //     const allData = response.data.data;
  //     const currentIST = getCurrentISTTime();

  //     const validData = allData.filter((d) => {
  //       const value = d[sensorType];
  //       const hasValidValue =
  //         value !== null &&
  //         value !== undefined &&
  //         !isNaN(parseFloat(value)); // Only check if it's a valid number

  //       const isNotInFuture = d.timeValue <= currentIST.timeInMinutes;
  //       return hasValidValue && isNotInFuture;
  //     });

  //     // console.log(`✅ Filtered valid data for ${sensorType}:`, validData.length, "points");

  //     setDailyData(validData);
  //     setStatistics(calculateStatistics(validData));
  //     setLoading(false);
  //   } catch (err) {
  //     console.error(`❌ Error fetching ${sensorType} data:`, err.message);
  //     setError(`Failed to load ${config.label} data: ${err.message}`);
  //     setLoading(false);
  //   }
  // };

  const getCustomRangeData = async () => {
    const fromDate = new Date("2025-09-01T00:00:00");
    const toDate = new Date("2025-09-30T00:00:00");

    const params = new URLSearchParams({
      fromDate: fromDate.toISOString().split('T')[0],
      fromTime: fromDate.toTimeString().split(' ')[0],
      toDate: toDate.toISOString().split('T')[0],
      toTime: toDate.toTimeString().split(' ')[0],
      intervalMinutes: 5
    });

    const response = await fetch(
      `https://api.geolook.in/api/sensors/custom-range?${params}`
    );

    if (!response.ok) throw new Error("Custom range API failed");

    const json = await response.json();
    if (!json.data) return [];

    return json;
  };

  const getDailyData = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/sensors/daily`, {
      timeout: 10000,
    });

    if (!response.data) return null;
    if (response.data.totalRecords === 0) return null; // indicates fallback needed

    return response.data;
  };

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Try DAILY first
      let daily = await getDailyData();

      let finalData = null;
      let apiInfo = null;

      if (daily) {
        // Daily API returned valid data
        apiInfo = {
          currentTime: daily.currentTime,
          currentTimeString: daily.currentTimeString,
          currentTimeIST: daily.currentTimeIST,
          date: daily.date,
          totalRecords: daily.totalRecords,
          processedRecords: daily.processedRecords,
          skippedFutureRecords: daily.skippedFutureRecords,
          dataPoints: daily.dataPoints,
          timezone: daily.timezone,
          debug: daily.debug,
        };

        const currentIST = getCurrentISTTime();
        finalData = daily.data.filter((d) => {
          const value = d[sensorType];
          return value != null && !isNaN(parseFloat(value)) && d.timeValue <= currentIST.timeInMinutes;
        });
      } 
      
      else {
        // 2) DAILY has nothing → fallback to CUSTOM RANGE
        const custom = await getCustomRangeData();

        apiInfo = custom;
        finalData = custom.data.filter((d) => {
          const value = d[sensorType];
          return value != null && value !== "0.00" && parseFloat(value) !== 0;
        });
      }

      // Update UI state only once
      setApiInfo(apiInfo);
      setDailyData(finalData);
      setStatistics(calculateStatistics(finalData)); // optional
      setLoading(false);

    } catch (err) {
      setError(`Failed to load ${config.label}: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 60000);
    return () => clearInterval(interval);
  }, [sensorType]);

  // Handle interaction mode toggle
  const toggleInteractionMode = () => {
    const newMode = interactionMode === 'zoom' ? 'pan' : 'zoom';
    setInteractionMode(newMode);
    
    // Update chart options
    if (chartRef.current) {
      const chart = chartRef.current;
      if (newMode === 'zoom') {
        chart.options.plugins.zoom.zoom.drag.enabled = true;
        chart.options.plugins.zoom.pan.enabled = false;
      } else {
        chart.options.plugins.zoom.zoom.drag.enabled = false;
        chart.options.plugins.zoom.pan.enabled = true;
      }
      chart.update();
    }
  };

  // Reset zoom
  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Export chart as image
  const exportChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `${sensorType}_${apiInfo.date || getCurrentISTTime().dateString}.png`;
      link.href = url;
      link.click();
    }
  };

  // Handle view custom range button
  const handleViewCustomRange = () => {
    if (onViewCustomRange) {
      onViewCustomRange(sensorType);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] p-4 rounded-lg border border-cyan-500 h-96 flex items-center justify-center">
        <div className="text-cyan-400">Loading {config.label} data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0f172a] p-4 rounded-lg border border-red-500 h-96 flex flex-col items-center justify-center">
        <div className="text-red-400 mb-2 text-center">{error}</div>
        <div className="flex space-x-2">
          <button
            onClick={fetchSensorData}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
          <button
            onClick={handleViewCustomRange}
            className="flex items-center space-x-1 px-4 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
          >
            <Eye size={16} />
            <span>Custom Range</span>
          </button>
        </div>
      </div>
    );
  }

  if (!dailyData || dailyData.length === 0) {
    const currentIST = getCurrentISTTime();
    return (
      <div className="bg-[#0f172a] p-4 rounded-lg border border-yellow-500 h-96 flex flex-col items-center justify-center">
        <div className="text-yellow-400 mb-2">
          No data available for {config.label}
        </div>
        <div className="text-gray-400 text-sm mb-2">
          Date: {apiInfo.date || currentIST.dateString}
        </div>
        <div className="text-gray-400 text-sm mb-4">
          Current IST: {apiInfo.currentTimeString || currentIST.timeString}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchSensorData}
            className="px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Refresh
          </button>
          <button
            onClick={handleViewCustomRange}
            className="flex items-center space-x-1 px-4 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
          >
            <Eye size={16} />
            <span>Custom Range</span>
          </button>
        </div>
      </div>
    );
  }

  const currentIST = getCurrentISTTime();

  const chartData = {
    datasets: [
      {
        label: `${config.label} (${config.unit})`,
        data: dailyData.map((d, index) => ({
          x: index,
          y: parseFloat(d[sensorType] || 0),
          rawData: d,
        })),
        borderColor: config.color,
        backgroundColor: `${config.color}20`,
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: config.color,
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
        fill: true,
        spanGaps: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { color: "#00FFFF", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "#00FFFF",
        borderWidth: 1,
        titleColor: "#00FFFF",
        bodyColor: "#00FFFF",
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              const dataPoint = items[0].raw.rawData;
              return `IST: ${dataPoint.timeKey}`;
            }
            return "";
          },
          label: (item) => {
            const value = item.raw.y.toFixed(4);
            const dataPoint = item.raw.rawData;
            return `${config.label}: ${value}${config.unit} (at ${dataPoint.timeKey})`;
          },
        },
        displayColors: false,
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
          drag: {
            enabled: interactionMode === 'zoom',
            borderColor: '#00FFFF',
            borderWidth: 2,
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
        },
        pan: {
          enabled: interactionMode === 'pan',
          mode: "x",
        },
        limits: {
          x: { min: 0, max: 24 },
          y: { min: "original", max: "original" },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 24,
        ticks: {
          stepSize: 3,
          color: "#00FFFF",
          callback: function (value) {
            return `${String(Math.floor(value)).padStart(2, "0")}:00`;
          },
        },
        grid: { color: "rgba(0, 255, 255, 0.1)" },
        title: {
          display: true,
          text: `Time (24 Hour IST) - Current: ${apiInfo?.query?.toDate ? apiInfo.query?.toDate : ""} ${apiInfo?.debug?.todayDate ? apiInfo.debug?.todayDate : ""} ${apiInfo?.debug?.todayDate ? `( dailyData?.currentTime})`  : ""}`,
          color: "#00FFFF",
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: "#00FFFF",
          callback: function (value) {
            return value.toFixed(2) + config.unit;
          },
        },
        grid: { color: "rgba(0, 255, 255, 0.1)" },
        title: {
          display: true,
          text: `${config.label} (${config.unit})`,
          color: "#00FFFF",
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div ref={containerRef} className="bg-[#0f172a] p-4 rounded-lg shadow-inner border border-cyan-500 w-full h-full">
      {/* Header with enhanced controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-cyan-400 text-lg">
            {config.label} - {apiInfo.query?.toDate || currentIST.dateString}
          </h2>
          {showStatistics && (
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-400">
                Trend: {statistics.trend}
              </span>
              <span className="text-cyan-400">
                Min: {statistics.min}{config.unit}
              </span>
              <span className="text-yellow-400">
                Max: {statistics.max}{config.unit}
              </span>
              <span className="text-blue-400">
                Avg: {statistics.avg}{config.unit}
              </span>
            </div>
          )}
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center space-x-2">
          {/* Statistics toggle */}
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className={`p-2 rounded transition-colors duration-200 border ${
              showStatistics 
                ? 'bg-green-600 border-green-500 text-white' 
                : 'bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500'
            }`}
            title="Toggle statistics"
          >
            <BarChart3 size={16} />
          </button>

          {/* Interaction mode toggle */}
          <button
            onClick={toggleInteractionMode}
            className={`p-2 rounded transition-colors duration-200 border ${
              interactionMode === 'zoom' 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-purple-600 border-purple-500 text-white'
            }`}
            title={interactionMode === 'zoom' ? 'Zoom mode (drag to select)' : 'Pan mode (drag to move)'}
          >
            {interactionMode === 'zoom' ? <ZoomIn size={16} /> : <Move size={16} />}
          </button>

          {/* Reset zoom */}
          <button
            onClick={resetZoom}
            className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors duration-200 border border-orange-500"
            title="Reset zoom"
          >
            <RotateCcw size={16} />
          </button>

          {/* Export */}
          <button
            onClick={exportChart}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200 border border-green-500"
            title="Export as PNG"
          >
            <Download size={16} />
          </button>

          {/* Custom range */}
          <button
            onClick={handleViewCustomRange}
            className="flex items-center space-x-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors duration-200 border border-cyan-500"
            title="View custom date range for this sensor"
          >
            <Eye size={16} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Mode indicator */}
      <div className="mb-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`text-sm px-3 py-1 rounded-full border ${
            interactionMode === 'zoom' 
              ? 'bg-blue-900 border-blue-500 text-blue-200' 
              : 'bg-purple-900 border-purple-500 text-purple-200'
          }`}>
            {interactionMode === 'zoom' ? '🔍 Zoom Mode: Drag to select area' : '👋 Pan Mode: Drag to move around'}
          </div>
          <div className="text-xs text-gray-400">
            Wheel: Zoom | Double-click: Reset zoom
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line 
          ref={chartRef}
          data={chartData} 
          options={chartOptions} 
        />
      </div>
    </div>
  );
};

export default DailySensorGraph;