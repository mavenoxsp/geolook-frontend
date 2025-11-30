import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Plus, Trash2, Edit, Save, X, Moon, 
  Thermometer, Droplets, Wind, Gauge, CloudRain, 
  Zap, Battery, Activity, Settings, Mail, Clock,
  Filter, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Calendar, Power, PowerOff
} from "lucide-react";

const SystemSettings = () => {
  const [notifications, setNotifications] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sensorType: "temperature",
    condition: "above",
    threshold: "",
    cooldownMinutes: 5
  });
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const sensorOptions = [
  { value: "temperature", label: "Temperature", unit: "°C", icon: <Thermometer size={16} />, color: "text-red-400" },
  { value: "hum", label: "Humidity", unit: "%", icon: <Droplets size={16} />, color: "text-blue-400" },
  { value: "ws_2", label: "Wind Speed", unit: "m/s", icon: <Wind size={16} />, color: "text-cyan-400" },
  { value: "wd", label: "Wind Direction", unit: "°", icon: <Wind size={16} />, color: "text-cyan-300" },
  { value: "press_h", label: "Pressure", unit: "mbar", icon: <Gauge size={16} />, color: "text-purple-400" },
  { value: "curr_rain", label: "Rainfall", unit: "mm", icon: <CloudRain size={16} />, color: "text-blue-300" },
  { value: "max_WS", label: "Max Wind Speed", unit: "m/s", icon: <Wind size={16} />, color: "text-cyan-300" },
  { value: "VP_mbar", label: "Vapor Pressure", unit: "mbar", icon: <Gauge size={16} />, color: "text-indigo-400" },
  { value: "tilt_NS", label: "Tilt NS", unit: "°", icon: <Activity size={16} />, color: "text-yellow-400" },
  { value: "tilt_WE", label: "Tilt WE", unit: "°", icon: <Activity size={16} />, color: "text-yellow-300" },
  { value: "Strike", label: "Strike", unit: "", icon: <Zap size={16} />, color: "text-orange-400" },
  { value: "bv", label: "Battery Voltage", unit: "V", icon: <Battery size={16} />, color: "text-green-400" }
];

