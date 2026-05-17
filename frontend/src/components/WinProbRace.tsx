import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import type { SimBall } from '../hooks/useSimulationStream';

interface WinProbRaceProps {
  ballsA: SimBall[];
  ballsB: SimBall[];
  ballsC: SimBall[];
  initialWinProb: number;
  isComplete: boolean;
  bestUniverse?: 'A' | 'B' | 'C';
}

const CustomDot = (props: any) => {
  const { cx, cy, payload, universe } = props;
  if (!payload?.dramaticEvent) return null;
  const colors: Record<string, string> = { A: '#4285F4', B: '#FF3B3B', C: '#FFD700' };
  return (
    <circle
      cx={cx} cy={cy} r={6}
      fill={colors[universe] || '#fff'}
      stroke="#fff"
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 6px ${colors[universe]})` }}
    />
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a1628]/95 border border-white/10 rounded-xl p-3 backdrop-blur-xl text-xs font-mono">
      <p className="text-gray-400 mb-2">Ball {label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)}%</p>
      ))}
    </div>
  );
};

const WinProbRace: React.FC<WinProbRaceProps> = ({ ballsA, ballsB, ballsC, initialWinProb, isComplete, bestUniverse }) => {
  // Build chart data — all start at ball 0 (current state)
  const maxLen = Math.max(ballsA.length, ballsB.length, ballsC.length);

  const data = [
    { ball: 0, 'The Call': initialWinProb, 'The Mistake': initialWinProb, 'The Gamble': initialWinProb },
    ...Array.from({ length: maxLen }, (_, i) => ({
      ball: i + 1,
      'The Call':    ballsA[i]?.winProbability ?? undefined,
      'The Mistake': ballsB[i]?.winProbability ?? undefined,
      'The Gamble':  ballsC[i]?.winProbability ?? undefined,
      dramaticA:     ballsA[i]?.dramaticEvent,
      dramaticB:     ballsB[i]?.dramaticEvent,
      dramaticC:     ballsC[i]?.dramaticEvent,
    }))
  ];

  const bestColors: Record<string, string> = { A: '#4285F4', B: '#FF3B3B', C: '#FFD700' };
  const winnerLabel = bestUniverse === 'A' ? 'The Call' : bestUniverse === 'B' ? 'The Mistake' : 'The Gamble';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-black text-xs tracking-widest text-gray-400 uppercase">Win Probability Race</h3>
        {isComplete && bestUniverse && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black font-display tracking-widest"
            style={{ background: `${bestColors[bestUniverse]}20`, color: bestColors[bestUniverse], border: `1px solid ${bestColors[bestUniverse]}40` }}
          >
            🏆 UNIVERSE {bestUniverse} WINS
          </motion.div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="ball" tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'monospace' }} label={{ value: 'Ball', position: 'insideRight', fill: '#4b5563', fontSize: 9 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" label={{ value: '50% — Match in Balance', fill: 'rgba(255,255,255,0.2)', fontSize: 8, position: 'right' }} />
          <Line type="monotone" dataKey="The Call"    stroke="#4285F4" strokeWidth={3} dot={false} connectNulls activeDot={{ r: 5, fill: '#4285F4' }} />
          <Line type="monotone" dataKey="The Mistake" stroke="#FF3B3B" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls activeDot={{ r: 4, fill: '#FF3B3B' }} />
          <Line type="monotone" dataKey="The Gamble"  stroke="#FFD700" strokeWidth={2} strokeDasharray="2 2" dot={false} connectNulls activeDot={{ r: 4, fill: '#FFD700' }} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WinProbRace;
