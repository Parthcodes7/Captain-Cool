import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, ShieldAlert, Cpu, Copy, Check, RefreshCw, Swords } from 'lucide-react';
import AgentDebateFeed from '../components/AgentDebateFeed';
import CricketField from '../components/CricketField';
import WinProbChart from '../components/WinProbChart';
import PressureMeter from '../components/PressureMeter';
import BallTracker from '../components/BallTracker';
import Swarm3DLoader from '../components/Swarm3DLoader';
import ShareCardPreview from '../components/ShareCardPreview';
import { ShareCardData } from '../hooks/useShareCard';

const DecisionOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchState } = location.state || {};

  const [events, setEvents] = useState<any[]>([]);
  const [finalDecision, setFinalDecision] = useState<any>(null);
  const [commentary, setCommentary] = useState<any>(null);
  const [enrichedData, setEnrichedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const fetchedRef = useRef(false);

  const runDebate = async (state: any) => {
    setEvents([]);
    setFinalDecision(null);
    setCommentary(null);
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });

      if (!response.body) throw new Error('No stream body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(part.substring(6));
            if (data.type === 'DONE') {
              // Backend now guarantees sanitized finalDecision with all fields
              const fd = data.result?.finalDecision;
              setFinalDecision(fd ?? null);
              setCommentary(data.result?.commentary ?? null);
              setEnrichedData(data.result?.enrichedMatchData ?? null);
              setIsProcessing(false);
            } else if (data.type === 'EVENT') {
              setEvents(prev => [...prev, data.event]);
            }
          } catch { /* partial chunk */ }
        }
      }
    } catch (e) {
      console.error('Stream error:', e);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!matchState) { navigate('/'); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    runDebate(matchState);
  }, [matchState, navigate]);

  const readAloud = () => {
    if (!commentary || !('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(
      `${commentary.HEADLINE}. ${commentary.DECISION}. ${commentary.THE_THINKING}`
    );
    utter.pitch = 1.1; utter.rate = 1.0;
    window.speechSynthesis.speak(utter);
  };

  const copyDecision = () => {
    const text = commentary
      ? `${commentary.HEADLINE}\n\n${commentary.DECISION}\n\n${commentary.THE_THINKING}\n\nCounterfactual: ${commentary.COUNTERFACTUAL}`
      : JSON.stringify(finalDecision, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCardData: ShareCardData | null = finalDecision && commentary ? {
    battingTeam: matchState?.battingTeam || "Unknown",
    bowlingTeam: matchState?.bowlingTeam || "Unknown",
    currentScore: matchState?.currentScore || 0,
    wickets: matchState?.wickets || 0,
    over: `${matchState?.over || 0}.${matchState?.ball || 0}`,
    target: matchState?.target,
    venue: matchState?.venue || "Stadium",
    headline: commentary?.HEADLINE || "THE FINAL VERDICT",
    nextBowler: finalDecision?.nextBowler || "Unknown",
    winProbBefore: enrichedData?.winProbability || 50,
    winProbAfter: Math.min(100, Math.max(0, (enrichedData?.winProbability || 50) + (finalDecision?.winProbImpact || 0))),
    confidenceStars: commentary?.CONFIDENCE?.match(/\d+/) ? Math.round(parseInt(commentary.CONFIDENCE.match(/\d+/)[0]) / 20) : 4,
    micDropQuote: commentary?.THE_THINKING || "A game of fine margins.",
    agentsAgreed: 4,
    wasRevised: true
  } : null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-900/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-ipl-orange/8 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050B14]/80 backdrop-blur-xl">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-display text-sm tracking-widest">
          <ChevronLeft size={18} /> BACK
        </button>

        {matchState && (
          <div className="flex items-center gap-4 text-sm font-display font-bold">
            <span className="text-ipl-orange">{matchState.battingTeam}</span>
            <span className="text-2xl font-black text-white">{matchState.currentScore}/{matchState.wickets}</span>
            <span className="text-gray-500">vs</span>
            <span className="text-gray-300">{matchState.bowlingTeam}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-blue-400 font-mono bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full animate-pulse">
              <Cpu size={12} /> AGENTS THINKING
            </div>
          )}
          {finalDecision && (
            <button onClick={() => { fetchedRef.current = false; runDebate(matchState); }} className="text-xs text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-colors">
              <RefreshCw size={12} /> Regenerate
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

        {/* LEFT: Agent Debate Feed */}
        <div className="w-full lg:w-[400px] flex flex-col border-r border-white/5 shrink-0 bg-[#050B14]/40">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="font-display font-bold text-sm tracking-widest text-white flex items-center gap-2">
              <Cpu size={16} className="text-blue-400" /> AGENT CONSENSUS
            </h3>
            <span className="text-[10px] font-mono text-gray-500">{events.length} messages</span>
          </div>
          
          {/* Mini 3D Swarm Hologram Visualizer (Always interactive!) */}
          <div className="relative border-b border-white/5 bg-black/40 py-3 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-2 right-3 text-[7px] font-mono tracking-[0.2em] text-blue-400/60 uppercase animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> NEURAL ACTIVE
            </div>
            <Swarm3DLoader size={160} interactive={true} />
            <div className="text-[8px] font-mono text-gray-500 tracking-[0.15em] text-center mt-1 pb-1 uppercase">
              HOVER TO TILT SWARM PERSPECTIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-290px)]">
            <AgentDebateFeed events={events} isProcessing={isProcessing} />
          </div>
        </div>

        {/* RIGHT: Decision Panel */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-72px)]">
          <AnimatePresence mode="wait">
            {finalDecision && commentary ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="space-y-6 pb-16"
              >
                {/* HEADLINE */}
                <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden border border-white/8">
                  <div className="absolute inset-0 bg-gradient-to-br from-ipl-orange/8 via-transparent to-blue-500/8 pointer-events-none"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={readAloud} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Read aloud">
                      <Volume2 size={14} className="text-blue-300" />
                    </button>
                    <button onClick={copyDecision} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                    </button>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight relative z-10">
                    "{commentary.HEADLINE}"
                  </h1>
                  <div className="text-2xl mb-2">{commentary.CONFIDENCE?.split(' ')[0]}</div>
                  <p className="text-sm text-gray-400">{commentary.CONFIDENCE?.split(' ').slice(1).join(' ')}</p>
                </div>

                {/* METRICS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Next Bowler', value: finalDecision.nextBowler || '—', color: 'text-ipl-orange', icon: '🎯' },
                    { label: 'Timeout', value: finalDecision.timeout?.callNow ? 'DEPLOY NOW' : 'HOLD', color: finalDecision.timeout?.callNow ? 'text-red-400' : 'text-gray-300', icon: '⏸️' },
                    { label: 'Batting Change', value: finalDecision.battingChange || 'None', color: 'text-blue-300', icon: '🔄' },
                    { label: 'Impact Player', value: finalDecision.impactPlayer?.deploy ? (finalDecision.impactPlayer?.name || 'Yes') : 'Hold', color: finalDecision.impactPlayer?.deploy ? 'text-green-400' : 'text-gray-400', icon: '⚡' }
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="bg-[#050B14] border border-white/8 rounded-2xl p-5 relative overflow-hidden group hover:border-white/15 transition-colors">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">{label}</p>
                      <p className={`font-display font-bold text-base ${color} leading-tight`}>{icon} {value}</p>
                    </div>
                  ))}
                </div>

                {/* WIN PROB + PRESSURE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-3xl p-6 border border-white/5 flex items-center justify-around">
                    <WinProbChart winProbability={enrichedData?.winProbability || 42} label="Current Win %" />
                    <div className="w-px h-24 bg-white/10"></div>
                    <PressureMeter value={enrichedData?.pressureIndex || 72} size={140} />
                  </div>

                  {/* Field Setup */}
                  <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col">
                    <h3 className="font-display font-bold text-xs tracking-widest text-gray-400 uppercase mb-4">Tactical Field</h3>
                    <div className="flex-1 rounded-2xl overflow-hidden min-h-[200px]">
                      <CricketField />
                    </div>
                    {finalDecision.fieldSetup && (
                      <p className="text-xs text-gray-400 mt-3 bg-white/5 p-3 rounded-xl leading-relaxed">{finalDecision.fieldSetup}</p>
                    )}
                  </div>
                </div>

                {/* HARSHA'S NARRATIVE */}
                <div className="glass-card rounded-3xl p-8 border border-blue-500/15 bg-blue-900/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/5 rounded-br-full"></div>
                  <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4 relative z-10">
                    <h3 className="font-display font-bold text-blue-400 tracking-widest text-sm flex items-center gap-2">
                      <Volume2 size={16} /> BROADCAST NARRATIVE — HARSHA BHOGLE
                    </h3>
                    <button onClick={readAloud} className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-full transition-colors border border-blue-500/20 flex items-center gap-2">
                      ▶ Play Audio
                    </button>
                  </div>
                  <p className="text-gray-200 text-lg leading-relaxed mb-5 relative z-10">{commentary.DECISION}</p>
                  <p className="text-blue-200/70 italic border-l-4 border-blue-500/40 pl-5 py-2 leading-relaxed relative z-10">"{commentary.THE_THINKING}"</p>
                  {commentary.THE_DEBATE && (
                    <p className="text-gray-400 text-sm mt-5 leading-relaxed relative z-10 bg-white/5 p-4 rounded-xl">{commentary.THE_DEBATE}</p>
                  )}
                </div>

                {/* COUNTERFACTUAL */}
                <div className="bg-gradient-to-r from-amber-950/40 to-transparent border-l-4 border-amber-500 p-6 rounded-r-3xl">
                  <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                    <ShieldAlert size={14} /> ALTERNATE REALITY · IF WRONG CALL
                  </p>
                  <p className="text-amber-100/90 text-sm leading-relaxed">{commentary.COUNTERFACTUAL}</p>
                </div>

                {/* WAR ROOM TRIGGER */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => navigate('/war-room', { state: { matchState, captainDecision: finalDecision } })}
                  className="relative w-full overflow-hidden rounded-3xl border border-white/10 group"
                  style={{ height: '90px' }}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4] via-purple-600 to-[#FFD700] opacity-20 group-hover:opacity-35 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4] via-purple-600 to-[#FFD700] bg-[length:200%] animate-[shimmer_4s_linear_infinite] opacity-10" />
                  <div className="absolute inset-px rounded-3xl border border-white/5" />
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-3xl border border-blue-500/20 animate-ping opacity-20" />
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-3">
                      <Swords size={22} className="text-yellow-400" />
                      <span className="font-display font-black text-xl tracking-widest text-white">⚔️ OPEN WAR ROOM</span>
                      <Swords size={22} className="text-yellow-400 scale-x-[-1]" />
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 tracking-widest">SEE THE NEXT 12 BALLS SIMULATED ACROSS 3 PARALLEL UNIVERSES</p>
                  </div>
                </motion.button>

                {/* SHARE CARD TRIGGER */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setShowShareCard(true)}
                  className="w-full mt-4 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #4285F4, #FF6B00, #FFD700)",
                    backgroundSize: "200% 200%",
                    animation: "gradientShift 3s ease infinite",
                    boxShadow: "0 8px 32px rgba(66,133,244,0.4)"
                  }}
                >
                  📸 Generate Share Card
                  <span className="text-sm font-normal opacity-80">1080×1080 · Ready to post</span>
                </motion.button>

              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[60vh] flex flex-col items-center justify-center gap-6"
              >
                <div className="relative flex items-center justify-center">
                  {/* Holographic scanner laser line overlay */}
                  <div className="absolute w-[320px] h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[pulse_1s_infinite] shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10 top-1/2 -translate-y-1/2" />
                  <Swarm3DLoader size={300} interactive={true} />
                </div>
                <div className="text-center z-10">
                  <h2 className="font-display text-3xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-ipl-orange via-yellow-400 to-[#00FF88] tracking-widest uppercase">SYNTHESIZING DEBATE</h2>
                  <p className="text-gray-400 font-mono text-xs max-w-sm mx-auto leading-relaxed">
                    5 customized IPL Agent Personas are debating tactical configurations across 10,000 real-time simulated match paths...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Share Card Modal */}
      {shareCardData && (
        <ShareCardPreview
          isOpen={showShareCard}
          onClose={() => setShowShareCard(false)}
          cardData={shareCardData}
        />
      )}
    </div>
  );
};

export default DecisionOutput;
