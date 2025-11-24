import React from "react";
import SensorMapView from "../components/SensorMapView";

const MapViewPanel = () => {
  return (
    <div className="w-full h-full bg-gray-900 flex flex-col items-center">
      
      {/* Optional: terminal-style header (remove if not needed) */}
      {/* ... your terminal header here if using ... */}

      {/* Sensor Map - fixed size, do not touch */}
      <SensorMapView />

      {/* 👇 Your new image BELOW the map 
            <div className="mt-6">
        <img
          src="https://res.cloudinary.com/dkoqcp1g9/image/upload/v1750620348/structure1_mhobqe.jpg" // replace with your image URL
          alt="Bridge Footer Visual"
          className="w-[1024px] h-auto rounded-lg border border-cyan-500"
        />
      </div>
      */}
    </div>
  );
};

export default MapViewPanel;