// Update recommended values for all sensors
const recommendedValues = {
  temperature: {
    above: { warning: 35, danger: 40 },
    below: { warning: 5, danger: 0 }
  },
  hum: {
    above: { warning: 80, danger: 90 },
    below: { warning: 20, danger: 10 }
  },
  ws_2: {
    above: { warning: 15, danger: 25 },
    below: { warning: 2, danger: 1 }
  },
  wd: {
    above: { warning: 300, danger: 350 },
    below: { warning: 30, danger: 10 }
  },
  press_h: {
    above: { warning: 1050, danger: 1070 },
    below: { warning: 980, danger: 960 }
  },
  curr_rain: {
    above: { warning: 10, danger: 20 },
    below: { warning: 1, danger: 0 }
  },
  max_WS: {
    above: { warning: 20, danger: 30 },
    below: { warning: 3, danger: 1 }
  },
  VP_mbar: {
    above: { warning: 25, danger: 30 },
    below: { warning: 5, danger: 2 }
  },
  tilt_NS: {
    above: { warning: 30, danger: 45 },
    below: { warning: -30, danger: -45 }
  },
  tilt_WE: {
    above: { warning: 30, danger: 45 },
    below: { warning: -30, danger: -45 }
  },
  Strike: {
    above: { warning: 1, danger: 5 },
    below: { warning: -1, danger: -5 }
  },
  bv: {
    above: { warning: 14.5, danger: 15 },
    below: { warning: 11.5, danger: 11 }
  }
};

  // API Base URL - adjust according to your backend
  const API_BASE_URL = "https://api.geolook.in/api";

  // Get auth token from localStorage with validation
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (!token) {
      return null;
    }
    
    return token;
  };

  // API request helper - FIXED VERSION
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    // Create headers object properly
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add Authorization header only if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      headers,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Unauthorized - Please login again');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const data = await apiRequest("/sensors/notifications");
      setNotifications(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(`Failed to fetch notifications: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        ...formData,
        threshold: parseFloat(formData.threshold),
        cooldownMinutes: parseInt(formData.cooldownMinutes)
      };

      const newNotification = await apiRequest("/sensors/notifications", {
        method: 'POST',
        body: payload
      });

      setNotifications(prev => [newNotification, ...prev]);
      setIsAdding(false);
      setFormData({
        sensorType: "temperature",
        condition: "above",
        threshold: "",
        cooldownMinutes: 5
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(`Failed to create notification: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await apiRequest(`/sensors/notifications/${id}`, {
        method: 'DELETE'
      });
      
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(`Failed to delete notification: ${error.message}`);
      }
    }
  };

  const handleEdit = (notification) => {
    setEditingId(notification._id);
    setEditData({
      threshold: notification.threshold,
      cooldownMinutes: notification.cooldownMinutes,
      isActive: notification.isActive
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      setError(null);
      
      const payload = {
        ...editData,
        threshold: parseFloat(editData.threshold),
        cooldownMinutes: parseInt(editData.cooldownMinutes)
      };

      const updatedNotification = await apiRequest(`/sensors/notifications/${id}`, {
        method: 'PUT',
        body: payload
      });

      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, ...updatedNotification } : n
      ));
      
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating notification:", error);
      if (error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(`Failed to update notification: ${error.message}`);
      }
    }
  };

  const toggleNotificationStatus = async (id, currentStatus) => {
    try {
      setError(null);
      
      const updatedNotification = await apiRequest(`/sensors/notifications/${id}`, {
        method: 'PUT',
        body: { isActive: !currentStatus }
      });

      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, isActive: !currentStatus } : n
      ));
    } catch (error) {
      console.error("Error toggling notification status:", error);
      if (error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(`Failed to toggle notification: ${error.message}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const getSensorConfig = (type) => {
    return sensorOptions.find(opt => opt.value === type) || {
      icon: <Activity size={16} />,
      label: type,
      unit: "",
      color: "text-gray-400"
    };
  };

  const getConditionColor = (condition) => {
    return condition === "above" ? "text-red-400" : "text-blue-400";
  };

  const formatLastTriggered = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "active") return notification.isActive;
    if (filter === "inactive") return !notification.isActive;
    return true;
  });

  const slideIn = (delay = 0) => ({
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.5, ease: "easeOut" },
    },
  });

  const RecommendationBadge = ({ sensorType, condition }) => {
    const recommendations = recommendedValues[sensorType];
    if (!recommendations) return null;
    
    const rec = recommendations[condition];
    const unit = sensorOptions.find(s => s.value === sensorType)?.unit || "";
    
    return (
      <div className="mt-2 p-2 bg-gray-800 rounded-lg text-xs">
        <p className="text-gray-400 mb-1">Recommended {condition} values:</p>
        <div className="flex gap-2">
          <span className="text-yellow-400">Warning: {rec.warning}{unit}</span>
          <span className="text-red-400">Danger: {rec.danger}{unit}</span>
        </div>
      </div>
    );
  };

  const NotificationCard = ({ notification, index }) => {
    const sensorConfig = getSensorConfig(notification.sensorType);
    const isEditing = editingId === notification._id;

    return (
      <motion.div
        layout
        variants={slideIn(0.05 + index * 0.02)}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-2xl group ${
          notification.isActive 
            ? 'border-green-500/30 bg-gradient-to-br from-green-900/10 to-gray-900/50 hover:border-green-400/50' 
            : 'border-gray-600/30 bg-gradient-to-br from-gray-800/10 to-gray-900/50 hover:border-gray-500/50'
        }`}
      >
        <div className={`absolute top-0 left-0 w-full h-1 ${
          notification.isActive ? 'bg-green-500' : 'bg-gray-500'
        }`} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${notification.isActive ? 'bg-green-500/20' : 'bg-gray-600/20'}`}>
                <span className={sensorConfig.color}>
                  {sensorConfig.icon}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {sensorConfig.label}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className={`font-medium ${getConditionColor(notification.condition)}`}>
                    {notification.condition.toUpperCase()}
                  </span>
                  <span className="text-white font-bold">
                    {notification.threshold} {sensorConfig.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleNotificationStatus(notification._id, notification.isActive)}
                className={`p-2 rounded-full transition-colors ${
                  notification.isActive 
                    ? 'text-green-400 hover:bg-green-500/20' 
                    : 'text-gray-400 hover:bg-gray-600/20'
                }`}
                title={notification.isActive ? 'Disable notification' : 'Enable notification'}
              >
                {notification.isActive ? <Power size={18} /> : <PowerOff size={18} />}
              </button>
              
              {!isEditing && (
                <>
                  <button
                    onClick={() => handleEdit(notification)}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editData.threshold}
                    onChange={(e) => setEditData({ ...editData, threshold: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  />
                  <RecommendationBadge 
                    sensorType={notification.sensorType} 
                    condition={notification.condition} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cooldown (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editData.cooldownMinutes}
                    onChange={(e) => setEditData({ ...editData, cooldownMinutes: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(notification._id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={14} />
                  <span>{notification.email}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-300">
                  <Clock size={14} />
                  <span>Cooldown: {notification.cooldownMinutes}min</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-400">Last triggered:</span>
                  <span className={`text-sm font-medium ${
                    notification.lastTriggered ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {formatLastTriggered(notification.lastTriggered)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {notification.isActive ? (
                    <>
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-400">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Error Alert Component
  const ErrorAlert = ({ error, onDismiss }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-400" size={20} />
        <div>
          <p className="text-red-400 font-medium">Error</p>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 transition-colors"
      >
        <X size={20} />
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn()}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white via-green-300 to-blue-300 text-transparent bg-clip-text uppercase tracking-tight">
                Notification Center
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Configure sensor alert thresholds and manage notifications</p>
              {lastUpdated && (
                <p className="text-sm text-green-400 mt-1">Last updated: {lastUpdated}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-blue-400 focus:outline-none"
                >
                  <option value="all">All Notifications</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <ErrorAlert error={error} onDismiss={() => setError(null)} />
          )}
        </AnimatePresence>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(0.1)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-green-900/20 to-gray-900 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-white">{notifications.filter(n => n.isActive).length}</p>
                <p className="text-green-400 text-sm">Active Notifications</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/20 to-gray-900 border border-gray-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <XCircle className="text-gray-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-white">{notifications.filter(n => !n.isActive).length}</p>
                <p className="text-gray-400 text-sm">Inactive Notifications</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
                <p className="text-blue-400 text-sm">Total Notifications</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(0.2)}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-green-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Plus size={20} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold">Create New Notification</h3>
          </div>
          
          <AnimatePresence>
            {isAdding ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sensor Type</label>
                    <select
                      value={formData.sensorType}
                      onChange={(e) => setFormData({ ...formData, sensorType: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                      required
                    >
                      {sensorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                      required
                    >
                      <option value="above">Above Threshold</option>
                      <option value="below">Below Threshold</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Threshold Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                      placeholder="Enter threshold value"
                      required
                    />
                    <RecommendationBadge 
                      sensorType={formData.sensorType} 
                      condition={formData.condition} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cooldown Period (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.cooldownMinutes}
                      onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {submitting ? 'Creating...' : 'Create Notification'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg flex items-center gap-2 hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
              >
                <Plus size={20} />
                <span className="font-medium">Add New Notification Rule</span>
              </button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(0.3)}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="animate-spin text-green-400" size={32} />
              <span className="ml-3 text-gray-400 text-lg">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filter === "all" 
                  ? "Create your first notification rule to get started."
                  : `No ${filter} notifications found. Try adjusting your filters.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">
                {filter === "all" 
                  ? `All Notifications (${filteredNotifications.length})`
                  : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Notifications (${filteredNotifications.length})`
                }
              </h2>
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <NotificationCard 
                    key={notification._id} 
                    notification={notification} 
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SystemSettings;