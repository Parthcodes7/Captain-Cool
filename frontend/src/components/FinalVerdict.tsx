import React from 'react';
import { motion } from 'framer-motion';

interface FinalVerdictProps {
  bestUniverse: 'A' | 'B' | 'C';
  winProbComparison: { A: number; B: number; C: number };
  recommendationValidated: boolean;
  confidenceScore: number;
  onAccept: () => void;
  onRerun: () => void;
  onShare: (text: string) => void;
  matchState: any;
  captainDecision: any;
}

const UNIVERSE_META = {
  A: { name: 'THE CALL',    color: '#4285F4', label: 'Captain follows AI recommendation' },
  B: { name: 'THE MISTAKE', color: '#FF3B3B', label: 'Captain ignores the recommendation' },
  C: { name: 'THE GAMBLE',  color: '#FFD700', label: 'Wildcard aggressive play' },
};

const FinalVerdict: React.FC<FinalVerdictProps> = ({
  bestUniverse, winProbComparison, recommendationValidated, confidenceScore,
  onAccept, onRerun, onShare, matchState, captainDecision
}) => {
  const best = UNIVERSE_META[bestUniverse];
  const sorted = (['A', 'B', 'C'] as const).sort((a, b) => winProbComparison[b] - winProbComparison[a]);
  const maxProb = Math.max(winProbComparison.A, winProbComparison.B, winProbComparison.C);

  const shareText = `🏏 Captain's Call War Room — ${matchState.battingTeam} vs ${matchState.bowlingTeam}
Over ${matchState.over}: ${captainDecision.nextBowler || 'The Captain'}'s decision simulated across 3 timelines.

Universe A (${UNIVERSE_META.A.label}): ${winProbComparison.A}% win probability
Universe B (${UNIVERSE_META.B.label}): ${winProbComparison.B}% win probability  
Universe C (${UNIVERSE_META.C.label}): ${winProbComparison.C}% win probability

Best path: Universe ${bestUniverse} — ${best.name} (${winProbComparison[bestUniverse]}%)
AI Confidence: ${confidenceScore}%

Powered by Google Gemini 2.5 · Captain's Call`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      className="w-full rounded-3xl border border-yellow-500/20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(20,15,5,0.98), rgba(10,10,25,0.98))' }}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 tracking-widest">
            ⚔️ WAR ROOM VERDICT
          </h2>
          <div className={`flex items-center gap-2 text-xs font-black font-display px-4 py-2 rounded-full tracking-widest ${recommendationValidated ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            {recommendationValidated ? '✓ RECOMMENDATION VALIDATED' : '⚠️ OVERRIDE DETECTED'}
          </div>
        </div>
        <p className="text-gray-500 text-xs font-mono">
          Universe {bestUniverse} yields the highest win probability — {best.name}
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Probability Bars */}
        <div className="space-y-4">
          {sorted.map(u => {
            const meta = UNIVERSE_META[u];
            const prob = winProbComparison[u];
            const isWinner = u === bestUniverse;
            return (
              <div key={u} className={`rounded-2xl p-4 border transition-all ${isWinner ? 'border-yellow-500/30' : 'border-white/5'}`}
                style={{ background: isWinner ? `${meta.color}10` : 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm" style={{ color: meta.color }}>
                      {isWinner ? '🏆 ' : ''}UNIVERSE {u}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono">{meta.name}</span>
                  </div>
                  <span className="font-display font-black text-lg" style={{ color: meta.color }}>{prob}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(prob / maxProb) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                    className="h-full rounded-full"
                    style={{ background: meta.color, boxShadow: isWinner ? `0 0 10px ${meta.color}` : 'none' }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5 font-mono">{meta.label}</p>
              </div>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Confidence Meter */}
          <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.02]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">AI Simulation Confidence</p>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4285F4" strokeWidth="3"
                    strokeDasharray={`${confidenceScore} ${100 - confidenceScore}`} strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px #4285F4)' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-black text-sm text-white">{confidenceScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  {confidenceScore >= 80 ? 'High Confidence' : confidenceScore >= 60 ? 'Moderate Confidence' : 'Exploratory'}
                </p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Based on 36 simulated balls and IPL probability models.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAccept}
              className="w-full py-4 rounded-2xl font-display font-black text-sm tracking-widest text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${best.color}, ${best.color}99)`,
                boxShadow: `0 0 30px ${best.color}40`
              }}
            >
              ✓ ACCEPT UNIVERSE {bestUniverse} — LOCK IN DECISION
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRerun}
                className="flex-1 py-3 rounded-2xl font-display font-black text-xs tracking-widest text-gray-300 bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                🔄 RERUN SIMULATION
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigator.clipboard.writeText(shareText);
                  onShare(shareText);
                }}
                className="flex-1 py-3 rounded-2xl font-display font-black text-xs tracking-widest text-gray-300 bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                📤 SHARE RESULTS
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinalVerdict;
