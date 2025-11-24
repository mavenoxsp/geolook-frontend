import React, { useEffect, useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { GiVibratingSmartphone } from 'react-icons/gi';

const VibrationalAnalysis = () => {
  const [hz, setHz] = useState(0.8);
  const [hor, setHor] = useState(0.39);
  const [ver, setVer] = useState(0.19);

  useEffect(() => {
    const interval = setInterval(() => {
      setHz(parseFloat((Math.random() * 20).toFixed(1)));
      setHor(parseFloat((Math.random() * 3).toFixed(2)));
      setVer(parseFloat((Math.random() * 3).toFixed(2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm xl:max-w-md h-80 bg-gray-900 rounded-2xl shadow-md p-4 flex flex-col items-center font-mono text-white mx-auto border-1 border-green-800">
      {/* Header */}
      <div className="w-full text-lg tracking-wide text-center">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
          <GiVibratingSmartphone className="text-xl" /> VIBRATIONAL_ANALYSIS
        </div>
        <hr className="border-t border-green-800 mt-1" />
      </div>

      {/* Circular Gauge */}
      <div className="w-44 h-44 mt-4">
        <CircularProgressbarWithChildren
          value={hz}
          maxValue={20}
          styles={buildStyles({
            pathColor: '#34d399',
            trailColor: '#1b2b2b',
            strokeLinecap: 'round',
          })}
        >
          <div className="text-3xl font-semibold text-green-400">
            {hz.toFixed(1)} <span className="text-base">Hz</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      {/* HOR and VER */}
      <div className="flex items-center justify-between w-full mt-4 px-2 text-sm">
        <div className="text-green-400 tracking-wide">
          HOR: <span className="font-semibold">{hor.toFixed(2)}</span>
        </div>
        <div className="text-green-400">
          VER: <span className="font-bold">{ver.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default VibrationalAnalysis;
