import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Activity, Crosshair, MapPin, Droplets, Users, BarChart2, TrendingUp, Zap, Clock } from 'lucide-react';
import ScorecardUploader from '../components/ScorecardUploader';
import BallTracker from '../components/BallTracker';
import PressureMeter from '../components/PressureMeter';

import { useMotionValue, useTransform } from 'framer-motion';

const DEFAULT_MATCH_STATE = {
  innings: 2 as const,
  over: 16,
  ball: 2,
  battingTeam: "MUMBAI INDIANS",
  bowlingTeam: "CHENNAI SUPER KINGS",
  currentScore: 152,
  wickets: 5,
  onStrikeBatter: "Hardik Pandya",
  nonStrikeBatter: "Tim David",
  target: 196,
  bowlers: [
    { name: "Deepak Chahar", oversUsed: 3, economy: 7.2 },
    { name: "Ravindra Jadeja", oversUsed: 3, economy: 8.1 },
    { name: "Matheesha Pathirana", oversUsed: 3, economy: 9.4 },
    { name: "Tushar Deshpande", oversUsed: 2, economy: 11.2 }
  ],
  pitchType: "flat" as const,
  dewFactor: "heavy" as const,
  venue: "Wankhede Stadium",
  impactPlayerAvailable: true,
  impactPlayerName: "Noor Ahmad",
  strategicTimeoutUsed: false,
  recentBalls: "4 1 W 6 4 1",
  cricbuzzUrl: ""
};

const CAPTAIN_DATA: Record<string, { name: string; role: string; img: string; color: string }> = {
  "MUMBAI INDIANS": {
    name: "Hardik Pandya",
    role: "All-Rounder • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/54.png",
    color: "#004BA0"
  },
  "CHENNAI SUPER KINGS": {
    name: "Ruturaj Gaikwad",
    role: "Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/102.png",
    color: "#F1E900"
  },
  "ROYAL CHALLENGERS BENGALURU": {
    name: "Faf du Plessis",
    role: "Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/94.png",
    color: "#EC1C24"
  },
  "KOLKATA KNIGHT RIDERS": {
    name: "Shreyas Iyer",
    role: "Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/12.png",
    color: "#3A225D"
  },
  "DELHI CAPITALS": {
    name: "Rishabh Pant",
    role: "WK-Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/97.png",
    color: "#00008B"
  },
  "GUJARAT TITANS": {
    name: "Shubman Gill",
    role: "Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/62.png",
    color: "#0B2240"
  },
  "LUCKNOW SUPER GIANTS": {
    name: "KL Rahul",
    role: "WK-Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/19.png",
    color: "#0057B8"
  },
  "PUNJAB KINGS": {
    name: "Sam Curran",
    role: "All-Rounder • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/224.png",
    color: "#D71920"
  },
  "RAJASTHAN ROYALS": {
    name: "Sanju Samson",
    role: "WK-Batter • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/258.png",
    color: "#EA1B85"
  },
  "SUNRISERS HYDERABAD": {
    name: "Pat Cummins",
    role: "Bowler • Captain",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/81.png",
    color: "#FF822E"
  }
};

const getCaptain = (teamName: string) => {
  const normalized = (teamName || '').toUpperCase();
  if (normalized.includes('MUMBAI') || normalized.includes('MI')) return CAPTAIN_DATA['MUMBAI INDIANS'];
  if (normalized.includes('CHENNAI') || normalized.includes('CSK')) return CAPTAIN_DATA['CHENNAI SUPER KINGS'];
  if (normalized.includes('BENGALURU') || normalized.includes('RCB') || normalized.includes('BANGALORE')) return CAPTAIN_DATA['ROYAL CHALLENGERS BENGALURU'];
  if (normalized.includes('KOLKATA') || normalized.includes('KKR')) return CAPTAIN_DATA['KOLKATA KNIGHT RIDERS'];
  if (normalized.includes('DELHI') || normalized.includes('DC')) return CAPTAIN_DATA['DELHI CAPITALS'];
  if (normalized.includes('GUJARAT') || normalized.includes('GT')) return CAPTAIN_DATA['GUJARAT TITANS'];
  if (normalized.includes('LUCKNOW') || normalized.includes('LSG')) return CAPTAIN_DATA['LUCKNOW SUPER GIANTS'];
  if (normalized.includes('PUNJAB') || normalized.includes('PBKS')) return CAPTAIN_DATA['PUNJAB KINGS'];
  if (normalized.includes('RAJASTHAN') || normalized.includes('RR')) return CAPTAIN_DATA['RAJASTHAN ROYALS'];
  if (normalized.includes('SUNRISERS') || normalized.includes('SRH')) return CAPTAIN_DATA['SUNRISERS HYDERABAD'];

  return {
    name: "MS Dhoni",
    role: "Tactical Leader",
    img: "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/57.png",
    color: "#F1E900"
  };
};

