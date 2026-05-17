import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimBall } from '../hooks/useSimulationStream';

interface BallByBallPlayerProps {
  balls: SimBall[];
  color: string;
  latest?: SimBall;
}

const OUTCOME_STYLE: Record<string, { bg: string; text: string; glow: string; label: string }> = {
  dot:  { bg: 'rgba(255,255,255,0.06)', text: '#6b7280', glow: 'none', label: '·' },
  '1':  { bg: 'rgba(255,255,255,0.12)', text: '#d1d5db', glow: 'none', label: '1' },
  '2':  { bg: 'rgba(255,255,255,0.15)', text: '#e5e7eb', glow: 'none', label: '2' },
  '3':  { bg: 'rgba(255,255,255,0.18)', text: '#f3f4f6', glow: 'none', label: '3' },
  '4':  { bg: 'rgba(34,197,94,0.25)',   text: '#4ade80', glow: '0 0 12px rgba(34,197,94,0.6)', label: '4' },
  '6':  { bg: 'rgba(251,191,36,0.3)',   text: '#fbbf24', glow: '0 0 20px rgba(251,191,36,0.8)', label: '6' },
  W:    { bg: 'rgba(239,68,68,0.3)',    text: '#f87171', glow: '0 0 20px rgba(239,68,68,0.8)', label: 'W' },
  Wd:   { bg: 'rgba(245,158,11,0.2)',   text: '#fbbf24', glow: 'none', label: 'wd' },
  Nb:   { bg: 'rgba(245,158,11,0.2)',   text: '#fbbf24', glow: 'none', label: 'nb' },
};

const BallCircle: React.FC<{ ball: SimBall; isLatest: boolean }> = ({ ball, isLatest }) => {
  const style = OUTCOME_STYLE[ball.outcome] || OUTCOME_STYLE['dot'];
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isLatest && (ball.outcome === '6' || ball.outcome === 'W')) {
      setShowParticles(true);
      const t = setTimeout(() => setShowParticles(false), 1500);
      return () => clearTimeout(t);
    }
  }, [isLatest, ball.outcome]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isLatest ? [0, 1.3, 1] : 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, duration: 0.4 }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-black cursor-default select-none relative"
        style={{
          background: style.bg,
          color: style.text,
          boxShadow: isLatest ? style.glow : 'none',
          border: `1px solid ${style.text}30`
        }}
        title={`${ball.over}.${ball.ballInOver}: ${ball.outcome} — ${ball.description}`}
      >
        {style.label}
      </motion.div>

      {/* Particle burst for 6 */}
      {showParticles && ball.outcome === '6' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 10) * Math.PI * 2) * 24,
                y: Math.sin((i / 10) * Math.PI * 2) * 24,
                opacity: 0, scale: 0
              }}
              transition={{ duration: 0.8, delay: i * 0.02 }}
              className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400 top-3 left-3"
            />
          ))}
        </div>
      )}

      {/* Red flash for W */}
      <AnimatePresence>
        {showParticles && ball.outcome === 'W' && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-red-600/20 pointer-events-none z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyBall: React.FC<{ color: string }> = ({ color }) => (
  <div className="w-8 h-8 rounded-full border border-dashed" style={{ borderColor: `${color}25` }} />
);

const BallByBallPlayer: React.FC<BallByBallPlayerProps> = ({ balls, color, latest }) => {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [balls.length]);

  // 12 slots
  const slots = Array.from({ length: 12 }, (_, i) => balls[i] || null);
  const row1 = slots.slice(0, 6);
  const row2 = slots.slice(6, 12);

  return (
    <div className="flex flex-col gap-3">
      {/* Over 1 */}
      <div>
        <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: `${color}80` }}>OVER {balls[0]?.over ?? '—'}</p>
        <div className="flex gap-2">
          {row1.map((ball, i) =>
            ball
              ? <BallCircle key={i} ball={ball} isLatest={ball === latest} />
              : <EmptyBall key={i} color={color} />
          )}
        </div>
      </div>
      {/* Over 2 */}
      <div>
        <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: `${color}80` }}>OVER {balls[6]?.over ?? '—'}</p>
        <div className="flex gap-2">
          {row2.map((ball, i) =>
            ball
              ? <BallCircle key={i} ball={ball} isLatest={ball === latest} />
              : <EmptyBall key={i} color={color} />
          )}
        </div>
      </div>

      {/* Commentary Feed */}
      <div ref={feedRef} className="mt-1 space-y-1.5 max-h-[90px] overflow-y-auto">
        {balls.slice(-3).map((b, i) => (
          <motion.p
            key={b.ball}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] leading-tight"
            style={{
              color: b.outcome === '6' ? '#fbbf24' : b.outcome === 'W' ? '#f87171' : b.outcome === '4' ? '#4ade80' : '#9ca3af',
              fontFamily: 'monospace'
            }}
          >
            {b.over}.{b.ballInOver}: {b.description}
          </motion.p>
        ))}
      </div>
    </div>
  );
};

export default BallByBallPlayer;
