import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { ArrowLeft } from "lucide-react";

// Import the separated components
import CustomDataGraph from './CustomDataGraph';
import ComparisonGraph from './ComparisonGraph';

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  zoomPlugin
);

const CustomDateRangeViewer = ({ sensorType = "temperature", onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="bg-[#0f172a] border border-cyan-500 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Daily View</span>
          </button>
          
          <h1 className="text-2xl font-bold text-cyan-400 text-center flex-1">
            Custom Date Range & Comparison Analysis
          </h1>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
        
        <div className="text-center text-gray-400">
          <p className="mb-2">
            Analyze sensor data across custom date ranges and compare multiple time periods
          </p>
          <p className="text-sm">
            Use the sections below to load main data and add comparison datasets for detailed analysis
          </p>
        </div>
      </div>

      {/* Custom Data Graph Section */}
      <div className="mb-6">
        <CustomDataGraph sensorType={sensorType} />
      </div>

      {/* Comparison Graph Section */}
      <div className="mb-6">
        <ComparisonGraph sensorType={sensorType} />
      </div>

      {/* Chart Instructions */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <h4 className="text-cyan-400 font-semibold mb-2">Chart Controls & Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-purple-400 font-medium mb-2">Main Chart Controls</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Use mouse wheel to zoom in/out on the chart</li>
              <li>• Click and drag to pan across the timeline</li>
              <li>• Hover over data points for detailed information</li>
              <li>• Double-click to reset zoom level</li>
              <li>• Use Download CSV button to export main data</li>
              <li>• Use Filter Values to show only specific value ranges</li>
            </ul>
          </div>
          <div>
            <h5 className="text-purple-400 font-medium mb-2">Comparison Features</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Add up to 15 different date ranges for comparison</li>
              <li>• Choose custom colors for each comparison line</li>
              <li>• Intersection points show blended colors where lines meet</li>
              <li>• Click the X button to remove any comparison</li>
              <li>• Use Download Report to get detailed comparison statistics</li>
              <li>• Statistics show average, max, min values for each range</li>
              <li>• Hover over intersection points for detailed information</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700 rounded border border-cyan-500">
          <h5 className="text-cyan-400 font-medium mb-2">Usage Tips</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <ul className="space-y-1">
              <li>• Start by loading your main dataset using the Custom Data Graph section</li>
              <li>• Use quick presets for common date ranges (24h, 7 days, this month)</li>
              <li>• Apply value filters to focus on specific data ranges</li>
              <li>• Export main data as CSV for external analysis</li>
            </ul>
            <ul className="space-y-1">
              <li>• Add comparison ranges to analyze trends over time</li>
              <li>• Use different colors to distinguish between datasets</li>
              <li>• Look for intersection points to identify crossing trends</li>
              <li>• Download comparison reports for comprehensive analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDateRangeViewer;