// components/ActiveSensors.jsx
export default function ActiveSensors() {
  return (
    <div className="bg-gray-900 p-5 rounded-md text-green-400 font-mono w-full h-60 border border-green-800">
      {/* Header */}
      <div className="text-white text-lg font-bold mb-1 flex items-center gap-2">
        <span className="text-green-400">$</span> ACTIVE_SENSORS
      </div>

      {/* Divider */}
      <div className="border-b border-green-800 mb-4"></div>

      {/* Content */}
      <div className="text-3xl font-bold">13/13</div>
      <div className="flex items-center gap-2 mt-4 text-base">
        <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
        100% OPERATIONAL
      </div>
    </div>
  );
}
