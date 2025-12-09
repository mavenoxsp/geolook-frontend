import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  ScatterController
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { Calendar, Clock, TrendingUp, RefreshCw, Download, Filter, Sliders, X } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  ScatterController,
  zoomPlugin
);

const SensorCorrelation = () => {
  const [sensor1, setSensor1] = useState('temperature');
  const [sensor2, setSensor2] = useState('hum');
  const [dateRange, setDateRange] = useState({
    fromDateTime: '',
    toDateTime: '',
    intervalMinutes: '5'
  });
  const [graphType, setGraphType] = useState('timeSeries');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showValueFilter, setShowValueFilter] = useState(false);
  const [valueFilter, setValueFilter] = useState({
    minValue1: '',
    maxValue1: '',
    minValue2: '',
    maxValue2: '',
    filterType: 'none'
  });
  const [filteredData, setFilteredData] = useState(null);
  const chartRef = useRef();

  // Sensor configuration
  const sensorOptions = [
    { value: 'temperature', label: 'Temperature', unit: '°C', color: '#FF6B6B' },
    { value: 'hum', label: 'Humidity', unit: '%', color: '#4ECDC4' },
    { value: 'ws_2', label: 'Wind Speed', unit: 'm/s', color: '#45B7D1' },
    { value: 'wd', label: 'Wind Direction', unit: '°', color: '#96CEB4' },
    { value: 'press_h', label: 'Atmospheric Pressure', unit: 'hPa', color: '#FECA57' },
    { value: 'curr_rain', label: 'Current Rainfall', unit: 'mm', color: '#54A0FF' },
    { value: 'max_WS', label: 'Maximum Wind Speed', unit: 'm/s', color: '#5F27CD' },
    { value: 'VP_mbar', label: 'Vapor Pressure', unit: 'mbar', color: '#00D2D3' },
    { value: 'tilt_NS', label: 'North-South Tilt', unit: '°', color: '#FF9FF3' },
    { value: 'tilt_WE', label: 'West-East Tilt', unit: '°', color: '#F368E0' },
    { value: 'Strike', label: 'Lightning Strike', unit: 'count', color: '#FF9F43' },
    { value: 'bv', label: 'Battery Voltage', unit: 'V', color: '#EE5253' }
  ];

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
      intervalMinutes: '5'
    });
  }, []);

  // Apply value filtering whenever data or filter settings change
  useEffect(() => {
    if (!data || !data.rawData) return;
    
    if (valueFilter.filterType === 'none') {
      setFilteredData(data);
      return;
    }

    const filteredRaw = data.rawData.filter(item => {
      const val1 = parseFloat(item[sensor1]);
      const val2 = parseFloat(item[sensor2]);
      
      let valid1 = true;
      let valid2 = true;
      
      // Filter for sensor1
      if (valueFilter.minValue1 !== '' && !isNaN(parseFloat(valueFilter.minValue1))) {
        valid1 = valid1 && val1 >= parseFloat(valueFilter.minValue1);
      }
      if (valueFilter.maxValue1 !== '' && !isNaN(parseFloat(valueFilter.maxValue1))) {
        valid1 = valid1 && val1 <= parseFloat(valueFilter.maxValue1);
      }
      
      // Filter for sensor2
      if (valueFilter.minValue2 !== '' && !isNaN(parseFloat(valueFilter.minValue2))) {
        valid2 = valid2 && val2 >= parseFloat(valueFilter.minValue2);
      }
      if (valueFilter.maxValue2 !== '' && !isNaN(parseFloat(valueFilter.maxValue2))) {
        valid2 = valid2 && val2 <= parseFloat(valueFilter.maxValue2);
      }
      
      return valid1 && valid2;
    });
    
    // Recalculate correlation for filtered data
    const validPairs = filteredRaw.map(item => ({
      x: parseFloat(item[sensor1]),
      y: parseFloat(item[sensor2])
    }));
    
    const correlation = calculateCorrelation(validPairs);
    const correlationSummary = generateCorrelationSummary(sensor1, sensor2, correlation);
    
    // Group filtered data by intervals
    const intervalData = groupDataByInterval(
      filteredRaw, 
      parseInt(dateRange.intervalMinutes), 
      sensor1, 
      sensor2
    );
    
    setFilteredData({
      ...data,
      rawData: filteredRaw,
      intervalData,
      correlation,
      summary: correlationSummary,
      validRecords: filteredRaw.length
    });
  }, [data, valueFilter, sensor1, sensor2, dateRange.intervalMinutes]);

  const fetchCorrelationData = async () => {
    setLoading(true);
    setError('');
    setFilteredData(null);
    
    try {
      if (!dateRange.fromDateTime || !dateRange.toDateTime) {
        setError('Please select both from and to date-time');
        setLoading(false);
        return;
      }

      // Parse datetime-local values
      const fromDate = new Date(dateRange.fromDateTime);
      const toDate = new Date(dateRange.toDateTime);

      if (fromDate >= toDate) {
        setError('From date must be before To date');
        setLoading(false);
        return;
      }

      const params = {
        sensor1,
        sensor2,
        startDate: fromDate.toISOString().split('T')[0] + ' ' + dateRange.fromDateTime.split('T')[1],
        endDate: toDate.toISOString().split('T')[0] + ' ' + dateRange.toDateTime.split('T')[1],
        intervalMinutes: dateRange.intervalMinutes
      };

      const response = await axios.get('/api/sensors/correlation', { params });
      
      setData(response.data);
    } catch (err) {
      console.error('Error fetching correlation data:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // const fetchCorrelationData = async () => {
  //   setLoading(true);
  //   setError('');
  //   setFilteredData(null);

  //   try {
  //     const tryFetch = async (from, to) => {
  //       const params = {
  //         sensor1,
  //         sensor2,
  //         startDate: from.toISOString().split('T')[0] + ' ' + from.toISOString().split('T')[1].split('.')[0],
  //         endDate: to.toISOString().split('T')[0] + ' ' + to.toISOString().split('T')[1].split('.')[0],
  //         intervalMinutes: dateRange.intervalMinutes,
  //       };

  //       const res = await axios.get('/api/sensors/correlation', { params });
  //       return res.data;
  //     };

  //     // Dates from UI (yesterday → now)
  //     const primaryFrom = new Date(dateRange.fromDateTime);
  //     const primaryTo = new Date(dateRange.toDateTime);

  //     // Fallback (Sept 1 → now)
  //     const fallbackFrom = new Date('2025-09-01T00:00:00');
  //     const fallbackTo = new Date();

  //     // Step 1: Try yesterday → now
  //     let result = await tryFetch(primaryFrom, primaryTo);

  //     // Step 2: If no data returned → try fallback
  //     if (!result || result.length === 0) {
  //       console.log("No data for yesterday → now. Fetching from September 1 instead...");
  //       result = await tryFetch(fallbackFrom, fallbackTo);

  //       // Also update the UI visible date range to reflect fallback
  //       setDateRange({
  //         fromDateTime: fallbackFrom.toISOString().slice(0,19),
  //         toDateTime: fallbackTo.toISOString().slice(0,19),
  //         intervalMinutes: '5',
  //       });
  //     }

  //     setData(result);

  //   } catch (err) {
  //     console.error('Error fetching correlation data:', err);
  //     setError(err.response?.data?.error || 'Failed to fetch data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


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

  const resetValueFilter = () => {
    setValueFilter({
      minValue1: '',
      maxValue1: '',
      minValue2: '',
      maxValue2: '',
      filterType: 'none'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCorrelationData();
  };

  const exportData = (format) => {
    const displayData = filteredData || data;
    if (!displayData) return;
    
    if (format === 'csv') {
      // Create CSV content
      const headers = ['Timestamp', sensor1, sensor2].join(',');
      const rows = displayData.rawData.map(item => 
        [item.timestamp, item[sensor1], item[sensor2]].join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sensor_correlation_${sensor1}_${sensor2}.csv`;
      link.click();
    } else if (format === 'png') {
      // Export chart as PNG
      if (chartRef.current) {
        const url = chartRef.current.toBase64Image();
        const link = document.createElement('a');
        link.href = url;
        link.download = `sensor_correlation_${sensor1}_${sensor2}.png`;
        link.click();
      }
    }
  };

  const resetZoom = () => {
    if (chartRef.current && chartRef.current.resetZoom) {
      chartRef.current.resetZoom();
    }
  };

  // Calculate correlation coefficient
  const calculateCorrelation = (pairs) => {
    if (pairs.length < 2) return 0;
    
    const n = pairs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    pairs.forEach(pair => {
      sumX += pair.x;
      sumY += pair.y;
      sumXY += pair.x * pair.y;
      sumX2 += pair.x * pair.x;
      sumY2 += pair.y * pair.y;
    });
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator !== 0 ? numerator / denominator : 0;
  };

  // Generate correlation summary text
  const generateCorrelationSummary = (sensor1, sensor2, correlation) => {
    const sensorNames = {
      temperature: 'Temperature',
      hum: 'Humidity',
      ws_2: 'Wind Speed',
      wd: 'Wind Direction',
      press_h: 'Atmospheric Pressure',
      curr_rain: 'Current Rainfall',
      max_WS: 'Maximum Wind Speed',
      VP_mbar: 'Vapor Pressure',
      tilt_NS: 'North-South Tilt',
      tilt_WE: 'West-East Tilt',
      Strike: 'Lightning Strike',
      bv: 'Battery Voltage'
    };
    
    const absCorrelation = Math.abs(correlation);
    let strength, direction, explanation;
    
    if (absCorrelation >= 0.8) {
      strength = 'very strong';
    } else if (absCorrelation >= 0.6) {
      strength = 'strong';
    } else if (absCorrelation >= 0.4) {
      strength = 'moderate';
    } else if (absCorrelation >= 0.2) {
      strength = 'weak';
    } else {
      strength = 'very weak or no';
    }
    
    direction = correlation > 0 ? 'positive' : 'negative';
    
    // Custom explanations based on sensor pairs
    if (sensor1 === 'temperature' && sensor2 === 'hum') {
      explanation = 'Temperature and humidity typically have an inverse relationship. Higher temperatures can hold more moisture, but relative humidity often decreases as temperature increases.';
    } else if (sensor1 === 'ws_2' && sensor2 === 'tilt_NS') {
      explanation = 'Wind speed and tilt may correlate during strong wind events where equipment is affected by wind force.';
    } else if (sensor1 === 'curr_rain' && sensor2 === 'hum') {
      explanation = 'Rainfall and humidity are directly related as rain increases atmospheric moisture content.';
    } else {
      explanation = 'The relationship between these sensors may indicate environmental interactions or equipment behavior.';
    }
    
    return {
      strength,
      direction,
      value: correlation,
      text: `${strength} ${direction} correlation (r = ${correlation.toFixed(3)}) between ${sensorNames[sensor1]} and ${sensorNames[sensor2]}.`,
      explanation
    };
  };

  // Group data by time intervals
  const groupDataByInterval = (data, intervalMinutes, sensor1, sensor2) => {
    if (data.length === 0) return [];
    
    const intervalData = {};
    const firstTimestamp = new Date(data[0].timestamp);
    
    data.forEach(item => {
      const timestamp = new Date(item.timestamp);
      const timeDiff = timestamp - firstTimestamp;
      const intervalIndex = Math.floor(timeDiff / (intervalMinutes * 60 * 1000));
      const intervalKey = intervalIndex * intervalMinutes;
      
      if (!intervalData[intervalKey]) {
        intervalData[intervalKey] = {
          timeKey: intervalKey,
          timestamp: item.timestamp,
          [sensor1]: 0,
          [sensor2]: 0,
          count: 0
        };
      }
      
      intervalData[intervalKey][sensor1] += parseFloat(item[sensor1]);
      intervalData[intervalKey][sensor2] += parseFloat(item[sensor2]);
      intervalData[intervalKey].count += 1;
    });
    
    // Calculate averages and format
    return Object.values(intervalData).map(item => ({
      timeKey: item.timeKey,
      timestamp: item.timestamp,
      [sensor1]: item[sensor1] / item.count,
      [sensor2]: item[sensor2] / item.count
    })).sort((a, b) => a.timeKey - b.timeKey);
  };

  // Prepare chart data for time series
  const getTimeSeriesData = () => {
    const displayData = filteredData || data;
    if (!displayData || !displayData.intervalData) return { datasets: [] };
    
    const sensor1Config = sensorOptions.find(s => s.value === sensor1);
    const sensor2Config = sensorOptions.find(s => s.value === sensor2);
    
    return {
      datasets: [
        {
          label: sensor1Config?.label || sensor1,
          data: displayData.intervalData.map(item => ({
            x: new Date(item.timestamp),
            y: item[sensor1]
          })),
          borderColor: sensor1Config?.color || 'rgb(75, 192, 192)',
          backgroundColor: sensor1Config?.color ? `${sensor1Config.color}20` : 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y',
          tension: 0.1,
          fill: false
        },
        {
          label: sensor2Config?.label || sensor2,
          data: displayData.intervalData.map(item => ({
            x: new Date(item.timestamp),
            y: item[sensor2]
          })),
          borderColor: sensor2Config?.color || 'rgb(255, 99, 132)',
          backgroundColor: sensor2Config?.color ? `${sensor2Config.color}20` : 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y1',
          tension: 0.1,
          fill: false
        }
      ]
    };
  };

  // Prepare chart data for scatter plot
  const getScatterData = () => {
    const displayData = filteredData || data;
    if (!displayData || !displayData.rawData) return { datasets: [] };
    
    const sensor1Config = sensorOptions.find(s => s.value === sensor1);
    const sensor2Config = sensorOptions.find(s => s.value === sensor2);
    
    return {
      datasets: [
        {
          label: `${sensor1Config?.label} vs ${sensor2Config?.label}`,
          data: displayData.rawData.map(item => ({
            x: parseFloat(item[sensor1]),
            y: parseFloat(item[sensor2])
          })),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          pointRadius: 3,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const timeSeriesOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Time Series: ${sensorOptions.find(s => s.value === sensor1)?.label} vs ${sensorOptions.find(s => s.value === sensor2)?.label}`,
        color: '#00FFFF',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          }
        },
        backgroundColor: '#0f172a',
        borderColor: '#00FFFF',
        borderWidth: 1,
        titleColor: '#00FFFF',
        bodyColor: '#00FFFF',
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
          drag: { enabled: true },
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        limits: {
          x: { min: 'original', max: 'original' }
        }
      },
      legend: {
        labels: { color: '#00FFFF' }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          parser: 'yyyy-MM-dd HH:mm:ss',
          tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
          displayFormats: {
            hour: 'MMM dd HH:mm',
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Time',
          color: '#00FFFF'
        },
        ticks: { color: '#00FFFF' },
        grid: { color: 'rgba(0, 255, 255, 0.1)' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: sensorOptions.find(s => s.value === sensor1)?.label || sensor1,
          color: '#00FFFF'
        },
        ticks: { color: '#00FFFF' },
        grid: { color: 'rgba(0, 255, 255, 0.1)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: sensorOptions.find(s => s.value === sensor2)?.label || sensor2,
          color: '#00FFFF'
        },
        ticks: { color: '#00FFFF' }
      }
    }
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Scatter Plot: ${sensorOptions.find(s => s.value === sensor1)?.label} vs ${sensorOptions.find(s => s.value === sensor2)?.label}`,
        color: '#00FFFF',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const point = context.raw;
            return [
              `${sensorOptions.find(s => s.value === sensor1)?.label}: ${point.x.toFixed(2)}`,
              `${sensorOptions.find(s => s.value === sensor2)?.label}: ${point.y.toFixed(2)}`
            ];
          }
        },
        backgroundColor: '#0f172a',
        borderColor: '#00FFFF',
        borderWidth: 1,
        titleColor: '#00FFFF',
        bodyColor: '#00FFFF',
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy',
          drag: { enabled: true },
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' }
        }
      },
      legend: {
        labels: { color: '#00FFFF' }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: sensorOptions.find(s => s.value === sensor1)?.label || sensor1,
          color: '#00FFFF'
        },
        ticks: { color: '#00FFFF' },
        grid: { color: 'rgba(0, 255, 255, 0.1)' }
      },
      y: {
        title: {
          display: true,
          text: sensorOptions.find(s => s.value === sensor2)?.label || sensor2,
          color: '#00FFFF'
        },
        ticks: { color: '#00FFFF' },
        grid: { color: 'rgba(0, 255, 255, 0.1)' }
      }
    }
  };

  const displayData = filteredData || data;
  const sensor1Config = sensorOptions.find(s => s.value === sensor1);
  const sensor2Config = sensorOptions.find(s => s.value === sensor2);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-[#0f172a] border border-cyan-500 rounded-lg p-4">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center space-x-2">
          <TrendingUp size={24} />
          <span>Sensor Correlation Analysis</span>
        </h2>

        {/* Sensor Selection and Controls */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Sensor 1 Selection */}
          <div className="space-y-2">
            <label className="text-sm text-cyan-400">Sensor 1</label>
            <select
              value={sensor1}
              onChange={(e) => setSensor1(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none focus:border-cyan-400"
            >
              {sensorOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {/* Sensor 2 Selection */}
          <div className="space-y-2">
            <label className="text-sm text-cyan-400">Sensor 2</label>
            <select
              value={sensor2}
              onChange={(e) => setSensor2(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none focus:border-cyan-400"
            >
              {sensorOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Graph Type Selection */}
          <div className="space-y-2">
            <label className="text-sm text-cyan-400">Graph Type</label>
            <select
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-cyan-500 rounded text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="timeSeries">Time Series</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>
        </form>

        {/* Date Range Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <div className="space-y-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded transition-colors"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              <span>{loading ? "Loading..." : "Load Data"}</span>
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between mt-4 space-y-2 md:space-y-0">
          <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0">
            {displayData && (
              <button
                onClick={() => setShowValueFilter(!showValueFilter)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
              >
                <Filter size={16} />
                <span>Filter Values</span>
              </button>
            )}

            {displayData && (
              <button
                onClick={resetZoom}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <X size={16} />
                <span>Reset Zoom</span>
              </button>
            )}

            {displayData && (
              <button
                onClick={() => exportData('png')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                <Download size={16} />
                <span>Export PNG</span>
              </button>
            )}

            {displayData && (
              <button
                onClick={() => exportData('csv')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {displayData && (
            <div className="text-sm text-cyan-400">
              Records: {displayData.validRecords} of {displayData.totalRecords} | 
              Correlation: {displayData.correlation?.toFixed(3)}
            </div>
          )}
        </div>

        {/* Value Filter Panel */}
        {showValueFilter && displayData && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sensor 1 Filter */}
              <div className="space-y-4">
                <h4 className="text-indigo-300 font-medium" style={{ color: sensor1Config?.color }}>
                  {sensor1Config?.label} Filter
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-sm text-indigo-400">Min Value ({sensor1Config?.unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueFilter.minValue1}
                      onChange={(e) => handleValueFilterChange('minValue1', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-indigo-500 rounded text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-indigo-400">Max Value ({sensor1Config?.unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueFilter.maxValue1}
                      onChange={(e) => handleValueFilterChange('maxValue1', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-indigo-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sensor 2 Filter */}
              <div className="space-y-4">
                <h4 className="text-indigo-300 font-medium" style={{ color: sensor2Config?.color }}>
                  {sensor2Config?.label} Filter
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-sm text-indigo-400">Min Value ({sensor2Config?.unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueFilter.minValue2}
                      onChange={(e) => handleValueFilterChange('minValue2', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-indigo-500 rounded text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-indigo-400">Max Value ({sensor2Config?.unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valueFilter.maxValue2}
                      onChange={(e) => handleValueFilterChange('maxValue2', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-indigo-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>Data Points:</span>
                <span className={filteredData ? "text-indigo-400 font-semibold" : ""}>
                  {displayData.validRecords} of {data?.validRecords || displayData.validRecords}
                </span>
                {filteredData && (
                  <span className="text-indigo-400">
                    ({Math.round((displayData.validRecords / data.validRecords) * 100)}% of total)
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

      {/* Results Section */}
      {displayData && (
        <div className="bg-[#0f172a] border border-cyan-500 rounded-lg p-4">
          {/* Correlation Summary 
          
                    <div className="mb-6 p-4 bg-gray-800 rounded border border-cyan-500">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Correlation Analysis</h3>
            <p className="text-white mb-2">{displayData.summary?.text}</p>
            <p className="text-gray-300 text-sm">{displayData.summary?.explanation}</p>
          </div>

          */}


          {/* Chart */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              {graphType === 'timeSeries' ? 'Time Series Chart' : 'Scatter Plot'}
              {filteredData && (
                <span className="text-indigo-400 text-base ml-2">
                  (Filtered: {displayData.validRecords} of {data.validRecords} points)
                </span>
              )}
            </h2>
            
            <div className="h-96">
              {graphType === 'timeSeries' ? (
                <Line 
                  ref={chartRef}
                  data={getTimeSeriesData()} 
                  options={timeSeriesOptions} 
                />
              ) : (
                <Scatter 
                  ref={chartRef}
                  data={getScatterData()} 
                  options={scatterOptions} 
                />
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sensor 1 Stats */}
            <div className="bg-gray-800 p-4 rounded border border-cyan-500">
              <h3 className="text-lg font-semibold mb-3" style={{ color: sensor1Config?.color }}>
                {sensor1Config?.label} Statistics
              </h3>
              
              {displayData?.rawData?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-sm text-cyan-400">Minimum</div>
                    <div className="text-white text-lg">
                      {Math.min(...displayData.rawData.map(d => parseFloat(d[sensor1]))).toFixed(2)}{sensor1Config?.unit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-cyan-400">Maximum</div>
                    <div className="text-white text-lg">
                      {Math.max(...displayData.rawData.map(d => parseFloat(d[sensor1]))).toFixed(2)}{sensor1Config?.unit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-cyan-400">Average</div>
                    <div className="text-white text-lg">
                      {(displayData.rawData.reduce((sum, d) => sum + parseFloat(d[sensor1]), 0) / displayData.rawData.length).toFixed(2)}{sensor1Config?.unit}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sensor 2 Stats */}
            <div className="bg-gray-800 p-4 rounded border border-cyan-500">
              <h3 className="text-lg font-semibold mb-3" style={{ color: sensor2Config?.color }}>
                {sensor2Config?.label} Statistics
              </h3>
              
              {displayData?.rawData?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-sm text-cyan-400">Minimum</div>
                    <div className="text-white text-lg">
                      {Math.min(...displayData.rawData.map(d => parseFloat(d[sensor2]))).toFixed(2)}{sensor2Config?.unit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-cyan-400">Maximum</div>
                    <div className="text-white text-lg">
                      {Math.max(...displayData.rawData.map(d => parseFloat(d[sensor2]))).toFixed(2)}{sensor2Config?.unit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-cyan-400">Average</div>
                    <div className="text-white text-lg">
                      {(displayData.rawData.reduce((sum, d) => sum + parseFloat(d[sensor2]), 0) / displayData.rawData.length).toFixed(2)}{sensor2Config?.unit}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96 bg-[#0f172a] border border-cyan-500 rounded-lg">
          <div className="flex items-center space-x-3 text-cyan-400">
            <RefreshCw size={24} className="animate-spin" />
            <span>Loading correlation data...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !displayData && !error && (
        <div className="flex flex-col items-center justify-center h-96 bg-[#0f172a] border border-cyan-500 rounded-lg text-center">
          <TrendingUp size={48} className="text-gray-500 mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No Data Loaded</h3>
          <p className="text-gray-500 mb-4">
            Select sensors and date range to analyze correlation
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorCorrelation;