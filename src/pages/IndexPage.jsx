import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import SettingsPanel from "../Panels/SettingsPanel";
import AlertsPanel from "../Panels/AlertsPanel";
import SensorPanel from "../Panels/SensorPanel";
import AnalyticsPanel from "../Panels/AnalyticsPanel";
import MapViewPanel from "../Panels/MapViewPanel";
import MaintenancePanel from "../Panels/MaintenancePanel";
import EnvDataPanel from "../Panels/EnvDataPanel";
import DashboardPanel from "../Panels/DashboardPanel";
import { Activity, Moon } from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const IndexPage = () => {
  const [currentTab, setCurrentTab] = useState("Dashboard");
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="relative h-screen w-screen overflow-hidden bg-[#0f172a] text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-4 z-30 bg-[#0f172a] border-b border-green-800 px-6 py-4">
        <div className="relative flex items-center justify-center sm:justify-between gap-2">
          <div className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:translate-x-0">
            <img
              src="https://res.cloudinary.com/dkoqcp1g9/image/upload/v1750591433/Geolook-Logo_wyuybf.png"
              alt="Logo"
              className="h-5 w-auto"
            />
          </div>
          <div className="hidden sm:flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">System Status</p>
              <Activity className="text-green-400" size={16} />
              <p className="text-green-400 text-sm">OPERATIONAL</p>
              <button className="ml-2 p-1 rounded bg-[#1e293b]">
                <Moon size={16} className="text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        onHover={setSidebarHovered}
      />

      {/* Main Content Area */}
      <div className="absolute top-0 bottom-0 right-0 left-0 overflow-y-auto z-10 bg-gray-900">
        <div
          className={`
            pt-[3.75rem] px-6 
            ${"lg:ml-15"}  /* default content shift for collapsed sidebar */
          `}
        >
          {/* Panels */}
          {currentTab === "Settings" ? (
            <SettingsPanel />
          ) : currentTab === "Alerts" ? (
            <AlertsPanel />
          ) : currentTab === "Sensors" ? (
            <SensorPanel />
          ) : currentTab === "Analytics" ? (
            <AnalyticsPanel />
          ) : currentTab === "Map_View" ? (
            <MapViewPanel />
          ) : currentTab === "Maintenance" ? (
            <MaintenancePanel />
          ) : currentTab === "Env_Data" ? (
            <EnvDataPanel />
          ) : currentTab === "Dashboard" ? (
            <DashboardPanel />
          ) : (
            <div className="text-xl text-center py-10">{currentTab} is open</div>
          )}

          {/* Footer Info 
                    <div className="mt-8 px-6 py-2 border-t border-green-500 text-xs font-mono text-gray-400">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p>Last update: 2025-06-20T08:27:23.629Z</p>
              <p className="text-green-400">Active sensors: 12/12</p>
            </div>
          </div>
          
          */}
        </div>
      </div>
    </div>
    </>

  );
};

export default IndexPage;
