import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const FallingPetals: React.FC<{ petalCount?: number }> = ({ petalCount = 40 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

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

    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 10 + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // A simple function to draw a rose petal shape
    const drawPetal = (ctx: CanvasRenderingContext2D, p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.size / 20, p.size / 20); // Normalize size
      ctx.globalAlpha = p.opacity;

      // Draw petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-15, -10, -20, -30, 0, -40);
      ctx.bezierCurveTo(20, -30, 15, -10, 0, 0);
      
      // Petal gradient
      const gradient = ctx.createLinearGradient(0, -40, 0, 0);
      gradient.addColorStop(0, '#ff1493'); // deep pink
      gradient.addColorStop(1, '#8b0000'); // dark red
      
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Wrap around
        if (p.y > height + 50) {
          p.y = -50;
          p.x = Math.random() * width;
        }
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        drawPetal(ctx, p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [petalCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
