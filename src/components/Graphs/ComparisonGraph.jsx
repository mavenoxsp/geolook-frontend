
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Calendar, Clock, RefreshCw, Plus, X, BarChart3, FileText, Filter, Sliders } from "lucide-react";

const ComparisonGraph = ({ sensorType = "temperature" }) => {
  // Comparison feature states
  const [comparisonRanges, setComparisonRanges] = useState([]);
  const [filteredComparisonRanges, setFilteredComparisonRanges] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);
  const [showComparisonForm, setShowComparisonForm] = useState(false);
  const [newComparisonRange, setNewComparisonRange] = useState({
    fromDateTime: "",
    toDateTime: "",
    intervalMinutes: "5",
    label: "",
    customColor: "#FF6B6B"
  });

  // Value filtering states
  const [showValueFilter, setShowValueFilter] = useState(false);
  const [valueFilter, setValueFilter] = useState({
    minValue: "",
    maxValue: "",
    filterType: "none" // "none", "between", "greater", "less"
  });

  // Color palette for comparison lines
  const comparisonColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", 
    "#54A0FF", "#5F27CD", "#00D2D3", "#FF9FF3", "#F368E0",
    "#FF9F43", "#EE5253", "#10AC84", "#F79F1F", "#A3CB38"
  ];

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

  // Initialize new comparison range with current date
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
    
    setNewComparisonRange({
      fromDateTime: formatDateTime(yesterday),
      toDateTime: formatDateTime(now),
      intervalMinutes: "5",
      label: "",
      customColor: "#FF6B6B"
    });
  }, []);

  // Apply value filtering whenever comparison ranges or filter settings change
  useEffect(() => {
    if (comparisonRanges.length === 0) {
      setFilteredComparisonRanges([]);
      return;
    }

    if (valueFilter.filterType === "none") {
      setFilteredComparisonRanges(comparisonRanges);
      return;
    }

    const filtered = comparisonRanges.map(range => {
      const filteredData = range.data.filter(item => {
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
      
      return {
        ...range,
        data: filteredData,
        originalDataLength: range.data.length
      };
    });
    
    setFilteredComparisonRanges(filtered);
  }, [comparisonRanges, valueFilter, sensorType]);

  // Helper function to blend two colors
  const blendColors = (color1, color2, alpha = 0.5) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 * (1 - alpha) + r2 * alpha);
    const g = Math.round(g1 * (1 - alpha) + g2 * alpha);
    const b = Math.round(b1 * (1 - alpha) + b2 * alpha);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Helper function to find intersection points between datasets
  const findIntersectionPoints = () => {
    const intersections = [];
    const activeRanges = filteredComparisonRanges.length > 0 && valueFilter.filterType !== "none" 
      ? filteredComparisonRanges 
      : comparisonRanges;
    
    if (activeRanges.length < 2) return intersections;
    
    for (let i = 0; i < activeRanges.length; i++) {
      for (let j = i + 1; j < activeRanges.length; j++) {
        const range1 = activeRanges[i];
        const range2 = activeRanges[j];
        
        if (!range1.data || !range2.data) continue;
        
        const minLength = Math.min(range1.data.length, range2.data.length);
        
        for (let k = 0; k < minLength - 1; k++) {
          const y1a = parseFloat(range1.data[k][sensorType]);
          const y1b = parseFloat(range1.data[k + 1][sensorType]);
          const y2a = parseFloat(range2.data[k][sensorType]);
          const y2b = parseFloat(range2.data[k + 1][sensorType]);
          
          // Check if lines cross between these two points
          if ((y1a <= y2a && y1b >= y2b) || (y1a >= y2a && y1b <= y2b)) {
            const blendedColor = blendColors(range1.color, range2.color);
            intersections.push({
              x: k + 0.5, // Approximate intersection point
              y: (y1a + y1b + y2a + y2b) / 4, // Average of the four points
              color: blendedColor,
              datasets: [i, j],
              labels: [range1.label, range2.label]
            });
          }
        }
      }
    }
    
    return intersections;
  };

  const fetchComparisonData = async (range, index) => {
    try {
      // Parse datetime-local values
      const fromDate = new Date(range.fromDateTime);
      const toDate = new Date(range.toDateTime);

      const params = new URLSearchParams({
        fromDate: fromDate.toISOString().split('T')[0],
        fromTime: fromDate.toTimeString().split(' ')[0],
        toDate: toDate.toISOString().split('T')[0],
        toTime: toDate.toTimeString().split(' ')[0],
        intervalMinutes: range.intervalMinutes
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

      return {
        ...range,
        data: validData,
        apiInfo: responseData,
        color: range.customColor || comparisonColors[index % comparisonColors.length]
      };
    } catch (err) {
      throw new Error(`Failed to load comparison data: ${err.message}`);
    }
  };

  const addComparisonRange = async () => {
    if (!newComparisonRange.fromDateTime || !newComparisonRange.toDateTime) {
      setComparisonError("Please select both from and to date-time");
      return;
    }

    if (!newComparisonRange.label.trim()) {
      setComparisonError("Please provide a label for this comparison");
      return;
    }

    try {
      setComparisonLoading(true);
      setComparisonError(null);

      const comparisonData = await fetchComparisonData(newComparisonRange, comparisonRanges.length);
      
      setComparisonRanges(prev => [...prev, comparisonData]);
      
      // Reset form
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
      
      setNewComparisonRange({
        fromDateTime: formatDateTime(yesterday),
        toDateTime: formatDateTime(now),
        intervalMinutes: "5",
        label: "",
        customColor: comparisonColors[(comparisonRanges.length + 1) % comparisonColors.length]
      });
      
      setShowComparisonForm(false);
      setComparisonLoading(false);
    } catch (err) {
      setComparisonError(err.message);
      setComparisonLoading(false);
    }
  };

  const removeComparisonRange = (index) => {
    setComparisonRanges(prev => prev.filter((_, i) => i !== index));
  };

  const handleComparisonInputChange = (field, value) => {
    setNewComparisonRange(prev => ({
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

  const downloadComparisonReport = () => {
    if (comparisonRanges.length === 0) return;

    let csvContent = ["Comparison Report\n"];
    csvContent.push(`Sensor Type: ${config.label} (${config.unit})\n`);
    csvContent.push(`Generated: ${new Date().toISOString()}\n\n`);

    comparisonRanges.forEach((range, index) => {
      csvContent.push(`Dataset ${index + 1}: ${range.label}\n`);
      csvContent.push(`Period: ${range.fromDateTime} to ${range.toDateTime}\n`);
      csvContent.push(`Data Points: ${range.data.length}\n`);
      
      if (range.data.length > 0) {
        const values = range.data.map(d => parseFloat(d[sensorType]));
        const avg = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
        const max = Math.max(...values).toFixed(2);
        const min = Math.min(...values).toFixed(2);
        
        csvContent.push(`Average: ${avg}${config.unit}\n`);
        csvContent.push(`Maximum: ${max}${config.unit}\n`);
        csvContent.push(`Minimum: ${min}${config.unit}\n`);
      }
      csvContent.push("\n");
    });

    csvContent.push("Detailed Data:\n");
    csvContent.push("Dataset,Label,Timestamp,Value,Record Count\n");
    
    comparisonRanges.forEach((range, rangeIndex) => {
      range.data.forEach(d => {
        csvContent.push(`${rangeIndex + 1},${range.label},${d.intervalKey},${d[sensorType]},${d.recordCount}\n`);
      });
    });

    const blob = new Blob([csvContent.join("")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.label}_comparison_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Chart configuration for comparison chart
  const intersectionPoints = findIntersectionPoints();
  const activeRanges = filteredComparisonRanges.length > 0 && valueFilter.filterType !== "none" 
    ? filteredComparisonRanges 
    : comparisonRanges;
  
  const comparisonChartData = {
    datasets: [
      // Main comparison datasets
      ...activeRanges.map((range, index) => ({
        label: range.label + (range.originalDataLength && range.data.length !== range.originalDataLength ? ` (${range.data.length}/${range.originalDataLength})` : ''),
        data: range.data ? range.data.map((d, dataIndex) => ({
          x: dataIndex,
          y: parseFloat(d[sensorType] || 0),
          rawData: d,
        })) : [],
        borderColor: range.color,
        backgroundColor: `${range.color}20`,
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: range.color,
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
        fill: false,
      })),
      // Intersection points dataset
      ...(intersectionPoints.length > 0 ? [{
        label: 'Intersection Points',
        data: intersectionPoints.map(point => ({
          x: point.x,
          y: point.y,
          intersectionData: point
        })),
        borderColor: 'transparent',
        backgroundColor: intersectionPoints.map(point => point.color),
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBorderWidth: 3,
        pointBorderColor: '#FFFFFF',
        showLine: false,
        pointStyle: 'circle',
      }] : [])
    ]
  };

  const comparisonChartOptions = {
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
            if (items.length > 0 && items[0].raw.rawData) {
              const dataPoint = items[0].raw.rawData;
              return `${items[0].dataset.label} - Time: ${dataPoint.intervalKeyShort || dataPoint.intervalKey}`;
            }
            return "";
          },
          label: (item) => {
            // Handle intersection points
            if (item.raw.intersectionData) {
              const intersection = item.raw.intersectionData;
              return [
                `Intersection Point`,
                `Value: ${item.raw.y.toFixed(4)}${config.unit}`,
                `Between: ${intersection.labels[0]} & ${intersection.labels[1]}`,
                `Blended Color: ${intersection.color}`
              ];
            }
            
            // Handle regular data points
            const value = item.raw.y.toFixed(4);
            const dataPoint = item.raw.rawData;
            if (dataPoint) {
              return [
                `${config.label}: ${value}${config.unit}`,
                `Records: ${dataPoint.recordCount || 'N/A'}`,
                `Dataset: ${item.dataset.label}`,
                `Full Time: ${dataPoint.intervalKey || 'N/A'}`
              ];
            }
            return [`${config.label}: ${value}${config.unit}`];
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
          callback: function (value, index, ticks) {
            // Show time from the first dataset for reference
            if (activeRanges.length > 0 && activeRanges[0].data) {
              const firstDataset = activeRanges[0];
              const dataIndex = Math.floor(value);
              if (firstDataset.data[dataIndex]) {
                return firstDataset.data[dataIndex].intervalKeyShort || firstDataset.data[dataIndex].intervalKey || "";
              }
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
    <div className="bg-[#0f172a] border border-cyan-500 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center space-x-2">
          <BarChart3 size={24} />
          <span>Comparison Analysis</span>
        </h2>
        
        <div className="flex space-x-2">
          {comparisonRanges.length > 0 && (
            <button
              onClick={() => setShowValueFilter(!showValueFilter)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
            >
              <Filter size={16} />
              <span>Filter Values</span>
            </button>
          )}
          
          <button
            onClick={() => setShowComparisonForm(!showComparisonForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            <Plus size={16} />
            <span>Add Comparison</span>
          </button>
          
          {comparisonRanges.length > 0 && (
            <button
              onClick={downloadComparisonReport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              <FileText size={16} />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Value Filter Panel */}
      {showValueFilter && comparisonRanges.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 border border-indigo-500 rounded">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-400 flex items-center space-x-2">
              <Sliders size={20} />
              <span>Value Filtering for Comparisons</span>
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
                    Between {valueFilter.minValue || "min"} and {valueFilter.maxValue || "max"} {config.unit}
                  </span>
                )}
                {valueFilter.filterType === "greater" && (
                  <span className="text-indigo-300">
                    Greater than {valueFilter.minValue || "min"} {config.unit}
                  </span>
                )}
                {valueFilter.filterType === "less" && (
                  <span className="text-indigo-300">
                    Less than {valueFilter.maxValue || "max"} {config.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonRanges.map((range, index) => {
                const originalLength = range.data ? range.data.length : 0;
                const filteredRange = filteredComparisonRanges.find((_, i) => i === index);
                const filteredLength = filteredRange && filteredRange.data ? filteredRange.data.length : originalLength;
                const isFiltered = filteredLength !== originalLength && valueFilter.filterType !== "none";
                
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: range.color }}
                    ></div>
                    <span className="text-xs">{range.label}:</span>
                    <span className={isFiltered ? "text-indigo-400 font-semibold" : ""}>
                      {filteredLength}
                      {isFiltered && <span className="text-gray-400">/{originalLength}</span>}
                    </span>
                    {isFiltered && originalLength > 0 && (
                      <span className="text-indigo-400 text-xs">
                        ({Math.round((filteredLength / originalLength) * 100)}%)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Comparison Form */}
      {showComparisonForm && (
        <div className="mb-6 p-4 bg-gray-800 border border-purple-500 rounded">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Add New Comparison Range</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-purple-400">Label</label>
              <input
                type="text"
                value={newComparisonRange.label}
                onChange={(e) => handleComparisonInputChange('label', e.target.value)}
                placeholder="e.g., Last Week"
                className="w-full px-3 py-2 bg-gray-700 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-400">Line Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={newComparisonRange.customColor}
                  onChange={(e) => handleComparisonInputChange('customColor', e.target.value)}
                  className="w-12 h-10 bg-gray-700 border border-purple-500 rounded cursor-pointer"
                  title="Choose line color"
                />
                <select
                  value={newComparisonRange.customColor}
                  onChange={(e) => handleComparisonInputChange('customColor', e.target.value)}
                  className="flex-1 px-2 py-2 bg-gray-700 border border-purple-500 rounded text-white text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="#FF6B6B">Red</option>
                  <option value="#4ECDC4">Teal</option>
                  <option value="#45B7D1">Blue</option>
                  <option value="#96CEB4">Green</option>
                  <option value="#FECA57">Yellow</option>
                  <option value="#54A0FF">Light Blue</option>
                  <option value="#5F27CD">Purple</option>
                  <option value="#00D2D3">Cyan</option>
                  <option value="#FF9FF3">Pink</option>
                  <option value="#F368E0">Magenta</option>
                  <option value="#FF9F43">Orange</option>
                  <option value="#EE5253">Dark Red</option>
                  <option value="#10AC84">Dark Green</option>
                  <option value="#F79F1F">Dark Orange</option>
                  <option value="#A3CB38">Lime</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-purple-400 flex items-center space-x-1">
                <Calendar size={16} />
                <span>From Date & Time</span>
              </label>
              <input
                type="datetime-local"
                step="1"
                value={newComparisonRange.fromDateTime}
                onChange={(e) => handleComparisonInputChange('fromDateTime', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-400 flex items-center space-x-1">
                <Calendar size={16} />
                <span>To Date & Time</span>
              </label>
              <input
                type="datetime-local"
                step="1"
                value={newComparisonRange.toDateTime}
                onChange={(e) => handleComparisonInputChange('toDateTime', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-purple-400">Interval (min)</label>
              <select
                value={newComparisonRange.intervalMinutes}
                onChange={(e) => handleComparisonInputChange('intervalMinutes', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400"
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
          </div>

          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={addComparisonRange}
              disabled={comparisonLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded transition-colors"
            >
              {comparisonLoading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>{comparisonLoading ? "Adding..." : "Add to Comparison"}</span>
            </button>
            
            <button
              onClick={() => setShowComparisonForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
            >
              Cancel
            </button>
          </div>

          {comparisonError && (
            <div className="mt-3 p-3 bg-red-900 border border-red-500 rounded text-red-400">
              {comparisonError}
            </div>
          )}
        </div>
      )}

      {/* Active Comparisons List */}
      {comparisonRanges.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">Active Comparisons ({comparisonRanges.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {comparisonRanges.map((range, index) => (
              <div key={index} className="bg-gray-800 border border-gray-600 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: range.color }}
                    ></div>
                    <span className="font-semibold text-white">{range.label}</span>
                  </div>
                  <button
                    onClick={() => removeComparisonRange(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Remove comparison"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  <div>{new Date(range.fromDateTime).toLocaleString()}</div>
                  <div>to {new Date(range.toDateTime).toLocaleString()}</div>
                  <div className="mt-1 text-cyan-400">
                    {range.data.length} data points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      {comparisonRanges.length > 0 && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">
              Comparison Chart - {config.label}
            </h3>
            <div className="text-sm text-gray-400">
              Compare multiple date ranges side by side. Each line represents a different time period.
            </div>
          </div>

          <div className="h-96 mb-6">
            <Line data={comparisonChartData} options={comparisonChartOptions} />
          </div>

          {/* Comparison Statistics */}
          <div className="bg-gray-800 border border-cyan-500 rounded p-4">
            <h4 className="text-cyan-400 font-semibold mb-3">Comparison Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonRanges.map((range, index) => {
                const values = range.data.map(d => parseFloat(d[sensorType]));
                const avg = values.length > 0 ? (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2) : "0.00";
                const max = values.length > 0 ? Math.max(...values).toFixed(2) : "0.00";
                const min = values.length > 0 ? Math.min(...values).toFixed(2) : "0.00";
                
                return (
                  <div key={index} className="bg-gray-700 border rounded p-3" style={{ borderColor: range.color }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: range.color }}
                      ></div>
                      <span className="font-semibold text-white text-sm">{range.label}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average:</span>
                        <span className="text-white">{avg}{config.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Maximum:</span>
                        <span className="text-green-400">{max}{config.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Minimum:</span>
                        <span className="text-blue-400">{min}{config.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data Points:</span>
                        <span className="text-cyan-400">{range.data.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intersection Points Information */}
          {intersectionPoints.length > 0 && (
            <div className="mt-4 bg-gray-800 border border-yellow-500 rounded p-4">
              <h4 className="text-yellow-400 font-semibold mb-3 flex items-center space-x-2">
                <span>🔗</span>
                <span>Line Intersections ({intersectionPoints.length})</span>
              </h4>
              <div className="text-sm text-gray-300 mb-3">
                Points where different comparison lines meet, showing blended colors of intersecting datasets.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {intersectionPoints.map((point, index) => (
                  <div key={index} className="bg-gray-700 border border-gray-600 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white" 
                        style={{ backgroundColor: point.color }}
                        title="Blended intersection color"
                      ></div>
                      <span className="text-white font-semibold text-sm">Intersection #{index + 1}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="text-white">{point.y.toFixed(2)}{config.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Position:</span>
                        <span className="text-cyan-400">~{Math.round(point.x)}</span>
                      </div>
                      <div className="text-gray-400 mt-2">
                        <div className="font-semibold">Between:</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: comparisonRanges[point.datasets[0]].color }}
                          ></div>
                          <span className="text-xs">{point.labels[0]}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: comparisonRanges[point.datasets[1]].color }}
                          ></div>
                          <span className="text-xs">{point.labels[1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Summary */}
          <div className="mt-4 bg-gray-800 border border-cyan-500 rounded p-4">
            <h4 className="text-cyan-400 font-semibold mb-3">Summary Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-cyan-400 text-sm font-semibold">Highest Average</div>
                {comparisonRanges.length > 0 && (() => {
                  const rangeAvgs = comparisonRanges.map(range => {
                    const values = range.data.map(d => parseFloat(d[sensorType]));
                    const avg = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
                    return { ...range, avg };
                  });
                  const highest = rangeAvgs.reduce((max, range) => range.avg > max.avg ? range : max);
                  return (
                    <div className="text-white">
                      <div className="font-semibold">{highest.label}</div>
                      <div className="text-green-400">{highest.avg.toFixed(2)}{config.unit}</div>
                    </div>
                  );
                })()}
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-cyan-400 text-sm font-semibold">Peak Value</div>
                {comparisonRanges.length > 0 && (() => {
                  let globalMax = -Infinity;
                  let maxRange = null;
                  comparisonRanges.forEach(range => {
                    const values = range.data.map(d => parseFloat(d[sensorType]));
                    if (values.length > 0) {
                      const rangeMax = Math.max(...values);
                      if (rangeMax > globalMax) {
                        globalMax = rangeMax;
                        maxRange = range;
                      }
                    }
                  });
                  return maxRange ? (
                    <div className="text-white">
                      <div className="font-semibold">{maxRange.label}</div>
                      <div className="text-red-400">{globalMax.toFixed(2)}{config.unit}</div>
                    </div>
                  ) : <div className="text-gray-400">No data</div>;
                })()}
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-cyan-400 text-sm font-semibold">Most Data Points</div>
                {comparisonRanges.length > 0 && (() => {
                  const mostData = comparisonRanges.reduce((max, range) => 
                    range.data.length > max.data.length ? range : max
                  );
                  return (
                    <div className="text-white">
                      <div className="font-semibold">{mostData.label}</div>
                      <div className="text-purple-400">{mostData.data.length} points</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {comparisonRanges.length === 0 && !showComparisonForm && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BarChart3 size={48} className="text-gray-500 mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No Comparisons Yet</h3>
          <p className="text-gray-500 mb-4">
            Add multiple date ranges to compare {config.label.toLowerCase()} data across different time periods.
          </p>
          <button
            onClick={() => setShowComparisonForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            <Plus size={16} />
            <span>Add First Comparison</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparisonGraph;