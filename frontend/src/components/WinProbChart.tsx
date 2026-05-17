import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WinProbChartProps {
  winProbability: number;
  delta?: number;
  label?: string;
}

const WinProbChart: React.FC<WinProbChartProps> = ({ winProbability, delta, label = 'Win Probability' }) => {
  const clamp = Math.min(100, Math.max(0, winProbability));
  const color = clamp > 60 ? '#00FF88' : clamp > 40 ? '#f59e0b' : '#FF3B3B';
  const data = [{ value: clamp, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="72%" outerRadius="100%"
            startAngle={90} endAngle={-270}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: 'rgba(255,255,255,0.04)', radius: 8 } as any}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-black text-3xl" style={{ color }}>{clamp}%</span>
          {delta !== undefined && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs font-bold flex items-center gap-1 ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {delta >= 0 ? '+' : ''}{delta}%
            </motion.span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 tracking-widest uppercase font-bold">{label}</p>
    </div>
  );
};

export default WinProbChart;
