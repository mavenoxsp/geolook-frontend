import React, { useEffect, useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { TbVaccine } from 'react-icons/tb';

const VocLevels = () => {
  const [ppb, setPpb] = useState(62.9);
  const [fmld, setFmld] = useState(2.01);
  const [bnz, setBnz] = useState(9.45);

  useEffect(() => {
    const interval = setInterval(() => {
      setPpb(parseFloat((Math.random() * 200).toFixed(1)));
      setFmld(parseFloat((Math.random() * 5).toFixed(2)));
      setBnz(parseFloat((Math.random() * 15).toFixed(2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm xl:max-w-md h-80 bg-gray-900 rounded-2xl shadow-md p-4 flex flex-col items-center font-mono text-white mx-auto border-1 border-green-800">
      {/* Header */}
      <div className="w-full text-lg tracking-wide text-center">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
          <TbVaccine className="text-xl" /> VOC_LEVELS
        </div>
        <hr className="border-t border-green-800 mt-1" />
      </div>

      {/* Circular Gauge */}
      <div className="w-44 h-44 mt-4">
        <CircularProgressbarWithChildren
          value={ppb}
          maxValue={200}
          styles={buildStyles({
            pathColor: '#c084fc',
            trailColor: '#1e1b4b',
            strokeLinecap: 'round',
          })}
        >
          <div className="text-3xl font-semibold text-purple-400">
            {ppb.toFixed(1)} <span className="text-base">ppb</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      {/* FMLD and BNZ */}
      <div className="flex items-center justify-between w-full mt-4 px-2 text-sm">
        <div className="text-purple-400 tracking-wide">
          FMLD: <span className="font-semibold">{fmld.toFixed(2)}</span>
        </div>
        <div className="text-gray-400">
          BNZ: <span className="text-white font-bold">{bnz.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default VocLevels;
