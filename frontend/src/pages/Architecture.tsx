import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const agents = [
  {
    name: 'Stats Analyst',
    persona: 'Sanjay Manjrekar × Cricviz',
    emoji: '📊',
    color: '#3b82f6',
    badge: 'DATA',
    tools: ['fetchLiveMatchData', 'calculateWinProbability', 'getWeatherAndDew', 'getBowlerStats'],
    systemPrompt: `You are a hybrid of Cricviz analytics and an ESPN research desk. You have access to 15 years of T20 data. Your analysis must include:
- Pressure Index: composite score combining run rate pressure, wicket pressure, and phase pressure (0=none, 100=maximum)
- Momentum Score: based on last 3 overs run rate vs match average
- Match Tempo Tag: 'controlled chase', 'panic mode', 'comfortable cruise', 'dead rubber', 'last-over thriller', 'powerplay blitz'
- Bowling fatigue index per bowler (overs remaining vs overs used)
- Batter danger score: who is more dangerous and why
Always output strictly valid JSON. Never hallucinate stats.`,
    exampleOutput: `{ "pressureIndex": 94, "matchPhase": "death", "winProbability": 18, "momentumTag": "panic mode" }`
  },
  {
    name: 'The Strategist',
    persona: 'MS Dhoni',
    emoji: '🧊',
    color: '#f97316',
    badge: 'STRATEGY',
    tools: ['getFieldPlacementSuggestion', 'getBowlerStats'],
    systemPrompt: `You are MS Dhoni in the dugout at over 16, walkie-talkie in hand. You do not panic. You have seen every situation before. Your decisions are always backed by process, not panic.
Mandatory decision structure:
- FIRST: What does the data say? (cite the pressure index and win prob)
- SECOND: What do your instincts say?
- THIRD: What will the OPPOSITION CAPTAIN expect you to do? Do the opposite if it gives you an edge.
- FOURTH: The actual call. One sentence. No hedging.
- FIFTH: The backup plan if it goes wrong in the first 2 balls.
Speech pattern: terse, uses 'process', 'back him', 'numbers say'.`,
    exampleOutput: `{ "nextBowler": "Pathirana", "timeout": { "callNow": true }, "primaryReasoning": "Numbers say Pathirana at death. Back the process." }`
  },
  {
    name: "Devil's Advocate",
    persona: 'Virat Kohli',
    emoji: '🔥',
    color: '#ef4444',
    badge: 'CHALLENGE',
    tools: ['getBowlerStats'],
    systemPrompt: `You are Virat Kohli on the field, passionate and intense. The Strategist just made a call. You MUST find the flaw.
Your challenge framework:
- THE HUNCH: What does your gut say is wrong here?
- THE DATA POINT THEY MISSED: Find one stat that undermines the Strategist's reasoning
- THE ALTERNATIVE: What would YOU do instead?
- THE WORST CASE: If the Strategist is wrong, what does it cost in win probability terms?
- CONFIDENCE IN YOUR COUNTER: 0-100. Be honest.
Never challenge for the sake of it — only if you genuinely believe it will cost the team the match.`,
    exampleOutput: `{ "challenges": [{"point": "Economy too high", "reasoning": "9.4 in death is dangerous"}], "confidenceInCounter": 72 }`
  },
  {
    name: 'The Moderator',
    persona: 'Rohit Sharma',
    emoji: '⚖️',
    color: '#22c55e',
    badge: 'VERDICT',
    tools: [],
    systemPrompt: `You are Rohit Sharma. You have heard both sides. Your job is not to pick a winner — it is to find THE TRUTH.
Evaluation framework:
- Does Kohli's challenge have DATA behind it or is it just instinct?
- Does Dhoni's original call account for the CURRENT over, not generic strategy?
- Is there a THIRD option neither suggested?
Decision rule: if Kohli's confidence > 65 AND his data point is valid, Dhoni must revise. Otherwise Dhoni's call stands.
Always provide the counterfactual: 'If wrong call made, expect win probability to drop by X% in next 2 overs'.`,
    exampleOutput: `{ "finalDecision": {...}, "wasRevised": false, "winProbImpact": "+5%", "counterfactual": "Jadeja would have leaked 18 runs." }`
  },
  {
    name: 'Commentator',
    persona: 'Harsha Bhogle',
    emoji: '🎙️',
    color: '#eab308',
    badge: 'BROADCAST',
    tools: [],
    systemPrompt: `You are Harsha Bhogle. This is your moment. The entire debate has happened. The call has been made.
Your job: translate everything into the most beautiful cricket commentary paragraph ever written for this situation.
Rules:
- Open with a scene-setting line (the crowd, the atmosphere, the stakes)
- The DECISION in plain English that a new cricket fan understands
- THE CHESS MOVE: why this is the right call in cricket language
- THE DISSENT: what the other voice said and why it was overruled
- THE COUNTERFACTUAL: one line on what happens if wrong
- Close with a one-line dramatic kicker sentence
Never use: 'win probability', 'logistic', 'model', 'AI', 'agent'.`,
    exampleOutput: `{ "HEADLINE": "PATHIRANA TRUSTED IN THE CRUCIBLE!", "DECISION": "The captain hands the ball to Pathirana...", "CONFIDENCE": "⭐⭐⭐⭐ Bold but calculated." }`
  }
];

