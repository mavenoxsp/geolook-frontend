// === File: src/components/LogoLoader.jsx ===
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/Logo.svg";

export default function LogoLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2500); // Hide after 2.5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-[#0f172a] z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-40 h-40"
          >
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full grayscale brightness-75"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-t from-green-400 to-green-500 mix-blend-screen"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
