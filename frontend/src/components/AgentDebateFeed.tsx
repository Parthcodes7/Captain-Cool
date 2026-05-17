import React from 'react';
import { motion } from 'framer-motion';

const getAgentColor = (name: string) => {
  switch (name) {
    case 'Stats Analyst': return 'border-blue-500 bg-blue-500/5 text-blue-200';
    case 'The Strategist': return 'border-ipl-orange bg-ipl-orange/5 text-orange-200';
    case 'Devil\'s Advocate': return 'border-red-500 bg-red-500/5 text-red-200';
    case 'The Moderator': return 'border-green-500 bg-green-500/5 text-green-200';
    case 'Commentator': return 'border-ipl-gold bg-yellow-500/5 text-yellow-200';
    default: return 'border-gray-500 bg-gray-500/5 text-gray-200';
  }
};

const getAgentGlow = (name: string) => {
  switch (name) {
    case 'Stats Analyst': return 'shadow-[0_0_15px_rgba(59,130,246,0.2)]';
    case 'The Strategist': return 'shadow-[0_0_15px_rgba(249,115,22,0.2)]';
    case 'Devil\'s Advocate': return 'shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    case 'The Moderator': return 'shadow-[0_0_15px_rgba(34,197,94,0.2)]';
    case 'Commentator': return 'shadow-[0_0_15px_rgba(234,179,8,0.2)]';
    default: return 'shadow-none';
  }
};

const getAgentEmoji = (name: string) => {
  switch (name) {
    case 'Stats Analyst': return '📊';
    case 'The Strategist': return '🧊';
    case 'Devil\'s Advocate': return '🔥';
    case 'The Moderator': return '⚖️';
    case 'Commentator': return '🎙️';
    default: return '🤖';
  }
};

const AgentDebateFeed = ({ events, isProcessing }: { events: any[], isProcessing: boolean }) => {
  return (
    <div className="space-y-4">
      {events.map((event, idx) => {
        const isStatus = event.content?.status !== undefined;
        
        if (isStatus) {
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-gray-400/80 font-mono flex items-center gap-2 ml-4 py-1"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
              <span className="text-blue-300/50">[{event.agentName.toUpperCase()}]</span> {event.content.status}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className={`border-l-4 pl-4 py-3 pr-3 ${getAgentColor(event.agentName)} ${getAgentGlow(event.agentName)} rounded-r-xl backdrop-blur-sm relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-baseline justify-between mb-2 relative z-10">
              <h4 className="font-display font-bold text-sm tracking-wider flex items-center gap-2 text-white">
                <span className="text-xl drop-shadow-md">{getAgentEmoji(event.agentName)}</span>
                {event.agentName.toUpperCase()}
              </h4>
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-60 bg-black/40 px-2 py-1 rounded">
                {event.persona}
              </span>
            </div>
            
            <div className="text-sm opacity-90 overflow-hidden text-ellipsis whitespace-pre-wrap mt-2 font-mono bg-black/50 p-3 rounded-lg max-h-60 overflow-y-auto custom-scrollbar border border-white/5 relative z-10">
              {typeof event.content === 'object' 
                ? JSON.stringify(event.content, null, 2).replace(/[{}"]/g, '')
                : event.content}
            </div>
          </motion.div>
        );
      })}
      
      {isProcessing && events.length === 0 && (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-20 space-y-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-2 h-8 bg-blue-500/20 rounded-full animate-pulse`} style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
          <p className="font-mono text-sm tracking-widest">AWAITING NEURAL INPUT...</p>
        </div>
      )}
    </div>
  );
};

export default AgentDebateFeed;
