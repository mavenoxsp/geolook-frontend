import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, AlertOctagon, Eye, EyeOff, RefreshCw, Filter, X, Calendar, Clock, Thermometer, Droplets, Wind, Gauge, CloudRain, Zap, Battery, Navigation, Activity } from "lucide-react";
import axios from "../../utils/axios";

const AlertItemList = () => {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, warning: 0, notice: 0, active: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    level: 'all',
    hours: 24,
    limit: 100
  });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch alerts from API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'all' && value !== '') {
          params.append(key, value);
        }
      });

      console.log('Fetching alerts with params:', params.toString());
      
      const response = await axios.get(`/api/sensors/alerts?${params.toString()}`, {
        timeout: 10000
      });

      console.log('API Response:', response.data);

      setAlerts(response.data.alerts || []);
      setSummary(response.data.summary || { total: 0, critical: 0, warning: 0, notice: 0, active: 0, resolved: 0 });
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchAlerts();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAlerts();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [filters, autoRefresh]);

  // Get icon for alert level
  const getAlertIcon = (level, size = 18) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertOctagon className="text-red-400" size={size} />;
      case 'WARNING':
        return <AlertTriangle className="text-yellow-400" size={size} />;
      case 'NOTICE':
        return <Bell className="text-cyan-400" size={size} />;
      default:
        return <Bell className="text-gray-400" size={size} />;
    }
  };

  // Get colors for alert level
  const getAlertColors = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-900/20' };
      case 'WARNING':
        return { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-900/20' };
      case 'NOTICE':
        return { border: 'border-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-900/20' };
      default:
        return { border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-900/20' };
    }
  };

  // Get sensor icon
  const getSensorIcon = (sensorType, size = 16) => {
    const iconMap = {
      temperature: <Thermometer size={size} />,
      hum: <Droplets size={size} />,
      ws_2: <Wind size={size} />,
      wd: <Navigation size={size} />,
      press_h: <Gauge size={size} />,
      curr_rain: <CloudRain size={size} />,
      max_WS: <Wind size={size} />,
      VP_mbar: <Gauge size={size} />,
      tilt_NS: <Activity size={size} />,
      tilt_WE: <Activity size={size} />,
      Strike: <Zap size={size} />,
      bv: <Battery size={size} />
    };
    return iconMap[sensorType] || <Activity size={size} />;
  };

  // Animation variants
  const slideIn = (delay = 0) => ({
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.5, ease: "easeOut" },
    },
  });

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      level: 'all', 
      hours: 24,
      limit: 100
    });
  };

  // Alert item component
  const AlertItem = ({ alert, index }) => {
    const colors = getAlertColors(alert.level);
    
    return (
      <motion.div
        variants={slideIn(0.1 + index * 0.05)}
        initial="hidden"
        animate="visible"
        className={`flex items-start gap-3 border-l-4 pl-4 py-3 px-2 sm:px-4 rounded hover:bg-[#1a2332] transition-all duration-200 cursor-pointer ${colors.border} ${colors.bg}`}
        onClick={() => setSelectedAlert(alert)}
      >
        <div className="pt-1 shrink-0 flex items-center gap-2">
          {getAlertIcon(alert.level)}
          {getSensorIcon(alert.sensorType)}
        </div>
        <div className="w-full">
          <p className={`font-semibold text-sm sm:text-base ${colors.text}`}>
            [{alert.level}] <span className="text-white font-normal">{alert.message}</span>
          </p>
          <div className="text-xs text-gray-400 mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {alert.timestamp}
            </span>
            <span className={`mt-1 sm:mt-0 ${colors.text} flex items-center gap-1`}>
              <Activity size={12} />
              Status: {alert.status}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar size={12} />
              {alert.fullTimestamp}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-300">
            <span className="font-medium">{alert.sensorType.toUpperCase()}:</span> {alert.value}{alert.unit}
            {alert.reason && <span className="ml-2 text-gray-400">- {alert.reason}</span>}
          </div>
        </div>
      </motion.div>
    );
  };

  // Detailed Alert Modal
  const AlertModal = ({ alert, onClose }) => {
    if (!alert) return null;

    const colors = getAlertColors(alert.level);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-green-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${colors.border} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {getAlertIcon(alert.level, 24)}
                {getSensorIcon(alert.sensorType, 20)}
                <h2 className={`text-xl font-bold ${colors.text}`}>
                  {alert.level} ALERT REPORT
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Alert Summary */}
            <div className="px-6 py-4 bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Alert Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sensor:</span>
                      <span className="text-white font-medium">{alert.report?.sensorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Value:</span>
                      <span className={`font-bold ${colors.text}`}>{alert.report?.currentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Safe Range:</span>
                      <span className="text-green-400">{alert.report?.safeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Warning Range:</span>
                      <span className="text-yellow-400">{alert.report?.warningRange}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Alert Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Priority:</span>
                      <span className={`font-bold ${colors.text}`}>{alert.report?.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={alert.status === 'ACTIVE' ? 'text-red-400' : 'text-yellow-400'}>
                        {alert.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">First Detected:</span>
                      <span className="text-white">{alert.report?.firstDetected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{alert.report?.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Report */}
            <div className="px-6 py-4 space-y-6">
              {/* Issue Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Issue Description
                </h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-300 mb-2">{alert.report?.reason}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-sm text-gray-400">Sensor Type:</span>
                      <p className="text-white font-medium">{alert.report?.sensorType?.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Impact Level:</span>
                      <p className={`font-medium ${colors.text}`}>{alert.report?.impact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Activity size={18} />
                  Recommended Actions
                </h3>
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <p className="text-green-300">{alert.report?.recommendation}</p>
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Gauge size={18} />
                  Technical Details
                </h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Alert ID:</span>
                      <p className="text-white font-mono text-xs mt-1 break-all">{alert.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Timestamp:</span>
                      <p className="text-white">{alert.fullTimestamp}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Priority:</span>
                      <p className={`font-bold ${colors.text}`}>{alert.report?.priority}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Alert Timeline
                </h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">Alert Triggered</p>
                        <p className="text-sm text-gray-400">{alert.fullTimestamp} - {alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${alert.status === 'ACTIVE' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="text-white font-medium">Current Status</p>
                        <p className="text-sm text-gray-400">{alert.status} - Monitoring in progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close Report
              </button>
              <button
                className={`px-4 py-2 ${colors.bg} ${colors.text} border ${colors.border} rounded-lg hover:opacity-80 transition-opacity`}
              >
                Mark as Acknowledged
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn()}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text uppercase">
                Alert System
              </h1>
              <p className="text-gray-400 mt-2">Real-time sensor monitoring and alert management</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  autoRefresh 
                    ? 'bg-green-900/20 border-green-500 text-green-400' 
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                }`}
              >
                {autoRefresh ? <EyeOff size={16} /> : <Eye size={16} />}
                Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(0.1)}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <div className="bg-gray-900 border border-red-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{summary.critical}</div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{summary.warning}</div>
            <div className="text-sm text-gray-400">Warning</div>
          </div>
          <div className="bg-gray-900 border border-cyan-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{summary.notice}</div>
            <div className="text-sm text-gray-400">Notice</div>
          </div>
          <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{summary.active}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-900 border border-gray-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{summary.resolved}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-900 border border-blue-500 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(0.2)}
          className="bg-gray-900 border border-green-700 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Alert Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="all">All Levels</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="notice">Notice</option>
              </select>
            </div>
            
            {/*
                        <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            */}
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Time Range (Hours)</label>
              <select
                value={filters.hours}
                onChange={(e) => handleFilterChange('hours', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value={1}>Last Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={48}>Last 48 Hours</option>
                <option value={168}>Last Week</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value={25}>25 alerts</option>
                <option value={50}>50 alerts</option>
                <option value={100}>100 alerts</option>
                <option value={200}>200 alerts</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(0.3)}
          className="bg-gray-900 border border-green-700 rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-6 border-b border-green-500 bg-gray-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text uppercase">
              Active Alerts
            </h2>
            <div className="text-sm px-4 py-1 rounded-full border border-red-500 text-red-400 font-semibold bg-red-900/20 w-fit mx-auto sm:mx-0">
              {summary.active} ACTIVE_THREATS
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="animate-spin text-green-400" size={32} />
                <span className="ml-3 text-gray-400">Loading alerts...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <AlertTriangle className="text-red-400" size={32} />
                <span className="ml-3 text-red-400">Error: {error}</span>
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Bell className="text-gray-400" size={32} />
                <span className="ml-3 text-gray-400">No alerts found</span>
              </div>
            ) : (
              <div className="space-y-4 px-4 py-5 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {alerts.map((alert, index) => (
                  <AlertItem key={alert.id} alert={alert} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-green-500 text-xs text-gray-400 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-900">
            <p>Last updated: {lastUpdated}</p>
            <p className="text-green-400 mt-1 sm:mt-0">Alert system status: ACTIVE</p>
          </div>
        </motion.div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <AlertModal 
            alert={selectedAlert} 
            onClose={() => setSelectedAlert(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default AlertItemList;