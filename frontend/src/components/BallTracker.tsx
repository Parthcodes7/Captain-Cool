import React from 'react';
import { motion } from 'framer-motion';

interface Ball {
  value: string;
  label?: string;
}

const parseBall = (raw: string): Ball => {
  const v = raw.trim();
  if (v === 'W') return { value: 'W', label: '💀' };
  if (v === '6') return { value: '6' };
  if (v === '4') return { value: '4' };
  if (v === '0' || v === '.') return { value: '·' };
  return { value: v };
};

const ballColor = (v: string) => {
  if (v === 'W') return 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
  if (v === '6') return 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
  if (v === '4') return 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.4)]';
  if (v === '·') return 'bg-white/5 border-white/10 text-gray-500';
  return 'bg-blue-500/10 border-blue-400/40 text-blue-300';
};

interface BallTrackerProps {
  recentBalls: string;
  className?: string;
}

const BallTracker: React.FC<BallTrackerProps> = ({ recentBalls, className = '' }) => {
  const balls = recentBalls.split(' ').filter(Boolean).slice(-6).map(parseBall);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {balls.map((ball, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
          className={`relative w-11 h-11 rounded-full border-2 flex items-center justify-center font-display font-black text-sm cursor-default select-none transition-all group ${ballColor(ball.value)}`}
        >
          {ball.label || ball.value}
          {/* Glow ring for 6s */}
          {ball.value === '6' && (
            <span className="absolute inset-0 rounded-full border border-yellow-400/50 animate-ping opacity-30"></span>
          )}
        </motion.div>
      ))}
      {/* Empty placeholders */}
      {Array.from({ length: Math.max(0, 6 - balls.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="w-11 h-11 rounded-full border-2 border-dashed border-white/5 bg-white/5"></div>
      ))}
    </div>
  );
};

export default BallTracker;