const TiltCard = ({ children, className, style }: any) => {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const rotateX = useTransform(y, [0, 400], [15, -15]);
  const rotateY = useTransform(x, [0, 400], [-15, 15]);

  function handleMouse(event: any) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    x.set((mouseX / width) * 400);
    y.set((mouseY / height) * 400);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        ...style
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const TacticalParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['rgba(66, 133, 244, 0.25)', 'rgba(249, 115, 22, 0.25)', 'rgba(168, 85, 247, 0.25)'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(66, 133, 244, ${0.08 * (1 - dist / 140)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none -z-20 w-full h-full" />;
};

const MatchInput = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [matchState, setMatchState] = useState(DEFAULT_MATCH_STATE);
  const [showScorecardUploader, setShowScorecardUploader] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  // Derived analytics
  const oversLeft = (20 - matchState.over) - (matchState.ball / 6);
  const runsNeeded = (matchState.target || 0) - matchState.currentScore;
  const requiredRR = oversLeft > 0 ? (runsNeeded / oversLeft) : 999;
  const currentRR = matchState.currentScore / (20 - oversLeft);
  const rrFactor = requiredRR > 18 ? 40 : requiredRR > 15 ? 25 : 10;
  const wicketFactor = matchState.wickets * 8;
  const phaseFactor = matchState.over >= 16 ? 20 : matchState.over >= 12 ? 10 : 0;
  const pressureIndex = Math.min(100, rrFactor + wicketFactor + phaseFactor);
  const rrRatio = currentRR > 0 ? requiredRR / currentRR : 3;
  const logit = 2.1 - (0.7 * rrRatio) - (0.12 * matchState.wickets * 8.5) + (matchState.dewFactor === 'heavy' ? 0.4 : 0);
  const winProb = Math.min(98, Math.max(2, Math.round(100 / (1 + Math.exp(-logit)))));

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Speech recognition not supported."); return; }
    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleVisionResult = (extractedState: any) => {
    const merged = { ...matchState };
    const newAutoFilled = new Set<string>();
    Object.keys(extractedState).forEach(key => {
      if (extractedState[key] !== null && extractedState[key] !== undefined && extractedState[key] !== '') {
        (merged as any)[key] = extractedState[key];
        newAutoFilled.add(key);
      }
    });
    setMatchState(merged as typeof DEFAULT_MATCH_STATE);
    setAutoFilledFields(newAutoFilled);
  };

  const update = (field: string, value: any) => {
    setMatchState(prev => ({ ...prev, [field]: value }));
    setAutoFilledFields(prev => { const n = new Set(prev); n.delete(field); return n; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/decision', { state: { matchState } });
  };

  const GeminiTag = ({ field }: { field: string }) => autoFilledFields.has(field) ? (
    <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold ml-1 tracking-wider">✨ GEMINI</span>
  ) : null;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Tactical Holographic Canvas Particle Network */}
      <TacticalParticles />

      {/* Cinematic background orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none -z-10"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-ipl-orange/8 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* Top nav bar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050B14]/80 backdrop-blur-xl">
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight text-white">
            CAPTAIN'S <span className="text-ipl-orange glow-text">CALL</span>
          </h1>
          <p className="text-[10px] text-blue-400/70 font-mono tracking-[0.2em]">5-AGENT · GEMINI · ADK</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-ipl-neon font-mono bg-ipl-neon/10 border border-ipl-neon/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-ipl-neon rounded-full animate-pulse"></span>
            SYSTEM READY
          </div>
          <button
            onClick={() => setShowScorecardUploader(s => !s)}
            className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full hover:bg-purple-500/20 transition-colors flex items-center gap-2"
          >
            📸 Vision Upload
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-[1280px]">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Scorecard Uploader (collapsible) */}
          <AnimatePresence>
            {showScorecardUploader && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ScorecardUploader onMatchStateExtracted={handleVisionResult} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN SCOREBOARD EDITOR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-[#050B14] rounded-3xl border border-white/8 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-ipl-orange via-yellow-400 to-ipl-orange"></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">

              {/* Column 1: Score */}
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      className="bg-transparent text-ipl-orange font-display font-black tracking-[0.15em] text-base uppercase w-full focus:outline-none hover:opacity-80 transition-opacity"
                      value={matchState.battingTeam}
                      onChange={e => update('battingTeam', e.target.value.toUpperCase())}
                    />
                    <GeminiTag field="battingTeam" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <input
                      type="number"
                      min="0"
                      className="bg-transparent text-[72px] leading-none font-display font-black text-white w-[140px] focus:outline-none"
                      value={matchState.currentScore}
                      onChange={e => update('currentScore', Math.max(0, parseInt(e.target.value) || 0))}
                    />
                    <span className="text-gray-600 text-5xl font-light">/</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="bg-transparent text-5xl leading-none font-display font-bold text-gray-300 w-12 focus:outline-none"
                      value={matchState.wickets}
                      onChange={e => update('wickets', Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 font-mono text-sm">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="bg-white/5 rounded px-2 py-1 w-12 text-center text-white font-bold focus:outline-none focus:bg-white/10"
                      value={matchState.over}
                      onChange={e => update('over', Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                    />
                    <span className="text-gray-600">.</span>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      className="bg-white/5 rounded px-2 py-1 w-10 text-center text-white font-bold focus:outline-none focus:bg-white/10"
                      value={matchState.ball}
                      onChange={e => update('ball', Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                    />
                    <span className="text-gray-500">OVS</span>
                    {matchState.target !== undefined && (
                      <>
                        <span className="text-gray-600 mx-1">|</span>
                        <span className="text-gray-500">TGT</span>
                        <input
                          type="number"
                          min="0"
                          className="bg-white/5 rounded px-2 py-1 w-16 text-center text-white font-bold focus:outline-none focus:bg-white/10"
                          value={matchState.target}
                          onChange={e => update('target', Math.max(0, parseInt(e.target.value) || 0))}
                        />
                      </>
                    )}
                  </div>
                </div>
                {/* Ball Tracker */}
                <div className="mt-6">
                  <p className="text-[10px] text-gray-600 tracking-widest font-bold uppercase mb-2">Last 6 Balls</p>
                  <BallTracker recentBalls={matchState.recentBalls} />
                  <input
                    type="text"
                    className="mt-3 w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-ipl-orange text-center"
                    value={matchState.recentBalls}
                    onChange={e => update('recentBalls', e.target.value)}
                    placeholder="4 1 W 6 4 1"
                  />
                </div>
              </div>

              {/* Column 2: Batters & Required info */}
              <div className="p-8 flex flex-col gap-4 justify-between">
                <div className="space-y-3">
                  <div className="bg-blue-900/20 p-4 rounded-2xl border border-blue-500/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">🏏</div>
                    <div className="flex-1">
                      <p className="text-[9px] text-blue-400 tracking-widest uppercase font-bold">On Strike <GeminiTag field="onStrikeBatter" /></p>
                      <input type="text" className="bg-transparent w-full text-white font-bold text-lg focus:outline-none" value={matchState.onStrikeBatter} onChange={e => update('onStrikeBatter', e.target.value)} />
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 text-gray-400 flex items-center justify-center font-bold">🏃</div>
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-500 tracking-widest uppercase font-bold">Non Strike <GeminiTag field="nonStrikeBatter" /></p>
                      <input type="text" className="bg-transparent w-full text-white font-bold text-lg focus:outline-none" value={matchState.nonStrikeBatter} onChange={e => update('nonStrikeBatter', e.target.value)} />
                    </div>
                  </div>
                  <div className="bg-red-900/20 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center text-sm">🎯</div>
                    <div className="flex-1">
                      <p className="text-[9px] text-red-400 tracking-widest uppercase font-bold">Bowling Team <GeminiTag field="bowlingTeam" /></p>
                      <input type="text" className="bg-transparent w-full text-white font-bold uppercase tracking-wide text-sm focus:outline-none" value={matchState.bowlingTeam} onChange={e => update('bowlingTeam', e.target.value.toUpperCase())} />
                    </div>
                  </div>
                </div>

                {/* Required RR display */}
                {matchState.innings === 2 && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[9px] text-gray-500 tracking-widest mb-1">RRR</p>
                      <p className={`font-display font-bold text-xl ${requiredRR > 18 ? 'text-red-400' : requiredRR > 14 ? 'text-amber-400' : 'text-green-400'}`}>
                        {requiredRR > 99 ? '∞' : requiredRR.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[9px] text-gray-500 tracking-widest mb-1">NEED</p>
                      <p className="font-display font-bold text-xl text-white">{runsNeeded}</p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[9px] text-gray-500 tracking-widest mb-1">OVERS</p>
                      <p className="font-display font-bold text-xl text-white">{oversLeft.toFixed(1)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 3: Bowling Captain 3D Hologram Card */}
              {(() => {
                const bowlingCaptain = getCaptain(matchState.bowlingTeam);
                return (
                  <div className="p-8 flex flex-col justify-between items-center bg-black/10">
                    <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase self-start flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> COMMAND DIRECTORY
                    </p>
                    
                    <TiltCard className="relative w-full h-[190px] rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between p-4 cursor-pointer bg-gradient-to-br from-white/5 to-transparent shadow-lg">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(66,133,244,0.06),rgba(0,0,0,0),rgba(249,115,22,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent group-hover:translate-y-[-100%] transition-transform duration-1000 ease-out" />
                      
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <p className="text-[9px] font-mono uppercase text-gray-400 tracking-wider">TACTICAL CAPTAIN</p>
                          <p className="font-display font-black text-sm text-white tracking-wide uppercase leading-tight mt-0.5">
                            {bowlingCaptain.name}
                          </p>
                        </div>
                        <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest">
                          ACTIVE
                        </span>
                      </div>

                      {/* Big floating captain photo */}
                      <div className="absolute bottom-0 right-1 w-24 h-24 pointer-events-none group-hover:scale-110 transition-transform duration-300 ease-out z-0 overflow-visible flex items-end">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#050B14] to-transparent opacity-40 bottom-[-10px] z-10" />
                        <img
                          src={bowlingCaptain.img}
                          alt={bowlingCaptain.name}
                          className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] filter brightness-95 group-hover:brightness-110 transition-all duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://documents.iplt20.com/ipl/IPLHEADSHOTS/2024/57.png";
                          }}
                        />
                      </div>

                      <div className="z-10 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/5 w-[65%]">
                        <p className="text-[8px] text-gray-500 font-mono leading-none">{bowlingCaptain.role}</p>
                        <p className="text-[9px] font-bold text-gray-300 mt-1 uppercase font-mono tracking-wider truncate" title={matchState.bowlingTeam}>
                          {matchState.bowlingTeam}
                        </p>
                      </div>
                    </TiltCard>
                    
                    <div className="w-full flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                      <span className="text-[9px] font-mono text-gray-500">COMMS STATUS</span>
                      <span className="text-[9px] font-mono text-blue-400 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> SECURE LINK
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Column 4: Live Telemetry */}
              <div className="p-8 flex flex-col items-center gap-6">
                <p className="text-[10px] text-gray-500 tracking-widest font-bold uppercase self-start flex items-center gap-2">
                  <BarChart2 size={12} className="text-blue-400" /> Live Telemetry
                </p>
                <PressureMeter value={pressureIndex} size={180} />

                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-mono">WIN PROBABILITY</span>
                    <span className={`text-xs font-bold font-mono ${winProb > 50 ? 'text-green-400' : 'text-red-400'}`}>{winProb}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${winProb}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: winProb > 50 ? 'linear-gradient(90deg, #00FF88, #4ade80)' : 'linear-gradient(90deg, #FF3B3B, #f87171)', boxShadow: '0 0 10px currentColor' }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-gray-600">{matchState.bowlingTeam.split(' ')[0]}</span>
                    <span className="text-[9px] text-gray-600">{matchState.battingTeam.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CONDITIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-3xl p-6 border border-white/5">
              <h3 className="font-display font-bold text-sm tracking-widest uppercase mb-5 flex items-center gap-2 text-gray-300">
                <TrendingUp size={16} className="text-ipl-orange" /> Environmental Conditions
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Venue', icon: MapPin, key: 'venue', options: ['Wankhede Stadium', 'M. Chinnaswamy Stadium', 'Eden Gardens', 'Narendra Modi Stadium', 'Chepauk Stadium'] },
                  { label: 'Pitch', icon: Crosshair, key: 'pitchType', options: [{ v: 'flat', l: 'Flat' }, { v: 'turning', l: 'Turning' }, { v: 'two-paced', l: 'Two-Paced' }, { v: 'bouncy', l: 'Bouncy' }] },
                  { label: 'Dew', icon: Droplets, key: 'dewFactor', options: [{ v: 'none', l: 'None' }, { v: 'light', l: 'Light' }, { v: 'heavy', l: 'Heavy' }] }
                ].map(({ label, icon: Icon, key, options }) => (
                  <div key={key} className="bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-2">
                      <Icon size={10} /> {label}
                    </label>
                    <select
                      className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                      value={(matchState as any)[key]}
                      onChange={e => update(key, e.target.value)}
                    >
                      {options.map((o: any) => (
                        <option key={typeof o === 'string' ? o : o.v} value={typeof o === 'string' ? o : o.v} className="bg-gray-900">
                          {typeof o === 'string' ? o : o.l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-3xl p-6 border border-white/5">
              <h3 className="font-display font-bold text-sm tracking-widest uppercase mb-5 flex items-center gap-2 text-gray-300">
                <Zap size={16} className="text-ipl-orange" /> Tactical Options
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-white font-bold text-sm">Strategic Timeout</p>
                    <p className="text-xs text-gray-400">Has it been deployed?</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={matchState.strategicTimeoutUsed} onChange={e => update('strategicTimeoutUsed', e.target.checked)} />
                    <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ipl-orange"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-white font-bold text-sm">Impact Player Available</p>
                    <input type="text" className="bg-transparent text-gray-400 text-xs mt-1 focus:outline-none focus:text-white w-40" placeholder="Player name..." value={matchState.impactPlayerName || ''} onChange={e => update('impactPlayerName', e.target.value)} />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={matchState.impactPlayerAvailable} onChange={e => update('impactPlayerAvailable', e.target.checked)} />
                    <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-gray-500 tracking-widest uppercase font-bold mb-2 flex items-center gap-2">
                    <Clock size={10} /> Cricbuzz URL (Live Mode)
                  </p>
                  <input type="url" className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-600" placeholder="https://www.cricbuzz.com/live-cricket-scores/..." value={matchState.cricbuzzUrl} onChange={e => update('cricbuzzUrl', e.target.value)} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* EXECUTE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col md:flex-row gap-4">
            <button
              type="button" onClick={handleVoiceInput}
              className={`md:w-1/4 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 border transition-all duration-300 ${isListening ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              {isListening ? <Activity className="animate-bounce" size={20} /> : <Mic size={20} />}
              <span className="font-display tracking-widest text-sm">{isListening ? 'LISTENING...' : 'VOICE'}</span>
            </button>
            <button
              type="submit"
              className="md:flex-1 relative group overflow-hidden py-5 rounded-2xl font-display font-black text-xl tracking-widest shadow-[0_0_50px_rgba(249,115,22,0.25)] hover:shadow-[0_0_80px_rgba(249,115,22,0.45)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ipl-orange via-yellow-500 to-ipl-orange bg-[length:200%] animate-[shimmer_2s_linear_infinite]"></div>
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-4 text-white drop-shadow">
                ⚡ INITIALIZE AGENT SWARM <Users size={24} />
              </span>
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default MatchInput;
