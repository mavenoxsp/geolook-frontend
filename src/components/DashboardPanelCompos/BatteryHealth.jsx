import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react"; // Icon for expand button (optional)

export default function BatteryHealth() {
  const [health, setHealth] = useState(59);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHealth = Math.floor(40 + Math.random() * 40); // 40–80%
      setHealth(newHealth);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const percentage = health;
  const strokeLength = 167.55;
  const strokeValue = (percentage / 100) * strokeLength;

  const BatteryUI = ({ extraClass = "", size = "normal", showClose = false }) => {
    const isPopup = size === "popup";

    return (
      <div
        className={`relative bg-gray-900 ${extraClass} ${
          isPopup ? "p-10 w-full max-w-4xl" : "p-5 w-full h-60"
        } rounded-md font-mono border border-purple-800 text-purple-400 shadow-lg`}
      >
        {/* Expand or Close Button */}
        <button
          onClick={() => setIsPopupOpen(!isPopupOpen)}
          className="absolute top-2 right-2 text-purple-300 hover:text-white"
        >
          {showClose ? (
            <span className="text-xl font-bold">&times;</span>
          ) : (
            <Maximize2 size={18} />
          )}
        </button>

        {/* Header */}
        <div
          className={`text-white ${
            isPopup ? "text-2xl" : "text-lg"
          } font-bold mb-1 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <span className="text-purple-400">%</span> BATTERY_HEALTH
          </div>
          <div className="text-purple-400 text-3xl">🔋</div>
        </div>

        <div className="border-b border-purple-800 mb-4" />

        {/* Arc Gauge */}
        <div
          className={`relative w-full ${
            isPopup ? "h-48" : "h-32"
          } flex items-center justify-center`}
        >
          <svg
            className={`${isPopup ? "w-48 h-48" : "w-36 h-36"}`}
            viewBox="0 0 120 120"
          >
            <path
              d="M30,90 A45,45 0 1,1 90,90"
              fill="none"
              stroke="#e5d7ff"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M30,90 A45,45 0 1,1 90,90"
              fill="none"
              stroke="#a855f7"
              strokeWidth="10"
              strokeDasharray={`${strokeValue}, ${strokeLength}`}
              strokeLinecap="round"
            />
          </svg>

          <div
            className={`absolute text-green-400 ${
              isPopup ? "text-4xl" : "text-2xl"
            } font-bold`}
          >
            {health}%
          </div>
        </div>

        <div
          className={`text-center text-purple-400 ${
            isPopup ? "text-base mt-4" : "text-sm mt-2"
          }`}
        >
          ● CHARGING
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Normal view */}
      {BatteryUI({})}

      {/* Popup modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setIsPopupOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {BatteryUI({
              size: "popup",
              extraClass: "scale-110",
              showClose: true,
            })}
          </div>
        </div>
      )}
    </>
  );
}
