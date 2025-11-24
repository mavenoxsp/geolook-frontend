import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { LuWind } from "react-icons/lu";

const WindSpeedMonitor = () => {
  const [speed, setSpeed] = useState(8.2);
  const [maxGust, setMaxGust] = useState(13.6);
  const [direction, setDirection] = useState(239);

  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Spring for speed (normalized to 0-1)
  const speedProgress = useSpring(speed / 20, {
    stiffness: 80,
    damping: 12,
  });

  // Convert progress (0–1) into strokeDashoffset
  const dashOffset = useTransform(speedProgress, (p) => {
    return circumference - p * circumference;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newSpeed = parseFloat((Math.random() * 10).toFixed(1));
      const newDirection = Math.floor(Math.random() * 360);
      setSpeed(newSpeed);
      setMaxGust(parseFloat((Math.random() * 15).toFixed(1)));
      setDirection(newDirection);
      speedProgress.set(newSpeed / 20); // update spring value
    }, 3000);

    return () => clearInterval(interval);
  }, [speedProgress]);

  return (
    <div className="w-full max-w-sm xl:max-w-md bg-gray-900 rounded-2xl shadow-md flex flex-col items-center justify-between py-6 px-4 font-mono text-white mx-auto border-1 border-green-800">
       <div className="text-lg tracking-wide text-center">
                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-white to-green-300 text-transparent bg-clip-text">
                      < LuWind className="text-xl" />  WIND_SPEED_MONITOR <span className="text-sm align-top">{direction}°</span>
                    </div>
                    <hr className="border-t border-green-800 mt-1" />
                  </div>

      <svg height={radius * 2} width={radius * 2} className="my-4">
        <circle
          stroke="#0f4c75"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <motion.circle
          stroke="#00d9ff"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: dashOffset,
          }}
          transform={`rotate(-90 ${radius} ${radius})`}
        />

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="1.8em"
          fill="#00d9ff"
          fontFamily="monospace"
        >
          {speed.toFixed(1)} m/s
        </text>
      </svg>

      <div className="text-cyan-400 text-sm tracking-wide mb-7">
        MAX_GUST: {maxGust.toFixed(1)} m/s
      </div>
    </div>
  );
};

export default WindSpeedMonitor;
