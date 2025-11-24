import React, { useState } from 'react';
import axios from '../utils/axios';

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSensors, setSelectedSensors] = useState([]);

  // Available sensors with their display names
  const sensorOptions = [
    { id: 'temperature', name: 'Temperature' },
    { id: 'hum', name: 'Humidity' },
    { id: 'ws_2', name: 'Wind Speed' },
    { id: 'wd', name: 'Wind Direction' },
    { id: 'press_h', name: 'Pressure' },
    { id: 'curr_rain', name: 'Current Rain' },
    { id: 'max_WS', name: 'Max Wind Speed' },
    { id: 'VP_mbar', name: 'Vapor Pressure' },
    { id: 'tilt_NS', name: 'Tilt N-S' },
    { id: 'tilt_WE', name: 'Tilt W-E' },
    { id: 'Strike', name: 'Structural Stress' },
    { id: 'bv', name: 'Battery Voltage' }
  ];

  const handleSensorToggle = (sensorId) => {
    if (selectedSensors.includes(sensorId)) {
      setSelectedSensors(selectedSensors.filter(id => id !== sensorId));
    } else {
      setSelectedSensors([...selectedSensors, sensorId]);
    }
  };

  const selectAllSensors = () => {
    setSelectedSensors(sensorOptions.map(sensor => sensor.id));
  };

  const clearAllSensors = () => {
    setSelectedSensors([]);
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (selectedSensors.length === 0) {
      setError('Please select at least one sensor');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/generate-report', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
        sensors: selectedSensors
      }, {
        responseType: 'blob' // Important for handling PDF files
      });
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generate filename with dates
      const filename = `Structural_Health_Report_${startDate}_to_${endDate}.pdf`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSuccess('Report downloaded successfully!');
      
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No data found for the selected date range');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate report. Please try again.');
      }
      console.error('Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Alternative method using the link generation endpoint
  const handleGenerateReportLink = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (selectedSensors.length === 0) {
      setError('Please select at least one sensor');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/generate-report-link', {
        startDate: `${startDate} 00:00:00`,
        endDate: `${endDate} 23:59:59`,
        sensors: selectedSensors
      });
      
      // Create download link from the response
      const downloadUrl = `${response.data.downloadUrl}`;
      
      // Open download in new tab
      window.open(downloadUrl, '_blank');
      
      setSuccess('Report generation started! Check your downloads.');
      
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No data found for the selected date range');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate report. Please try again.');
      }
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-md border-1 border-green-400 mt-5">
      <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
        Structural Health Monitoring Report Generator
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-200 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-200 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
        </div>
        
        {/* Sensor Selection Section */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-200">
              Select Sensors for Report
            </label>
            <div className="flex space-x-2">
              <button
                onClick={selectAllSensors}
                className="text-xs bg-gray-700 text-white py-1 px-2 rounded hover:bg-gray-600 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAllSensors}
                className="text-xs bg-gray-700 text-white py-1 px-2 rounded hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-gray-800 rounded-lg">
            {sensorOptions.map((sensor) => (
              <div key={sensor.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={sensor.id}
                  checked={selectedSensors.includes(sensor.id)}
                  onChange={() => handleSensorToggle(sensor.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={sensor.id} className="ml-2 block text-sm text-gray-200">
                  {sensor.name}
                </label>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            {selectedSensors.length === 0 
              ? "No sensors selected" 
              : `Selected: ${selectedSensors.length} sensor${selectedSensors.length !== 1 ? 's' : ''}`
            }
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            onClick={handleGenerateReport} 
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </span>
            ) : (
              'Download PDF Report'
            )}
          </button>
          
          <button 
            onClick={handleGenerateReportLink} 
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate & View Link
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error: </strong>{error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <strong>Success: </strong>{success}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-900 rounded-md border border-green-400">
        <h3 className="font-semibold text-white mb-2">Instructions:</h3>
        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
          <li>Select a start and end date for the report period</li>
          <li>Choose one or more sensors to include in the report</li>
          <li>Use "Select All" to include all sensors or "Clear All" to reset</li>
          <li>Click "Download PDF Report" to get the report immediately</li>
          <li>Or use "Generate & View Link" for alternative download method</li>
          <li>The report will be downloaded as a PDF file</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportGenerator;