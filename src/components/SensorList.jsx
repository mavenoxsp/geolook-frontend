// components/SensorList.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSensors } from "../context/SensorContext1";
import {
    LuCircleCheck,
    LuTriangleAlert,
    LuActivity,
    LuCircleX,
} from "react-icons/lu";
import DailySensorGraph from "./DailySensorGraph";
import CustomDateRangeViewer from "../components/Graphs/CustomDateRangeViewer";

const tableSlideIn = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const rowFadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { delay, duration: 0.4, ease: "easeOut" },
    },
});

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
        bv: { safe: [12, 100], warning: [10, 12] },
    };

    const threshold = thresholds[sensorType];
    if (!threshold) return "safe";

    if (sensorType === "Strike") {
        if (Math.abs(value) <= 1) return "safe";
        if (Math.abs(value) <= 3) return "warning";
        return "critical";
    }

    if (sensorType === "bv") {
        if (value >= threshold.safe[0]) return "safe";
        if (value >= threshold.warning[0]) return "warning";
        return "critical";
    }

    if (sensorType === "press_h") {
        if (value >= threshold.safe[0] && value <= threshold.safe[1]) return "safe";
        if (value < 970 || value > 1060) return "warning";
        return "critical";
    }

    if (value >= threshold.safe[0] && value <= threshold.safe[1]) return "safe";
    if (value >= threshold.warning[0] && value <= threshold.warning[1])
        return "warning";
    return "critical";
};

const getStatusColor = (status) => {
    switch (status) {
        case "safe":
            return "#10b981";
        case "warning":
            return "#f59e0b";
        case "critical":
            return "#ef4444";
        default:
            return "#6b7280";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "safe":
            return <LuCircleCheck className="text-green-500" />;
        case "warning":
            return <LuTriangleAlert className="text-yellow-500" />;
        case "critical":
            return <LuCircleX className="text-red-500" />;
        default:
            return <LuActivity className="text-gray-500" />;
    }
};

const SensorList = () => {
    // creating a custom hook useSensors();
    const { sensors = [], metaData = {}, loading, totalSensors } = useSensors();
    console.log("sensor in the sensorList component from context are : ",sensors);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("id");
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [currentView, setCurrentView] = useState("list"); // 'list' or 'custom'
    const [selectedSensorType, setSelectedSensorType] = useState("");

    const displayNames = {
        temperature: "Temperature (°C)",
        hum: "Humidity (%)",
        ws_2: "Wind Speed (m/s)",
        wd: "Wind Direction (°)",
        press_h: "Pressure (hPa)",
        curr_rain: "Rainfall (mm)",
        max_WS: "Wind Speed[Max] (m/s)",
        VP_mbar: "Vapor Pressure (mbar)",
        tilt_NS: "Tilt NS[Long] (°)",
        tilt_WE: "Tilt WE[LAT] (°)",
        Strike: "Strike (°)",
        bv: "Battery Voltage (V)",
    };



    // Handle sensor selection
    const handleSensorClick = (sensorId) => {
        if (selectedSensor === sensorId) {
            setSelectedSensor(null);
        } else {
            setSelectedSensor(sensorId);
        }
    };

    // Handle view custom range
    const handleViewCustomRange = (sensorType) => {
        setSelectedSensorType(sensorType);
        setCurrentView("custom");
    };

    // Handle back to list view
    const handleBackToList = () => {
        setCurrentView("list");
        setSelectedSensor(null);
    };

    if (loading) {
        return (
            <p className="text-center text-gray-400">Loading sensor data...</p>
        );
    }

    // If in custom view, show the CustomDateRangeViewer
    if (currentView === "custom") {
        return (
            <div className="mt-4">
                <CustomDateRangeViewer
                    sensorType={selectedSensorType}
                    onBack={handleBackToList}
                />
            </div>
        );
    }

    // Filtering
    let filteredSensors = sensors.filter((sensor) => {
        console.log("sensors in the sensorsList component are : ",sensor);
        const name = displayNames[sensor.id] || sensor.id || "";
        console.log("name in sensorList is : ",name);
        const status = getSafetyStatus(sensor.id, Number(sensor.value));
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || statusFilter === status;
        return matchesSearch && matchesStatus;
    });

    console.log("filtered sensors are : ",filteredSensors);
    // remove wind speed max (max-ws) , strike- strike(0) , wind-direction - is wd

    const removeIds = ["max_WS", "Strike", "wd"];

    filteredSensors= filteredSensors.filter(item => !removeIds.includes(item.id));

    console.log("new filtered sensors are : ",filteredSensors);
    let newValueObj1={
        id:"Strain Gauge",
        value:"389"
    }

    let newValueObj2={
        id:"Deflection Transducer",
        value:"S232969"
    }

    filteredSensors.push(newValueObj1,newValueObj2);
    console.log("finial filetered sensors are : ",filteredSensors);

    // Sorting
    filteredSensors.sort((a, b) => {
        if (sortBy === "id") {
            return (a.id || "").localeCompare(b.id || "");
        }
        if (sortBy === "value") {
            return Number(a.value) - Number(b.value);
        }
        if (sortBy === "status") {
            const sa = getSafetyStatus(a.id, Number(a.value));
            const sb = getSafetyStatus(b.id, Number(b.value));
            return sa.localeCompare(sb);
        }
        return 0;
    });

    return (
        <div>
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <input
                    type="text"
                    placeholder="SEARCH_SENSORS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#1e293b] text-green-400 px-4 py-2 rounded w-full sm:w-1/3"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#1e293b] text-green-400 px-4 py-2 rounded w-full sm:w-1/3"
                >
                    <option value="ALL">ALL_STATUS</option>
                    <option value="safe">GOOD</option>
                    <option value="warning">WARNING</option>
                    <option value="critical">CRITICAL</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#1e293b] text-green-400 px-4 py-2 rounded w-full sm:w-1/3"
                >
                    <option value="id">Sort by ID</option>
                    <option value="value">Sort by Value</option>
                    <option value="status">Sort by Status</option>
                </select>
            </div>

            {/* Table */}
            <motion.div
                className="w-full overflow-x-auto max-w-full"
                style={{ scrollbarWidth: "thin", overflowY: "hidden" }}
                variants={tableSlideIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="min-w-full inline-block align-middle">
                    <table className="table-fixed border border-gray-700 border-collapse w-full">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="border border-gray-700 px-4 py-2 text-left w-[20%]">
                                    ID
                                </th>
                                <th className="border border-gray-700 px-4 py-2 text-left w-[20%]">
                                    Value
                                </th>
                                <th className="border border-gray-700 px-4 py-2 text-left w-[20%]">
                                    Status
                                </th>
                                <th className="border border-gray-700 px-4 py-2 text-left w-[20%]">
                                    Lastest Update
                                </th>
                                <th className="border border-gray-700 px-4 py-2 text-left w-[20%]">
                                    createdAt
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSensors.map((sensor, index) => {
                                const status = getSafetyStatus(sensor.id, Number(sensor.value));
                                const isSelected = selectedSensor === sensor.id;

                                return (
                                    <React.Fragment key={sensor.id}>
                                        <motion.tr
                                            variants={rowFadeIn(index * 0.1)}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.2 }}
                                            className={`bg-gray-900 text-white hover:bg-gray-800 cursor-pointer ${isSelected ? "bg-gray-700" : ""
                                                }`}
                                            onClick={() => handleSensorClick(sensor.id)}
                                        >
                                            <td className="border border-gray-700 px-4 py-2 font-semibold">
                                                {displayNames[sensor.id] || sensor.id}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-2 text-purple-400">
                                                {sensor.value}
                                            </td>
                                            <td
                                                className="border border-gray-700 px-4 py-2 items-center gap-2"
                                                style={{ color: getStatusColor(status) }}
                                            >
                                                {status.toUpperCase()}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-2 text-gray-400">
                                                {metaData.ts_server || "N/A"}
                                            </td>
                                            <td className="border border-gray-700 px-4 py-2 text-gray-400">
                                                {metaData.createdAt
                                                    ? new Date(metaData.createdAt).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                        </motion.tr>

                                        {/* Show graph for selected sensor */}
                                        {isSelected && (
                                            <tr>
                                                <td colSpan="5" className="p-4 bg-gray-800">
                                                    <DailySensorGraph
                                                        sensorType={sensor.id}
                                                        onViewCustomRange={handleViewCustomRange}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <p className="mt-4 text-xs text-gray-500">
                Total sensors: {totalSensors || sensors.length}
            </p>
        </div>
    );
};

export default SensorList;