import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX, RefreshCw, Zap } from 'lucide-react';
import { useSimulationStream } from '../hooks/useSimulationStream';
import CrystalBall from '../components/CrystalBall';
import UniverseTimeline from '../components/UniverseTimeline';
import WinProbRace from '../components/WinProbRace';
import FinalVerdict from '../components/FinalVerdict';

const UNIVERSE_META = {
  A: { name: 'THE CALL',    subtitle: 'AI Recommendation Followed', color: '#4285F4', strategy: 'Optimal field + bowling combination' },
  B: { name: 'THE MISTAKE', subtitle: 'Captain Ignores AI',          color: '#FF3B3B', strategy: 'Wrong bowler — maximum mismatch' },
  C: { name: 'THE GAMBLE',  subtitle: 'Wildcard Aggressive Play',    color: '#FFD700', strategy: 'High-risk, high-reward option' },
};

const WarRoom: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchState, captainDecision } = location.state || {};

  const { simState, startSimulation, reset } = useSimulationStream();
  const [crystalDone, setCrystalDone] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [shared, setShared] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Narrate dramatic events via Web Speech API
  useEffect(() => {
    if (!audioEnabled) return;
    const latest = simState.narrations[simState.narrations.length - 1];
    if (!latest) return;
    window.speechSynthesis?.cancel();
    const utter = new SpeechSynthesisUtterance(latest.commentary.fullCommentary);
    utter.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en-GB')) || null;
    utter.pitch = 1.1;
    utter.rate = 1.05;
    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [simState.narrations.length, audioEnabled]);

  // Start simulation after crystal ball opens
  const handleCrystalDone = useCallback(() => {
    setCrystalDone(true);
    if (matchState && captainDecision) {
      startSimulation(matchState, captainDecision);
    }
  }, [matchState, captainDecision, startSimulation]);

  const handleRerun = useCallback(() => {
    reset();
    setCrystalDone(false);
  }, [reset]);

  const handleAccept = useCallback(() => {
    navigate('/decision', { state: { matchState } });
  }, [navigate, matchState]);

  if (!matchState || !captainDecision) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-mono">
        <div className="text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p>No match data. <button onClick={() => navigate('/')} className="text-blue-400 underline">Go back</button></p>
        </div>
      </div>
    );
  }

  const isPlaying = simState.phase === 'playing' || simState.phase === 'generating';
  const isComplete = simState.phase === 'complete';
  const isVerdict = simState.phase === 'verdict' || isComplete;

  const bowlerForUniverse = {
    A: captainDecision.nextBowler || 'Recommended Bowler',
    B: matchState.bowlers?.find((b: any) => b.name !== captainDecision.nextBowler && b.economy > 8)?.name || 'Wrong Bowler',
    C: matchState.impactPlayerName || 'Wildcard'
  };

  return (
    <div className="min-h-screen bg-[#020810] text-white overflow-x-hidden">
      {/* Crystal Ball Intro */}
      <AnimatePresence>
        {!crystalDone && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <CrystalBall onComplete={handleCrystalDone} phase={simState.phase} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main War Room */}
      {crystalDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#020810]/90 backdrop-blur-xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-display text-xs tracking-widest">
              <ChevronLeft size={16} /> BACK
            </button>

            <div className="text-center">
              <h1 className="font-display font-black text-base tracking-widest text-white">⚔️ WAR ROOM</h1>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest">3 UNIVERSES · 12 BALLS · 1 TRUTH</p>
            </div>

            <div className="flex items-center gap-3">
              {isPlaying && (
                <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full animate-pulse">
                  <Zap size={10} /> SIMULATING
                </div>
              )}
              <button
                onClick={() => { setAudioEnabled(p => !p); window.speechSynthesis?.cancel(); }}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                {audioEnabled ? <Volume2 size={14} className="text-blue-400" /> : <VolumeX size={14} className="text-gray-500" />}
              </button>
              <button
                onClick={handleRerun}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={14} className="text-gray-400" />
              </button>
            </div>
          </header>

          {/* Status Bar */}
          <AnimatePresence>
            {simState.message && !isVerdict && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="text-center py-3 border-b border-white/5 bg-blue-950/30">
                  <p className="text-blue-300 text-xs font-mono tracking-widest">{simState.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Latest Narration Subtitle */}
          <AnimatePresence>
            {simState.narrations.length > 0 && (
              <motion.div
                key={simState.narrations.length}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 py-3 border-b border-white/5 bg-gradient-to-r from-transparent via-yellow-950/30 to-transparent"
              >
                <Volume2 size={12} className="text-yellow-400 shrink-0" />
                <p className="text-yellow-200/90 text-xs font-mono italic text-center max-w-2xl">
                  "{simState.narrations[simState.narrations.length - 1].commentary.shortCallout}" — {simState.narrations[simState.narrations.length - 1].commentary.fullCommentary.substring(0, 100)}...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* 3-Column Universe Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(['A', 'B', 'C'] as const).map(u => (
                <UniverseTimeline
                  key={u}
                  letter={u}
                  name={UNIVERSE_META[u].name}
                  subtitle={UNIVERSE_META[u].subtitle}
                  color={UNIVERSE_META[u].color}
                  balls={u === 'A' ? simState.ballsA : u === 'B' ? simState.ballsB : simState.ballsC}
                  summary={u === 'A' ? simState.summaryA : u === 'B' ? simState.summaryB : simState.summaryC}
                  bowler={bowlerForUniverse[u]}
                  strategy={UNIVERSE_META[u].strategy}
                  matchState={matchState}
                  isActive={isPlaying}
                />
              ))}
            </div>

            {/* Win Probability Race Chart */}
            {(simState.ballsA.length > 0 || simState.ballsB.length > 0 || simState.ballsC.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-6 border border-white/5 bg-white/[0.02]"
              >
                <WinProbRace
                  ballsA={simState.ballsA}
                  ballsB={simState.ballsB}
                  ballsC={simState.ballsC}
                  initialWinProb={matchState.winProbability || 50}
                  isComplete={isVerdict}
                  bestUniverse={simState.metadata?.bestUniverse}
                />
              </motion.div>
            )}

            {/* Final Verdict */}
            <AnimatePresence>
              {isVerdict && simState.metadata && (
                <FinalVerdict
                  bestUniverse={simState.metadata.bestUniverse}
                  winProbComparison={simState.metadata.winProbComparison}
                  recommendationValidated={simState.metadata.recommendationValidated}
                  confidenceScore={simState.metadata.confidenceScore}
                  onAccept={handleAccept}
                  onRerun={handleRerun}
                  onShare={() => setShared(true)}
                  matchState={matchState}
                  captainDecision={captainDecision}
                />
              )}
            </AnimatePresence>

            {shared && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-green-400 font-mono py-2"
              >
                ✓ Simulation results copied to clipboard!
              </motion.div>
            )}

            {/* Error state */}
            {simState.phase === 'error' && (
              <div className="text-center py-12">
                <p className="text-red-400 font-mono mb-4">⚠️ {simState.error}</p>
                <button onClick={handleRerun} className="text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
                  Retry Simulation
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WarRoom;
