import React from 'react';
import { motion } from 'framer-motion';

const CricketField = () => {
  const fielders = [
    { role: "Wicketkeeper", name: "MS Dhoni", x: 50, y: 15 },
    { role: "Slip", name: "Daryl Mitchell", x: 45, y: 20 },
    { role: "Third Man", name: "Mustafizur", x: 30, y: 25 },
    { role: "Deep Point", name: "Ravindra Jadeja", x: 15, y: 55 },
    { role: "Cover", name: "Ruturaj Gaikwad", x: 30, y: 65 },
    { role: "Mid Off", name: "Ajinkya Rahane", x: 45, y: 75 },
    { role: "Mid On", name: "Moeen Ali", x: 55, y: 75 },
    { role: "Deep Mid Wicket", name: "Shivam Dube", x: 80, y: 55 },
    { role: "Deep Square Leg", name: "Rachin Ravindra", x: 85, y: 40 },
    { role: "Fine Leg", name: "Tushar Deshpande", x: 70, y: 25 },
    { role: "Bowler", name: "Matheesha Pathirana", x: 50, y: 65 }
  ];

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-[#1a3a22] to-[#0f2915] rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(34,197,94,0.1)_inset] flex items-center justify-center">
      
      {/* Grass Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Boundary Rope */}
      <div className="absolute inset-2 rounded-full border-2 border-white/10 border-dashed"></div>

      {/* 30 yard circle */}
      <div className="w-[55%] h-[65%] border-2 border-white/30 rounded-[40%] absolute border-dashed opacity-50"></div>
      
      {/* Pitch Area Background */}
      <div className="w-16 h-36 bg-[#4a3b2c] absolute opacity-40 blur-sm rounded-full"></div>
      
      {/* The Pitch */}
      <div className="w-10 h-32 bg-[#cca27a] absolute border border-white/20 flex flex-col justify-between p-1 shadow-lg">
        {/* Creases */}
        <div className="h-4 border-b-2 border-white/70 w-full relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-white/90"></div>
        </div>
        <div className="h-4 border-t-2 border-white/70 w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-white/90"></div>
        </div>
      </div>

      {/* Highlight Arc (e.g., targeting off-side) */}
      <div className="absolute w-[80%] h-[80%] rounded-full border-[20px] border-l-blue-500/20 border-r-transparent border-t-transparent border-b-transparent pointer-events-none transform -rotate-12"></div>

      {/* Fielders */}
      {fielders.map((fielder, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.1, duration: 0.4, type: "spring" }}
          className="absolute w-4 h-4 bg-ipl-neon rounded-full shadow-[0_0_15px_#4ade80] border-2 border-white cursor-pointer group"
          style={{ left: `${fielder.x}%`, top: `${fielder.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full border border-ipl-neon animate-ping opacity-50"></div>

          {/* Tooltip */}
          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#0a0f1c]/95 border border-white/10 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 z-20 pointer-events-none shadow-xl backdrop-blur-md translate-y-2 group-hover:translate-y-0">
            <p className="font-bold text-ipl-neon font-display tracking-wide">{fielder.role}</p>
            <p className="text-gray-300 mt-1">{fielder.name}</p>
            {/* Tooltip Triangle */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a0f1c]"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CricketField;
