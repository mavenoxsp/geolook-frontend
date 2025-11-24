import React, { useEffect, useState } from 'react';
import {
  CircularProgressbarWithChildren,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FiWifi } from 'react-icons/fi';

const AcousticEmission = () => {
  const [dbLevel, setDbLevel] = useState(84.7);
  const [energy, setEnergy] = useState(44.86);
  const [frequency, setFrequency] = useState(245);

  useEffect(() => {
    const interval = setInterval(() => {
      setDbLevel(parseFloat((Math.random() * 100).toFixed(1)));
      setEnergy(parseFloat((Math.random() * 50).toFixed(2)));
      setFrequency(Math.floor(Math.random() * 500) + 100);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm xl:max-w-md h-80 bg-gray-900 rounded-2xl shadow-md p-4 flex flex-col items-center font-mono text-white mx-auto border-1 border-green-800">
      {/* Header */}
      <div className="w-full text-lg tracking-wide text-center">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
          <FiWifi className="text-xl" /> ACOUSTIC_EMISSION
        </div>
        <hr className="border-t border-green-800 mt-1" />
      </div>

      {/* Circular Progress */}
      <div className="w-44 h-44 mt-4">
        <CircularProgressbarWithChildren
          value={dbLevel}
          maxValue={100}
          styles={buildStyles({
            pathColor: '#ff6b6b',
            trailColor: '#2b2b40',
            strokeLinecap: 'round',
          })}
        >
          <div className="text-3xl text-[#ff6b6b] font-semibold">
            {dbLevel.toFixed(1)} <span className="text-base">dB</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      {/* Frequency and Energy */}
      <div className="flex items-center justify-between w-full mt-4 px-2 text-sm">
        <div className="text-[#ff6b6b] tracking-wide">
          ENERGY: <span className="font-semibold">{energy.toFixed(2)}</span>
        </div>
        <div className="text-gray-400">
          FREQ: <span className="text-white font-bold">{frequency}</span> Hz
        </div>
      </div>
    </div>
  );
};

export default AcousticEmission;
