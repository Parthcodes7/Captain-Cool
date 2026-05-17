import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrystalBallProps {
  onComplete: () => void;
  phase: string;
}

const CrystalBall: React.FC<CrystalBallProps> = ({ onComplete, phase }) => {
  const [step, setStep] = useState(0); // 0=orb, 1=pulse, 2=shatter, 3=done

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 2800),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const streamColors = ['#4285F4', '#FF3B3B', '#FFD700'];
  const streamTargets = ['-33%', '0%', '33%'];

  return (
    <div className="fixed inset-0 z-50 bg-[#020810] flex flex-col items-center justify-center gap-8">
      {/* Animated star field */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* The Crystal Orb */}
      <AnimatePresence mode="wait">
        {step < 2 ? (
          <motion.div
            key="orb"
            initial={{ scale: 0, opacity: 0 }}
            animate={step >= 1 ? {
              scale: [1, 1.12, 1, 1.15, 1, 1.1, 1],
              opacity: 1,
            } : { scale: 0.6, opacity: 0.5 }}
            transition={step >= 1 ? { duration: 1.3, times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1] } : { duration: 0.5 }}
            className="relative w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(148,187,233,0.9), rgba(66,133,244,0.7) 40%, rgba(10,30,80,0.95))',
              boxShadow: '0 0 40px #4285F4, 0 0 80px rgba(66,133,244,0.4), 0 0 120px rgba(66,133,244,0.15)',
            }}
          >
            <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)' }} />
            <span className="text-5xl select-none">🔮</span>
            {/* Orbiting ring */}
            <motion.div
              className="absolute inset-[-8px] rounded-full border-2 border-blue-400/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-[-20px] rounded-full border border-blue-500/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        ) : (
          // Shatter: orb splits into 3 colored streams
          <motion.div key="shatter" className="relative w-40 h-40">
            {streamColors.map((color, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{ x: `${(i - 1) * 220}px`, y: -60, opacity: [1, 0.8, 0], scale: [0.6, 1.2, 0] }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.05 }}
                className="absolute inset-4 rounded-full"
                style={{ background: `radial-gradient(circle, ${color}cc, ${color}44)`, boxShadow: `0 0 30px ${color}` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text */}
      <div className="text-center space-y-2 relative z-10">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-xl text-white tracking-widest"
        >
          {step === 0 ? 'INITIALIZING' : step === 1 ? 'SIMULATING 3 FUTURES...' : 'TIMELINES SPLITTING...'}
        </motion.p>
        <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
          {phase === 'generating' ? '⚡ Gemini 2.5 computing 36 balls across 3 universes' : 'Peering into the match that hasn\'t happened yet'}
        </p>
      </div>

      {/* Spinning universe indicators */}
      <div className="flex gap-6">
        {['UNIVERSE A', 'UNIVERSE B', 'UNIVERSE C'].map((u, i) => (
          <motion.div
            key={u}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.5 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: streamColors[i], boxShadow: `0 0 10px ${streamColors[i]}` }} />
            <span className="text-[9px] font-mono tracking-widest" style={{ color: streamColors[i] }}>{u}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CrystalBall;
