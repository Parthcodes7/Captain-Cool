import React from 'react';
import { motion } from 'framer-motion';

interface PressureMeterProps {
  value: number; // 0-100
  size?: number;
}

const PressureMeter: React.FC<PressureMeterProps> = ({ value, size = 160 }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  // Calculate layout coordinates
  const cx = size / 2;
  const cy = (size / 2) + 15;
  const radius = (size / 2) - 20;
  const circumference = Math.PI * radius; // Semicircle length
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Determine current active color state
  const label = clampedValue < 35 ? 'COMFORTABLE' : clampedValue < 70 ? 'BUILDING PRESSURE' : 'CRISIS MODE';
  const color = clampedValue < 35 ? '#00FF88' : clampedValue < 70 ? '#f59e0b' : '#FF3B3B';
  const glowColor = clampedValue < 35 ? 'rgba(0,255,136,0.3)' : clampedValue < 70 ? 'rgba(245,158,11,0.3)' : 'rgba(255,59,59,0.4)';

  const startX = cx - radius;
  const endX = cx + radius;
  const pathD = `M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`;

  // Angle for the floating needle/pointer (0 is right, Math.PI is left)
  const angleRad = Math.PI * (1 - clampedValue / 100);
  
  // Sleek floating needle that doesn't cross the center space!
  const needleStartX = cx + (radius - 12) * Math.cos(angleRad);
  const needleStartY = cy - (radius - 12) * Math.sin(angleRad);
  const needleEndX = cx + (radius + 8) * Math.cos(angleRad);
  const needleEndY = cy - (radius + 8) * Math.sin(angleRad);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative select-none" style={{ width: size, height: cy + 15 }}>
        <svg width={size} height={cy + 15} viewBox={`0 0 ${size} ${cy + 15}`} className="overflow-visible">
          {/* Neon Backdrop Glow Filters */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF88" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#FF3B3B" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Active Progress Semicircle */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#meterGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
          />

          {/* Floating Neon Target Dot running along the track */}
          <motion.circle
            cx={cx + radius * Math.cos(angleRad)}
            cy={cy - radius * Math.sin(angleRad)}
            r="5"
            fill="white"
            style={{ filter: 'drop-shadow(0 0 8px #ffffff)' }}
            animate={{
              cx: cx + radius * Math.cos(angleRad),
              cy: cy - radius * Math.sin(angleRad)
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          />

          {/* Sleek Floating Radial Needle (Guaranteed never to overlap center text) */}
          <motion.line
            x1={needleStartX}
            y1={needleStartY}
            x2={needleEndX}
            y2={needleEndY}
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={{
              x1: needleStartX,
              y1: needleStartY,
              x2: needleEndX,
              y2: needleEndY
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />

          {/* Center Info Readout (Clean & Perfect Spacing) */}
          <text
            x={cx}
            y={cy - 22}
            textAnchor="middle"
            fill="white"
            fontSize={size > 150 ? '36' : '28'}
            fontFamily="Orbitron, sans-serif"
            fontWeight="900"
            className="tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          >
            {clampedValue}
          </text>
          
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={size > 150 ? '10' : '8'}
            fontFamily="Outfit, sans-serif"
            fontWeight="bold"
            className="tracking-[0.15em]"
          >
            PRESSURE INDEX
          </text>
        </svg>
      </div>
      
      {/* Dynamic Status Badge */}
      <div className="text-center">
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] md:text-xs font-display font-black tracking-[0.2em] px-4 py-1.5 rounded-full border transition-all duration-300"
          style={{ color, borderColor: `${color}40`, background: `${color}10`, boxShadow: `0 0 15px ${color}15` }}
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
};

export default PressureMeter;
