import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
  color: string;
  pulseSpeed: number;
}

const COSMIC_COLORS = [
  'rgba(255, 78, 0, ',    // Cosmic Ember
  'rgba(233, 193, 118, ',  // Stellar Gold
  'rgba(138, 43, 226, ',   // Quantum Purple
  'rgba(0, 242, 254, ',    // Monolith Cyan
  'rgba(255, 255, 255, ',  // Starlight White
];

export const CosmicDust: React.FC<{ particleCount?: number }> = ({ particleCount = 65 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Handle container resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target) {
          width = canvas.width = entry.contentRect.width || window.innerWidth;
          height = canvas.height = entry.contentRect.height || window.innerHeight;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const baseColor = COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.05, // Upward drifting motion
        alpha: Math.random() * 0.6 + 0.1,
        targetAlpha: Math.random() * 0.7 + 0.1,
        color: baseColor,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Pulse opacity
        if (Math.abs(p.alpha - p.targetAlpha) < 0.01) {
          p.targetAlpha = Math.random() * 0.7 + 0.1;
        } else {
          p.alpha += (p.targetAlpha - p.alpha) * p.pulseSpeed;
        }

        // Screen boundary wrapping
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000"
    />
  );
};
