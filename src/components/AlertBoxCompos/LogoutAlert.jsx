// File: components/LogoutAlert.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LogoutAlert = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[6px] bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0f172a] border border-green-400 rounded-xl px-8 py-6 text-center shadow-xl relative w-[90%] max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <img
              src="https://res.cloudinary.com/dkoqcp1g9/image/upload/v1750591433/Geolook-Logo_wyuybf.png"
              alt="Logo"
              className="h-10 mx-auto mb-4"
            />
            <hr className="border-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-white mb-6">
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-center gap-6">
              {/* Yes Button */}
              <motion.button
                onClick={onConfirm}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 border border-green-400 rounded font-bold text-lg text-green-400 transition-all duration-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-green-400 hover:to-yellow-200"
              >
                Yes
              </motion.button>

              {/* Cancel Button */}
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 border border-green-400 rounded font-bold text-lg text-green-400 transition-all duration-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-green-400 hover:to-yellow-200"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutAlert;
