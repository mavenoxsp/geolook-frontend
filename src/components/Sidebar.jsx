import React, { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Database,
  Map,
  Calendar,
  ThermometerSun,
  Settings,
  Menu,
  X,
  LogOut,
  BarChart3,
  FileText,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import LogoutAlert from "./AlertBoxCompos/LogoutAlert";

const Sidebar = ({ onHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const menuItems = [
    { path: "/", label: "DASHBOARD", icon: <LayoutDashboard size={18} /> },
    { path: "/analytics", label: "ANALYTICS", icon: <Activity size={18} /> },
    { path: "/alerts", label: "ALERTS", icon: <AlertTriangle size={18} /> },
    { path: "/sensors", label: "SENSORS", icon: <Database size={18} /> },
    { path: "/map", label: "MAP VIEW", icon: <Map size={18} /> },
    { path: "/maintenance", label: "MAINTENANCE", icon: <Calendar size={18} /> },
    { path: "/env-data", label: "ENV DATA", icon: <ThermometerSun size={18} /> },
    { path: "/cor", label: "CORRELATION", icon: <BarChart3 size={18} /> },
    { path: "/report", label: "REPORTS", icon: <FileText size={18} /> },
    { path: "/settings", label: "SETTINGS", icon: <Settings size={18} /> },
  ];

  const handleHover = (state) => {
    setIsHovered(state);
    onHover?.(state);
  };

  const handleLogout = () => setShowAlert(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  const cancelLogout = () => setShowAlert(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-green-800 bg-gray-800 p-2 rounded"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed top-[3.75rem] left-0 z-40 h-[calc(100vh-3.75rem)] text-white border-r border-[#1e293b]
          transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-md bg-[#0f172a]/60`}
        style={{ width: isHovered ? "14rem" : "4rem" }}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        {/* Menu Items */}
        <div className="flex flex-col gap-1 mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"} // exact match for dashboard
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-mono rounded-md transition-all duration-200 ease-out
                ${
                  isActive
                    ? "bg-[#1e293b] text-green-400"
                    : "hover:bg-[#1e293b] hover:text-green-300 hover:-translate-y-0.5 hover:scale-[1.02] text-gray-300"
                }`
              }
            >
              {item.icon}
              {isHovered && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Footer - Logout */}
        <div className="absolute bottom-5 left-0 w-full px-4 py-3 border-t border-[#1e293b] text-xs font-mono">
          {!isHovered ? (
            <div
              className="flex justify-center text-red-500 transition-transform duration-200 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105"
            >
              <LogOut size={20} />
              <span className="text-lg font-mono">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex lg:hidden">
          <div className="w-64 bg-[#0f172a] h-full p-4 flex flex-col justify-between text-white">
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2 py-2 text-sm font-mono rounded-md transition-all duration-200 ease-out 
                    ${
                      isActive
                        ? "bg-[#1e293b] text-green-400"
                        : "hover:bg-[#1e293b] hover:text-green-300 hover:-translate-y-0.5 hover:scale-[1.02] text-gray-300"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Logout Button - Mobile */}
            <div className="mt-6 border-t border-[#1e293b] pt-4">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105"
              >
                <LogOut size={20} />
                <span className="text-base font-mono">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutAlert
        isOpen={showAlert}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default Sidebar;