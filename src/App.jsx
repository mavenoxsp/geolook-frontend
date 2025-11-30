// File: client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Layout from "./components/Layout";

// Panels
import DashboardPanel from "./Panels/DashboardPanel";
import SettingsPanel from "./Panels/SettingsPanel";
import AlertsPanel from "./Panels/AlertsPanel";
import SensorPanel from "./Panels/SensorPanel";
import AnalyticsPanel from "./Panels/AnalyticsPanel";
import MapViewPanel from "./Panels/MapViewPanel";
import MaintenancePanel from "./Panels/MaintenancePanel";
import EnvDataPanel from "./Panels/EnvDataPanel";

import { useEffect, useState } from "react";
import SensorCorrelation from "./components/Graphs/SensorCorrelation";
import ReportGenerator from "./components/ReportGenerator";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("https://api.geolook.in/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setUser(data.name);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null; // Or a spinner

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth route */}
        <Route
          path="/register"
          element={!user ? <Register setUser={setUser} /> : <Navigate to="/" replace />}
        />

        {/* Protected routes with Layout */}
        {user && (
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPanel />} />
            <Route path="/settings" element={<SettingsPanel />} />
            <Route path="/alerts" element={<AlertsPanel />} />
            <Route path="/sensors" element={<SensorPanel />} />
            <Route path="/analytics" element={<AnalyticsPanel />} />
            <Route path="/map" element={<MapViewPanel />} />
            <Route path="/maintenance" element={<MaintenancePanel />} />
            <Route path="/env-data" element={<EnvDataPanel />} />
            <Route path="/cor" element={<SensorCorrelation />} />
            <Route path="/report" element={<ReportGenerator />} />
          </Route>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/" : "/register"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
