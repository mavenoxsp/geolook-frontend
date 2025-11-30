import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Calendar, Clock, TrendingUp, RefreshCw, Download, Filter, Sliders } from "lucide-react";

const CustomDataGraph = ({ sensorType = "temperature" }) => {
  const [dateRange, setDateRange] = useState({
    fromDateTime: "",
    toDateTime: "",
    intervalMinutes: "5"
  });
  
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiInfo, setApiInfo] = useState({});
  const [showPresets, setShowPresets] = useState(false);

  // Value filtering states
  const [showValueFilter, setShowValueFilter] = useState(false); 
  const [valueFilter, setValueFilter] = useState({
    minValue: "",
    maxValue: "",
    filterType: "none" // "none", "between", "greater", "less"
  });

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
    Strike: { label: "Lightning Strikes", unit: "count", color: "#FF9F43" },
    bv: { label: "Battery Voltage", unit: "V", color: "#EE5253" },
  };

  const config = sensorConfig[sensorType] || sensorConfig.temperature;

  // Initialize with current date
  useEffect(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    
    setDateRange({
      fromDateTime: formatDateTime(yesterday),
      toDateTime: formatDateTime(now),
      intervalMinutes: "5"
    });
  }, []);

  // Apply value filtering whenever data or filter settings change
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    if (valueFilter.filterType === "none") {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      const value = parseFloat(item[sensorType]);
      
      switch (valueFilter.filterType) {
        case "between":
          if (valueFilter.minValue !== "" && valueFilter.maxValue !== "") {
            const min = parseFloat(valueFilter.minValue);
            const max = parseFloat(valueFilter.maxValue);
            return value >= min && value <= max;
          }
          return true;
          
        case "greater":
          if (valueFilter.minValue !== "") {
            const min = parseFloat(valueFilter.minValue);
            return value >= min;
          }
          return true;
          
        case "less":
          if (valueFilter.maxValue !== "") {
            const max = parseFloat(valueFilter.maxValue);
            return value <= max;
          }
          return true;
          
        default:
          return true;
      }
    });
    
    setFilteredData(filtered);
  }, [data, valueFilter, sensorType]);

  // Date range presets
  const presets = [
    {
      label: "Last 24 Hours",
      action: () => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const formatDateTime = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        
        setDateRange({
          fromDateTime: formatDateTime(yesterday),
          toDateTime: formatDateTime(now),
          intervalMinutes: "5"
        });
      }
    },
    {
      label: "Last 7 Days",
      action: () => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        
        const formatDateTime = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        
        setDateRange({
          fromDateTime: formatDateTime(weekAgo),
          toDateTime: formatDateTime(now),
          intervalMinutes: "60"
        });
      }
    },
    {
      label: "This Month",
      action: () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        
        const formatDateTime = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };
        
        setDateRange({
          fromDateTime: formatDateTime(monthStart),
          toDateTime: formatDateTime(now),
          intervalMinutes: "180"
        });
      }
    }
  ];

  const fetchCustomRangeData = async () => {
    if (!dateRange.fromDateTime || !dateRange.toDateTime) {
      setError("Please select both from and to date-time");
      return;
    }

    console.log(dateRange);
    

    try {
      setLoading(true);
      setError(null);

      // Parse datetime-local values
      const fromDate = new Date(dateRange.fromDateTime);
      const toDate = new Date(dateRange.toDateTime);

      const params = new URLSearchParams({
        fromDate: fromDate.toISOString().split('T')[0],
        fromTime: fromDate.toTimeString().split(' ')[0],
        toDate: toDate.toISOString().split('T')[0],
        toTime: toDate.toTimeString().split(' ')[0],
        intervalMinutes: dateRange.intervalMinutes
      });

      const response = await fetch(
        `https://api.geolook.in/api/sensors/custom-range?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (!responseData || !Array.isArray(responseData.data)) {
        throw new Error("Invalid response format from API");
      }

      const allData = responseData.data;
      const validData = allData.filter((d) => {
        const value = d[sensorType];
        return value !== null && value !== undefined && value !== "0.00" && parseFloat(value) !== 0;
      });

      setData(validData);
      setApiInfo(responseData);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load ${config.label} data: ${err.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleValueFilterChange = (field, value) => {
    setValueFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterTypeChange = (type) => {
    setValueFilter(prev => ({
      ...prev,
      filterType: type
    }));
  };

  const resetValueFilter = () => {
    setValueFilter({
      minValue: "",
      maxValue: "",
      filterType: "none"
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCustomRangeData();
  };

  const downloadData = () => {
    const downloadData = filteredData.length > 0 ? filteredData : data;
    if (downloadData.length === 0) return;

    const fromDateTime = new Date(dateRange.fromDateTime);
    const toDateTime = new Date(dateRange.toDateTime);
    const fromDateStr = fromDateTime.toISOString().split('T')[0];
    const toDateStr = toDateTime.toISOString().split('T')[0];

    const csvContent = [
      ["Timestamp", `${config.label} (${config.unit})`, "Record Count", "Interval Start"],
      ...downloadData.map(d => [
        d.intervalKey,
        d[sensorType],
        d.recordCount,
        d.intervalStart
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.label}_${fromDateStr}_to_${toDateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Chart configuration
  const chartData = {
    datasets: [
      {
        label: `${config.label} (${config.unit})`,
        data: (filteredData.length > 0 ? filteredData : data).map((d, index) => ({
          x: index,
          y: parseFloat(d[sensorType] || 0),
          rawData: d,
        })),
        borderColor: config.color,
        backgroundColor: `${config.color}20`,
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: config.color,
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
        fill: true,
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
              return `Time: ${dataPoint.intervalKeyShort}`;
            }
            return "";
          },
          label: (item) => {
            const value = item.raw.y.toFixed(4);
            const dataPoint = item.raw.rawData;
            return [
              `${config.label}: ${value}${config.unit}`,
              `Records: ${dataPoint.recordCount}`,
              `Interval: ${dataPoint.intervalKeyShort}`,
              `Full Time: ${dataPoint.intervalKey}`
            ];
          },
        },
        displayColors: false,
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
          drag: { enabled: true },
        },
        pan: {
          enabled: true,
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        ticks: {
          color: "#00FFFF",
          callback: function (value) {
            const index = Math.floor(value);
            const displayData = filteredData.length > 0 ? filteredData : data;
            if (displayData[index]) {
              return displayData[index].intervalKeyShort;
            }
            return "";
          },
          maxTicksLimit: 10,
        },
        grid: { color: "rgba(0, 255, 255, 0.1)" },
        title: {
          display: true,
          text: "Time",
          color: "#00FFFF",
          font: { size: 12 },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a] border border-cyan-500 rounded-lg p-4">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center space-x-2">
          <TrendingUp size={24} />
          <span>Custom Date Range - {config.label}</span>
        </h2>

        {/* Date Range Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-cyan-400 flex items-center space-x-1">
              <Calendar size={16} />
              <span>From Date & Time</span>
            </label>
            <input
              type="datetime-local"
              step="1"
              value={dateRange.fromDateTime}
              onChange={(e) => handleInputChange('fromDateTime', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-cyan-400 flex items-center space-x-1">
              <Calendar size={16} />
              <span>To Date & Time</span>
            </label>
            <input
              type="datetime-local"
              step="1"
              value={dateRange.toDateTime}
              onChange={(e) => handleInputChange('toDateTime', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-cyan-400">Interval (min)</label>
            <select
              value={dateRange.intervalMinutes}
              onChange={(e) => handleInputChange('intervalMinutes', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="1">1 min</option>
              <option value="5">5 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="180">3 hours</option>
              <option value="360">6 hours</option>
              <option value="720">12 hours</option>
              <option value="1440">1 day</option>
            </select>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between mt-4 space-y-2 md:space-y-0">
          <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded transition-colors"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              <span>{loading ? "Loading..." : "Load Data"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Quick Presets
            </button>

            {data.length > 0 && (
              <button
                onClick={() => setShowValueFilter(!showValueFilter)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
              >
                <Filter size={16} />
                <span>Filter Values</span>
              </button>
            )}

            {data.length > 0 && (
              <button
                onClick={downloadData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                <Download size={16} />
                <span>Download CSV</span>
              </button>
            )}
          </div>

          {apiInfo.totalRecords && (
            <div className="text-sm text-cyan-400">
              Records: {apiInfo.totalRecords} | Points: {apiInfo.dataPoints} | Duration: {apiInfo.dateRange?.durationDays}d {apiInfo.dateRange?.durationHours}h
            </div>
          )}
        </div>

        {/* Quick Presets */}
        {showPresets && (
          <div className="mt-4 p-3 bg-gray-800 border border-cyan-500 rounded">
            <div className="text-sm text-cyan-400 mb-2">Quick Date Range Presets:</div>
            <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={preset.action}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Value Filter Panel */}
        {showValueFilter && data.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800 border border-indigo-500 rounded">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-400 flex items-center space-x-2">
                <Sliders size={20} />
                <span>Value Filtering</span>
              </h3>
              <button
                onClick={resetValueFilter}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Reset Filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-indigo-400">Filter Type</label>
                <select
                  value={valueFilter.filterType}
                  onChange={(e) => handleFilterTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-indigo-500 rounded text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="none">No Filter (Show All)</option>
                  <option value="between">Between Values</option>
                  <option value="greater">Greater Than</option>
                  <option value="less">Less Than</option>
                </select>
              </div>

              {valueFilter.filterType === "between" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-indigo-400">Minimum Value ({config.unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueFilter.minValue}
                      onChange={(e) => handleValueFilterChange('minValue', e.target.value)}
                      placeholder={`e.g., 20`}
                      className="w-full px-3 py-2 bg-gray-700 border border-indigo-500 rounded text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-indigo-400">Maximum Value ({config.unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueFilter.maxValue}
                      onChange={(e) => handleValueFilterChange('maxValue', e.target.value)}
                      placeholder={`e.g., 30`}
                      className="w-full px-3 py-2 bg-gray-700 border border-indigo-500 rounded text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </>
              )}

              {valueFilter.filterType === "greater" && (
                <div className="space-y-2">
                  <label className="text-sm text-indigo-400">Minimum Value ({config.unit})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valueFilter.minValue}
                    onChange={(e) => handleValueFilterChange('minValue', e.target.value)}
                    placeholder={`e.g., 20`}
                    className="w-full px-3 py-2 bg-gray-700 border border-indigo-500 rounded text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              {valueFilter.filterType === "less" && (
                <div className="space-y-2">
                  <label className="text-sm text-indigo-400">Maximum Value ({config.unit})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valueFilter.maxValue}
                    onChange={(e) => handleValueFilterChange('maxValue', e.target.value)}
                    placeholder={`e.g., 30`}
                    className="w-full px-3 py-2 bg-gray-700 border border-indigo-500 rounded text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-indigo-400">Filter Status</label>
                <div className="px-3 py-2 bg-gray-700 border border-indigo-500 rounded text-sm">
                  {valueFilter.filterType === "none" && (
                    <span className="text-gray-300">No filter applied</span>
                  )}
                  {valueFilter.filterType === "between" && (
                    <span className="text-indigo-300">
                      Showing values between {valueFilter.minValue || "min"} and {valueFilter.maxValue || "max"} {config.unit}
                    </span>
                  )}
                  {valueFilter.filterType === "greater" && (
                    <span className="text-indigo-300">
                      Showing values greater than {valueFilter.minValue || "min"} {config.unit}
                    </span>
                  )}
                  {valueFilter.filterType === "less" && (
                    <span className="text-indigo-300">
                      Showing values less than {valueFilter.maxValue || "max"} {config.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>Data Points:</span>
                <span className={filteredData.length !== data.length ? "text-indigo-400 font-semibold" : ""}>
                  {filteredData.length} of {data.length}
                </span>
                {filteredData.length !== data.length && (
                  <span className="text-indigo-400">
                    ({Math.round((filteredData.length / data.length) * 100)}% of total)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-[#0f172a] border border-cyan-500 rounded-lg p-4">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center space-x-3 text-cyan-400">
              <RefreshCw size={24} className="animate-spin" />
              <span>Loading {config.label} data...</span>
            </div>
          </div>
        )}

        {!loading && data.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <TrendingUp size={48} className="text-gray-500 mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-4">
              No {config.label.toLowerCase()} data found for the selected date range.
            </p>
            <button
              onClick={() => setShowPresets(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
            >
              Try Quick Presets
            </button>
          </div>
        )}

        {!loading && data.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">
                {config.label} Data (Main View)
                {filteredData.length !== data.length && (
                  <span className="text-indigo-400 text-base ml-2">
                    (Filtered: {filteredData.length} of {data.length} points)
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-400">
                {apiInfo.dateRange && (
                  <>
                    <span>From: {apiInfo.dateRange.from}</span>
                    <span className="mx-2">|</span>
                    <span>To: {apiInfo.dateRange.to}</span>
                    <span className="mx-2">|</span>
                    <span>Interval: {apiInfo.intervalMinutes} minutes</span>
                  </>
                )}
              </div>
            </div>

            <div className="h-96 mb-4">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800 p-3 rounded border border-cyan-500">
                <div className="text-cyan-400 text-sm">Data Points</div>
                <div className="text-white text-lg">
                  {filteredData.length > 0 ? filteredData.length : data.length}
                  {filteredData.length !== data.length && (
                    <span className="text-xs text-gray-400 ml-1">/ {data.length}</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-cyan-500">
                <div className="text-cyan-400 text-sm">Avg {config.label}</div>
                <div className="text-white text-lg">
                  {(filteredData.length > 0 ? filteredData : data).length > 0 
                    ? ((filteredData.length > 0 ? filteredData : data)
                        .reduce((sum, d) => sum + parseFloat(d[sensorType]), 0) / 
                      (filteredData.length > 0 ? filteredData : data).length).toFixed(2)
                    : "0.00"
                  }{config.unit}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-cyan-500">
                <div className="text-cyan-400 text-sm">Duration</div>
                <div className="text-white text-lg">
                  {apiInfo.dateRange?.durationDays || 0}d {apiInfo.dateRange?.durationHours || 0}h
                </div>
              </div>
            </div>

            {/* Min/Max Values */}
            {(filteredData.length > 0 ? filteredData : data).length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-900 p-3 rounded border border-green-500">
                  <div className="text-green-400 text-sm">Maximum {config.label}</div>
                  <div className="text-white text-lg">
                    {Math.max(...(filteredData.length > 0 ? filteredData : data)
                      .map(d => parseFloat(d[sensorType]))).toFixed(2)}{config.unit}
                  </div>
                </div>
                <div className="bg-blue-900 p-3 rounded border border-blue-500">
                  <div className="text-blue-400 text-sm">Minimum {config.label}</div>
                  <div className="text-white text-lg">
                    {Math.min(...(filteredData.length > 0 ? filteredData : data)
                      .map(d => parseFloat(d[sensorType]))).toFixed(2)}{config.unit}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomDataGraph;