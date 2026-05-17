import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimBall, UniverseSummary } from '../hooks/useSimulationStream';
import BallByBallPlayer from './BallByBallPlayer';

interface UniverseTimelineProps {
  letter: 'A' | 'B' | 'C';
  name: string;
  subtitle: string;
  color: string;
  balls: SimBall[];
  summary: UniverseSummary | null;
  bowler: string;
  strategy: string;
  matchState: any;
  isActive: boolean;
}

const RATING_STYLES: Record<string, { bg: string; text: string; emoji: string }> = {
  'Masterstroke':  { bg: 'rgba(34,197,94,0.2)',  text: '#4ade80', emoji: '🏆' },
  'Good Call':     { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa', emoji: '✅' },
  'Risky But Ok':  { bg: 'rgba(251,191,36,0.2)', text: '#fbbf24', emoji: '⚡' },
  'Costly Error':  { bg: 'rgba(239,68,68,0.2)',  text: '#f87171', emoji: '⚠️' },
  'Catastrophic':  { bg: 'rgba(239,68,68,0.3)',  text: '#ef4444', emoji: '💀' },
};

const UniverseTimeline: React.FC<UniverseTimelineProps> = ({
  letter, name, subtitle, color, balls, summary, bowler, strategy, matchState, isActive
}) => {
  const latest = balls[balls.length - 1];
  const currentScore = latest?.cumulativeScore ?? matchState.currentScore;
  const currentWickets = latest?.cumulativeWickets ?? matchState.wickets;
  const currentOver = latest ? `${latest.over}.${latest.ballInOver}` : `${matchState.over}.${matchState.ball}`;
  const winProb = latest?.winProbability ?? matchState.winProbability ?? 50;
  const ratingStyle = summary ? (RATING_STYLES[summary.captainRating] || RATING_STYLES['Good Call']) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: letter === 'A' ? 0 : letter === 'B' ? 0.15 : 0.3 }}
      className="flex flex-col gap-4 rounded-3xl p-5 border relative overflow-hidden"
      style={{
        borderColor: `${color}30`,
        background: `linear-gradient(145deg, ${color}08 0%, rgba(5,11,20,0.95) 60%)`,
        boxShadow: isActive ? `0 0 30px ${color}20` : 'none'
      }}
    >
      {/* Animated glow when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: `inset 0 0 30px ${color}10` }} />
      )}

      {/* Universe Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-black text-3xl" style={{ color }}>{letter}</span>
            <div>
              <p className="font-display font-black text-sm text-white tracking-widest">{name}</p>
              <p className="text-[9px] font-mono tracking-wider" style={{ color: `${color}90` }}>{subtitle}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-1">🎳 {bowler}</p>
          <p className="text-[9px] text-gray-600 font-mono">{strategy}</p>
        </div>
        {/* Live Win Prob badge */}
        <div className="shrink-0 text-right">
          <motion.div
            key={winProb}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-display font-black text-2xl"
            style={{ color: winProb >= 55 ? '#4ade80' : winProb >= 35 ? '#fbbf24' : '#f87171' }}
          >
            {winProb.toFixed(0)}%
          </motion.div>
          <p className="text-[8px] text-gray-600 uppercase tracking-widest font-mono">Win Prob</p>
        </div>
      </div>

      {/* Live Scoreboard */}
      <div className="rounded-2xl p-3 border" style={{ borderColor: `${color}15`, background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between">
          <div>
            <motion.p
              key={`${currentScore}/${currentWickets}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="font-display font-black text-xl text-white"
            >
              {matchState.battingTeam} {currentScore}/{currentWickets}
            </motion.p>
            <p className="text-xs text-gray-500 font-mono">Over {currentOver}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-mono">{latest?.batter || matchState.onStrikeBatter}</p>
            <p className="text-[9px] text-gray-600">On Strike</p>
          </div>
        </div>
      </div>

      {/* Ball by Ball Tracker */}
      <BallByBallPlayer balls={balls} color={color} latest={latest} />

      {/* Universe Verdict */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="rounded-2xl p-4 border space-y-2"
            style={{ borderColor: `${color}25`, background: `${color}08` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Verdict</p>
              {ratingStyle && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-[9px] font-black font-display px-3 py-1 rounded-full tracking-widest"
                  style={{ background: ratingStyle.bg, color: ratingStyle.text }}
                >
                  {ratingStyle.emoji} {summary.captainRating.toUpperCase()}
                </motion.span>
              )}
            </div>
            <p className="font-display font-black text-lg" style={{ color }}>{summary.finalScore} • {summary.finalWinProbability}%</p>
            <p className="text-xs text-gray-400 leading-relaxed">{summary.universeVerdict}</p>
            <p className="text-[9px] text-gray-600 font-mono">Key moment: Ball {summary.keyMoment}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UniverseTimeline;
