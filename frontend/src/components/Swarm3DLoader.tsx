import React, { useEffect, useRef } from 'react';

interface Swarm3DLoaderProps {
  size?: number;
  interactive?: boolean;
}

const Swarm3DLoader: React.FC<Swarm3DLoaderProps> = ({ size = 260, interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const cx = size / 2;
    const cy = size / 2;
    const cameraDistance = 220;

    // Define 5 AI Agents
    const agents = [
      { name: 'Stats Analyst', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', text: '📊 STATS' },
      { name: 'The Strategist', color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', text: '🧊 STRATEGY' },
      { name: 'Devil\'s Advocate', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: '🔥 HEURISTIC' },
      { name: 'The Moderator', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', text: '⚖️ MODERATOR' },
      { name: 'Commentator', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '🎙️ COMMENTARY' }
    ];

    // Initialize 3D particle swarm
    const numParticles = 80;
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      speed: number;
      radius: number;
      angle: number;
      orbitRadius: number;
      color: string;
      phase: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = Math.random() * 50 + 40;
      const color = agents[i % agents.length].color;
      particles.push({
        x: orbitRadius * Math.cos(angle),
        y: (Math.random() - 0.5) * 60,
        z: orbitRadius * Math.sin(angle),
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        radius: Math.random() * 1.5 + 0.5,
        angle,
        orbitRadius,
        color,
        phase: Math.random() * 100
      });
    }

    // Interactive mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - cx;
      const my = e.clientY - rect.top - cy;
      mouseRef.current.targetX = (mx / cx) * 0.5;
      mouseRef.current.targetY = (my / cy) * 0.5;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    let globalRotationX = 0;
    let globalRotationY = 0;
    let pulseTime = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      pulseTime += 0.03;

      // Smooth mouse rotation dampening
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      globalRotationY += 0.015 + mouseRef.current.x * 0.05;
      globalRotationX = (Math.sin(pulseTime * 0.2) * 0.2) + mouseRef.current.y * 0.4;

      // Project 3D to 2D
      const project = (x3d: number, y3d: number, z3d: number) => {
        // Yaw (Rotation Y)
        const rotY_x = x3d * Math.cos(globalRotationY) - z3d * Math.sin(globalRotationY);
        const rotY_z = x3d * Math.sin(globalRotationY) + z3d * Math.cos(globalRotationY);

        // Pitch (Rotation X)
        const rotX_y = y3d * Math.cos(globalRotationX) - rotY_z * Math.sin(globalRotationX);
        const rotX_z = y3d * Math.sin(globalRotationX) + rotY_z * Math.cos(globalRotationX);

        const scale = cameraDistance / (cameraDistance + rotX_z);
        return {
          x: cx + rotY_x * scale,
          y: cy + rotX_y * scale,
          z: rotX_z,
          scale
        };
      };

      // Draw futuristic orbital path tracks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let r = 50; r <= 90; r += 20) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 1. Calculate 3D positions of the 5 Agent Cores
      const projectedAgents = agents.map((agent, i) => {
        const theta = (i * Math.PI * 2) / agents.length + pulseTime * 0.3;
        const radius = 65 + Math.sin(pulseTime + i) * 6; // Breathing float
        const x3d = radius * Math.cos(theta);
        const y3d = Math.sin(pulseTime * 1.5 + i) * 12;
        const z3d = radius * Math.sin(theta);

        const proj = project(x3d, y3d, z3d);
        const pulseSize = 8 + Math.sin(pulseTime * 3 + i) * 2;

        return {
          ...agent,
          proj,
          pulseSize,
          x3d,
          y3d,
          z3d
        };
      });

      // Sort items by Z (depth-sorting for accurate 3D layering!)
      const allObjects: Array<
        | { type: 'agent'; z: number; data: typeof projectedAgents[0] }
        | { type: 'particle'; z: number; data: typeof particles[0]; proj: any }
      > = [];

      projectedAgents.forEach((agent) => {
        allObjects.push({ type: 'agent', z: agent.proj.z, data: agent });
      });

      // Update and project orbital particles
      particles.forEach((p) => {
        p.angle += p.speed;
        p.x = p.orbitRadius * Math.cos(p.angle);
        p.y += Math.sin(pulseTime * 0.8 + p.phase) * 0.2; // Add soft wavy movement
        p.z = p.orbitRadius * Math.sin(p.angle);

        const proj = project(p.x, p.y, p.z);
        allObjects.push({ type: 'particle', z: proj.z, data: p, proj });
      });

      // Depth sort (draw back items first, front items last)
      allObjects.sort((a, b) => b.z - a.z);

      // Render depth-sorted queue
      allObjects.forEach((obj) => {
        if (obj.type === 'particle') {
          const p = obj.data;
          const { x, y, scale } = obj.proj;
          
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.2, scale * 0.6);
          ctx.beginPath();
          ctx.arc(x, y, p.radius * scale, 0, Math.PI * 2);
          ctx.fill();

          // Connect particles to nearby agents with glowing lightning arcs
          projectedAgents.forEach((agent) => {
            const dist = Math.hypot(p.x - agent.x3d, p.y - agent.y3d, p.z - agent.z3d);
            if (dist < 40) {
              const alpha = (1 - dist / 40) * 0.35;
              ctx.strokeStyle = agent.color;
              ctx.lineWidth = 0.5 * scale;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(agent.proj.x, agent.proj.y);
              ctx.stroke();
            }
          });
          ctx.globalAlpha = 1;
        } else {
          // Render Agent Core Node
          const agent = obj.data;
          const { x, y, scale } = agent.proj;

          // Glowing background aura
          ctx.fillStyle = agent.color;
          ctx.globalAlpha = 0.15;
          ctx.beginPath();
          ctx.arc(x, y, agent.pulseSize * 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Glowing core circle
          ctx.globalAlpha = 1.0;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, agent.pulseSize * scale);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, agent.color);
          grad.addColorStop(1, 'transparent');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, agent.pulseSize * 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Floating neon text label (only render for positive scaling for clarity)
          if (scale > 0.65) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = `black ${Math.max(8, 9 * scale)}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = agent.color;
            ctx.shadowBlur = 4;
            ctx.fillText(agent.text, x, y - (agent.pulseSize * 1.6 * scale));
            ctx.shadowBlur = 0; // Reset shadow
          }
        }
      });

      // Central core black hole ring representing "SWARM SYNAPSE"
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + Math.sin(pulseTime * 2.5) * 2, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [size, interactive]);

  return (
    <div className="relative flex items-center justify-center">
      {/* 3D Hologram Overlay Grid background */}
      <div className="absolute inset-0 bg-radial-grid opacity-[0.03] pointer-events-none" />
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing drop-shadow-[0_0_30px_rgba(59,130,246,0.15)]"
      />
    </div>
  );
};

export default Swarm3DLoader;
