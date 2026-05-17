import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroSplashProps {
  onComplete: () => void;
}

const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Procedural Sound Synthesis (No files required!)
  const playImpactSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      // Sound 1: Deep Stadium Sub-Bass Boom
      const bassOsc = audioCtx.createOscillator();
      const bassGain = audioCtx.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(audioCtx.destination);
      
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(160, audioCtx.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 0.8);
      
      bassGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      bassOsc.start();
      bassOsc.stop(audioCtx.currentTime + 0.8);

      // Sound 2: Crisp Leather-on-Willow "Crack"
      const crackOsc = audioCtx.createOscillator();
      const crackGain = audioCtx.createGain();
      crackOsc.connect(crackGain);
      crackGain.connect(audioCtx.destination);
      
      crackOsc.type = 'triangle';
      crackOsc.frequency.setValueAtTime(950, audioCtx.currentTime);
      crackOsc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);
      
      crackGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      crackGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      
      crackOsc.start();
      crackOsc.stop(audioCtx.currentTime + 0.12);

      // Sound 3: High-frequency metallic spark resonance
      const sparkOsc = audioCtx.createOscillator();
      const sparkGain = audioCtx.createGain();
      sparkOsc.connect(sparkGain);
      sparkGain.connect(audioCtx.destination);

      sparkOsc.type = 'sawtooth';
      sparkOsc.frequency.setValueAtTime(2200, audioCtx.currentTime);
      sparkOsc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.25);

      sparkGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      sparkGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      sparkOsc.start();
      sparkOsc.stop(audioCtx.currentTime + 0.25);

    } catch (e) {
      console.warn('Audio play failed/blocked by browser policies:', e);
    }
  };

  const playClickSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  useEffect(() => {
    // Generate real-time neural system logs
    const logPool = [
      '⚡ CONNECTING TO GEMINI NEURAL GATEWAY...',
      '🧬 INITIALIZING DECISION MATRIX...',
      '📊 CACHING IPL HISTORICAL DATASETS (15 YEARS)...',
      '🤖 ALIGNING AGENT PERSONALITIES (DHONI/KOHLI/ROHIT)...',
      '🧠 BUILDING REAL-TIME TACTICAL PROJECTIONS...',
      '📶 SSE FEED SYNCED AT 37ms LATENCY...',
      '🛡️ LOGISTIC REGRESSION MATRIX STABILIZED...',
      '🏆 READY FOR HACKATHON ARENA!'
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logPool.length) {
        setSystemLogs(prev => [...prev.slice(-3), logPool[logIdx]]);
        logIdx++;
      }
    }, 550);

    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic Ambient Interactive Star field
    class AmbientStar {
      x: number;
      y: number;
      ox: number;
      oy: number;
      size: number;
      color: string;
      angle: number;
      speed: number;

      constructor() {
        this.x = this.ox = Math.random() * width;
        this.y = this.oy = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.color = Math.random() > 0.6 ? '#4285F4' : 'rgba(255,255,255,0.2)';
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.2 + 0.05;
      }

      update() {
        // Star movement
        this.ox += Math.cos(this.angle) * this.speed;
        this.oy += Math.sin(this.angle) * this.speed;

        // Interactive mouse gravity push/pull
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.x = this.ox - (dx / dist) * force * 15;
          this.y = this.oy - (dy / dist) * force * 15;
        } else {
          this.x += (this.ox - this.x) * 0.1;
          this.y += (this.oy - this.y) * 0.1;
        }

        // Boundary wrap
        if (this.ox < 0) this.ox = width;
        if (this.ox > width) this.ox = 0;
        if (this.oy < 0) this.oy = height;
        if (this.oy > height) this.oy = 0;
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Exploding Spark Particle
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
      decay: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.alpha = 1;
        this.size = Math.random() * 4 + 1.5;
        this.decay = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // gravity
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.shadowBlur = 15;
        c.shadowColor = this.color;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Epic Shockwave Ring
    class Shockwave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
      lineWidth: number;

      constructor(x: number, y: number, color: string, maxRadius = 220) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = maxRadius;
        this.alpha = 1;
        this.color = color;
        this.lineWidth = Math.random() * 6 + 2;
      }

      update() {
        this.radius += 6;
        this.alpha = Math.max(0, 1 - this.radius / this.maxRadius);
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.strokeStyle = this.color;
        c.shadowBlur = 25;
        c.shadowColor = this.color;
        c.lineWidth = this.lineWidth;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }

    const stars: AmbientStar[] = Array.from({ length: 120 }, () => new AmbientStar());
    let particles: Particle[] = [];
    let shockwaves: Shockwave[] = [];
    
    // Cricket ball with dynamic trajectory & flame trail
    let ball = {
      x: width * 0.05,
      y: height * 0.25,
      z: 0.08,
      targetX: width * 0.5,
      targetY: height * 0.5,
      speedX: (width * 0.5 - width * 0.05) / 80,
      speedY: (height * 0.5 - height * 0.25) / 80,
      speedZ: (1.4 - 0.08) / 80,
      hasHit: false,
      history: [] as { x: number; y: number; z: number }[]
    };

    // Premium detailed 3D Bat
    let bat = {
      angle: -Math.PI / 3,
      swingSpeed: 0.09,
      isSwinging: false,
      length: 220,
      width: 32,
      x: width * 0.65,
      y: height * 0.72
    };

    let frameCount = 0;
    let cameraShake = 0;
    let flashAlpha = 0; // High speed camera flash on impact

    const animate = () => {
      // Cinematic deep backdrop with dynamic lighting
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height));
      bgGrad.addColorStop(0, '#0c1d38');
      bgGrad.addColorStop(0.7, '#050a14');
      bgGrad.addColorStop(1, '#02050a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Camera Shake
      ctx.save();
      if (cameraShake > 0) {
        const dx = (Math.random() - 0.5) * cameraShake;
        const dy = (Math.random() - 0.5) * cameraShake;
        ctx.translate(dx, dy);
        cameraShake *= 0.92;
      }

      // Draw interactive ambient stars
      stars.forEach(star => {
        star.update();
        star.draw(ctx);
      });

      // Swing Trigger
      frameCount++;
      if (frameCount === 56) {
        bat.isSwinging = true;
      }

      // 1. Perspective Ball Flight & Flame trail
      if (!ball.hasHit) {
        // Record trail history
        ball.history.push({ x: ball.x, y: ball.y, z: ball.z });
        if (ball.history.length > 15) ball.history.shift();

        ball.x += ball.speedX;
        ball.y += ball.speedY;
        ball.z += ball.speedZ;

        // Collision Check: Ball hits Bat
        if (ball.x >= width * 0.5 - 15) {
          ball.hasHit = true;
          cameraShake = 28;
          flashAlpha = 0.95; // Epic impact flash
          
          playImpactSound(); // Trigger synthesized bass/crack audio

          // Hyper Sparks Explosion
          for (let i = 0; i < 90; i++) {
            particles.push(new Particle(width * 0.5, height * 0.5, '#FFD700'));
            particles.push(new Particle(width * 0.5, height * 0.5, '#FF6B00'));
            particles.push(new Particle(width * 0.5, height * 0.5, '#00FF88'));
          }

          // Triple-ring Shockwave
          shockwaves.push(new Shockwave(width * 0.5, height * 0.5, '#00FF88', 250));
          shockwaves.push(new Shockwave(width * 0.5, height * 0.5, '#FFD700', 320));
          shockwaves.push(new Shockwave(width * 0.5, height * 0.5, '#4285F4', 400));
        }
      } else {
        ball.x -= ball.speedX * 2.8;
        ball.y -= ball.speedY * 0.9;
        ball.z += 0.12; // Hyper-zoom past camera
      }

      // Draw Ball Trail (Comet Plasma Effect)
      ctx.save();
      for (let i = 0; i < ball.history.length; i++) {
        const pt = ball.history[i];
        const trailAlpha = (i / ball.history.length) * 0.45;
        const trailRadius = 24 * pt.z * (i / ball.history.length);
        
        ctx.fillStyle = `rgba(255, 107, 0, ${trailAlpha})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FF6B00';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, trailRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Animate Swing
      if (bat.isSwinging) {
        bat.angle += bat.swingSpeed;
        if (bat.angle > Math.PI / 5) {
          bat.angle = Math.PI / 5;
        }
      }

      // 3. Draw Premium 3D Extruded Bat
      ctx.save();
      ctx.translate(bat.x, bat.y);
      ctx.rotate(bat.angle);
      
      // Handle Rubber grip pattern
      const handleGrad = ctx.createLinearGradient(-6, -bat.length, 6, -bat.length);
      handleGrad.addColorStop(0, '#111');
      handleGrad.addColorStop(0.3, '#333');
      handleGrad.addColorStop(0.6, '#444');
      handleGrad.addColorStop(1, '#111');
      
      ctx.fillStyle = handleGrad;
      ctx.fillRect(-7, -bat.length - 70, 14, 70);

      // Grip winding lines (futuristic look)
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 1;
      for (let y = -bat.length - 70; y < -bat.length; y += 8) {
        ctx.beginPath();
        ctx.moveTo(-7, y);
        ctx.lineTo(7, y + 2);
        ctx.stroke();
      }

      // Willow Blade with 3D extrusion sides
      const woodSideGrad = ctx.createLinearGradient(-bat.width / 2, -bat.length, -bat.width / 2 + 6, -bat.length);
      woodSideGrad.addColorStop(0, '#8b5a2b');
      woodSideGrad.addColorStop(1, '#b58a55');

      const woodFaceGrad = ctx.createLinearGradient(-bat.width / 2 + 6, -bat.length, bat.width / 2, -bat.length);
      woodFaceGrad.addColorStop(0, '#f5deb3');
      woodFaceGrad.addColorStop(0.5, '#ffecd1');
      woodFaceGrad.addColorStop(1, '#d2b48c');

      // Shadow overlay
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 15;

      // Draw Side edge
      ctx.fillStyle = woodSideGrad;
      ctx.fillRect(-bat.width / 2, -bat.length, 6, bat.length);

      // Draw Main Face
      ctx.fillStyle = woodFaceGrad;
      ctx.fillRect(-bat.width / 2 + 6, -bat.length, bat.width - 6, bat.length);

      // Wood grains
      ctx.strokeStyle = 'rgba(139, 90, 43, 0.15)';
      ctx.lineWidth = 1.5;
      for (let x = -bat.width / 2 + 10; x < bat.width / 2; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, -bat.length);
        ctx.lineTo(x + (Math.random() - 0.5) * 4, 0);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Draw Particles & Shockwaves
      particles.forEach((p, idx) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.splice(idx, 1);
      });

      shockwaves.forEach((s, idx) => {
        s.update();
        s.draw(ctx);
        if (s.alpha <= 0) shockwaves.splice(idx, 1);
      });

      // 5. Draw 3D Cricket Ball with seams and leather shading
      if (ball.z > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 25 * ball.z;
        ctx.shadowOffsetY = 20 * ball.z;

        const ballRadius = 26 * ball.z;
        const ballGrad = ctx.createRadialGradient(
          ball.x - ballRadius * 0.35,
          ball.y - ballRadius * 0.35,
          ballRadius * 0.05,
          ball.x,
          ball.y,
          ballRadius
        );
        ballGrad.addColorStop(0, '#ffa3a3');
        ballGrad.addColorStop(0.5, '#e60000');
        ballGrad.addColorStop(1, '#3b0000');

        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3D curved cricket seam
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5 * ball.z;
        ctx.beginPath();
        ctx.ellipse(ball.x, ball.y, ballRadius * 0.92, ballRadius * 0.28, 0.55, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore(); // restore from camera shake

      // 6. Draw Fullscreen Impact Flash overlay
      if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
        flashAlpha -= 0.06; // fade flash out
      }

      // Increment progress bar state
      setProgress(prev => {
        if (prev >= 100) {
          setShowButton(true);
          return 100;
        }
        return prev + 0.72;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden bg-[#050A14] flex flex-col justify-between items-center py-12 px-4">
      {/* Immersive 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Cinematic HUD Heading */}
      <div className="relative text-center select-none pointer-events-none mt-6">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: 'spring', bounce: 0.45 }}
        >
          <span className="text-[10px] tracking-[0.55em] font-mono text-ipl-orange font-black bg-ipl-orange/15 border border-ipl-orange/30 px-5 py-2 rounded-full uppercase glow-text">
            5-Agent Debate Engine
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-black text-white mt-8 tracking-tight">
            CAPTAIN'S <span className="text-ipl-orange glow-text">CALL</span>
          </h1>
          
          {/* Cyberpunk System Logs */}
          <div className="mt-8 flex flex-col items-center gap-1.5 font-mono text-[9px] text-blue-400/80 tracking-widest max-w-sm">
            <AnimatePresence>
              {systemLogs.map((log, i) => (
                <motion.p
                  key={log}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  {log}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Futuristic Progress Hud & Button */}
      <div className="w-full max-w-sm relative flex flex-col items-center gap-6 mb-6 z-10">
        <AnimatePresence mode="wait">
          {!showButton ? (
            <motion.div
              key="loading"
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center gap-3 bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/5"
            >
              <div className="w-full h-[4px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-ipl-orange via-yellow-400 to-ipl-neon shadow-[0_0_10px_#FF6B00]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between w-full text-[9px] font-mono text-gray-500 tracking-wider">
                <span>NEURAL ENGINE BOOTING</span>
                <span className="text-white font-bold">{Math.floor(progress)}%</span>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="enter"
              initial={{ scale: 0.75, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 10 }}
              onClick={() => {
                playClickSound();
                // Brief delay so sound completes before splash fades
                setTimeout(onComplete, 250);
              }}
              className="relative group overflow-hidden px-12 py-6 rounded-2xl font-display font-black text-xl tracking-[0.25em] shadow-[0_0_60px_rgba(0,255,136,0.3)] border border-ipl-neon/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ipl-neon via-[#3b82f6] to-ipl-neon bg-[length:200%] animate-[shimmer_2s_linear_infinite]" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-white drop-shadow">
                ENTER ARENA
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntroSplash;