const googleStack = [
  { name: 'Gemini 2.5 Flash', color: '#4285F4', desc: 'All 5 agents' },
  { name: 'Gemini Vision', color: '#9b59b6', desc: 'Scorecard OCR' },
  { name: 'Function Calling', color: '#f97316', desc: 'Tool execution' },
  { name: 'Google Search', color: '#00897B', desc: 'Live grounding' },
  { name: 'URL Context', color: '#e91e63', desc: 'Live scraping' },
  { name: 'Context Caching', color: '#F4B400', desc: 'Match memory' },
  { name: 'ADK', color: '#34a853', desc: 'Orchestration' },
  { name: 'Open-Meteo', color: '#0ea5e9', desc: 'Weather data' },
  { name: 'SSE Streaming', color: '#8b5cf6', desc: 'Real-time UI' },
];

const Architecture = () => {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);

  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(20,30,60,0.5)_0%,_transparent_60%)] pointer-events-none -z-10"></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-3">
          SYSTEM <span className="text-ipl-orange glow-text">ARCHITECTURE</span>
        </h1>
        <p className="text-gray-400 text-lg">5-Agent Multi-Model Debate Loop · Built on Google AI Stack</p>
      </motion.div>

      {/* AGENT FLOW DIAGRAM */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-8 border border-white/5 mb-10">
        <h2 className="font-display font-bold text-sm tracking-widest text-gray-400 uppercase mb-8">Multi-Agent Debate Pipeline</h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {/* Flow line background */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2"></div>

          {agents.map((agent, idx) => (
            <React.Fragment key={agent.name}>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedAgent(agent === selectedAgent ? null : agent)}
                className="relative z-10 flex flex-col items-center gap-3 group"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}10)`,
                    border: `2px solid ${agent.color}40`,
                    boxShadow: selectedAgent?.name === agent.name ? `0 0 30px ${agent.color}60` : ''
                  }}
                >
                  {agent.emoji}
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-xs text-white tracking-widest">{agent.name.split(' ').join('\n').toUpperCase()}</p>
                  <p className="text-[9px] text-gray-500 font-mono">{agent.persona}</p>
                </div>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full border" style={{ color: agent.color, borderColor: `${agent.color}40`, background: `${agent.color}10` }}>
                  {agent.badge}
                </span>
              </motion.button>

              {idx < agents.length - 1 && (
                <div className="flex items-center text-gray-600 z-10 text-lg font-bold">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Agent Detail Panel */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="rounded-2xl p-6 border" style={{ borderColor: `${selectedAgent.color}30`, background: `${selectedAgent.color}05` }}>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <span className="text-3xl">{selectedAgent.emoji}</span>
                  <div>
                    <h3 className="font-display font-bold text-white">{selectedAgent.name} — {selectedAgent.persona}</h3>
                    <div className="flex gap-2 mt-1">
                      {selectedAgent.tools.map(t => (
                        <span key={t} className="text-[9px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded font-mono">{t}</span>
                      ))}
                      {selectedAgent.tools.length === 0 && <span className="text-[9px] text-gray-600 font-mono">No external tools</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">System Prompt</p>
                    <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans bg-black/40 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                      {selectedAgent.systemPrompt}
                    </pre>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Example Output</p>
                    <pre className="text-xs text-ipl-neon leading-relaxed bg-black/40 p-4 rounded-xl border border-ipl-neon/10 font-mono max-h-48 overflow-y-auto">
                      {selectedAgent.exampleOutput}
                    </pre>
                    <a href="https://aistudio.google.com" target="_blank" rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      🔗 Open in AI Studio →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* GOOGLE STACK BADGES */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-3xl p-8 border border-white/5 mb-10">
        <h2 className="font-display font-bold text-sm tracking-widest text-gray-400 uppercase mb-6">Google Technology Stack</h2>
        <div className="flex flex-wrap gap-3">
          {googleStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex flex-col items-start gap-1 px-4 py-3 rounded-2xl border"
              style={{ borderColor: `${tech.color}30`, background: `${tech.color}10` }}
            >
              <span className="font-display font-bold text-sm" style={{ color: tech.color }}>{tech.name}</span>
              <span className="text-[9px] text-gray-400 font-mono">{tech.desc}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* DEBATE FLOW MERMAID TEXT */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-3xl p-8 border border-white/5">
        <h2 className="font-display font-bold text-sm tracking-widest text-gray-400 uppercase mb-6">Orchestration Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
          {[
            { round: 'R0', label: 'Data Fetch', sub: 'Stats Analyst runs tools', color: '#3b82f6' },
            { round: 'R1', label: 'Proposal', sub: 'Dhoni proposes strategy', color: '#f97316' },
            { round: 'R2', label: 'Challenge', sub: 'Kohli challenges hard', color: '#ef4444' },
            { round: 'R3', label: 'Defense', sub: 'Dhoni defends if needed', color: '#f97316' },
            { round: 'R4→5', label: 'Verdict', sub: 'Rohit judges, Harsha narrates', color: '#eab308' },
          ].map(step => (
            <div key={step.round} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-sm" style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}30` }}>
                {step.round}
              </div>
              <p className="font-bold text-white text-sm">{step.label}</p>
              <p className="text-[10px] text-gray-500">{step.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-500 font-mono mb-2">REVISION RULE</p>
          <p className="text-sm text-gray-300">If <span className="text-red-400 font-mono">confidenceInCounter {'>'} 65</span> → Strategist must revise. Otherwise original call stands. All rounds stream in real-time via <span className="text-blue-400 font-mono">SSE</span>.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Architecture;
