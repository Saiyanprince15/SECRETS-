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
  imgIndex: number;
  // 3D tumble simulation
  tiltX: number;
  tiltY: number;
  tiltSpeedX: number;
  tiltSpeedY: number;
  // Wind sway
  swayPhase: number;
  swayAmplitude: number;
  swaySpeed: number;
  // Depth layer (0 = far background, 1 = near foreground)
  depth: number;
}

const PETAL_SRCS = ['/petals/petal1.png', '/petals/petal2.png', '/petals/petal3.png'];

export const FallingPetals: React.FC<{ petalCount?: number }> = ({ petalCount = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Handle DPR for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target) {
          width = entry.contentRect.width || window.innerWidth;
          height = entry.contentRect.height || window.innerHeight;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Load petal images
    // Pre-process an image to remove black background
    const removeBlackBg = (img: HTMLImageElement): HTMLCanvasElement => {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.naturalWidth || img.width;
      offscreen.height = img.naturalHeight || img.height;
      const oCtx = offscreen.getContext('2d')!;
      oCtx.drawImage(img, 0, 0);
      const imageData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = imageData.data;
      // Threshold: if all RGB channels are below this, make transparent
      const threshold = 45;
      for (let j = 0; j < data.length; j += 4) {
        const r = data[j], g = data[j + 1], b = data[j + 2];
        if (r < threshold && g < threshold && b < threshold) {
          data[j + 3] = 0; // fully transparent
        } else {
          // Smooth transition: darken near-black pixels with partial transparency
          const brightness = Math.max(r, g, b);
          if (brightness < threshold * 2) {
            data[j + 3] = Math.floor((brightness / (threshold * 2)) * data[j + 3]);
          }
        }
      }
      oCtx.putImageData(imageData, 0, 0);
      return offscreen;
    };

    // Load petal images and pre-process to remove black backgrounds
    const petalCanvases: HTMLCanvasElement[] = [];
    let loadedCount = 0;
    let allLoaded = false;

    PETAL_SRCS.forEach((src, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        petalCanvases[i] = removeBlackBg(img);
        loadedCount++;
        if (loadedCount === PETAL_SRCS.length) allLoaded = true;
      };
      img.onerror = () => {
        // Fallback: create a simple petal shape
        const fallback = document.createElement('canvas');
        fallback.width = 60;
        fallback.height = 80;
        const fCtx = fallback.getContext('2d')!;
        fCtx.beginPath();
        fCtx.moveTo(30, 0);
        fCtx.bezierCurveTo(55, 15, 55, 65, 30, 80);
        fCtx.bezierCurveTo(5, 65, 5, 15, 30, 0);
        const grad = fCtx.createRadialGradient(30, 35, 5, 30, 40, 40);
        grad.addColorStop(0, '#8b1a2b');
        grad.addColorStop(0.6, '#6b0f1a');
        grad.addColorStop(1, '#3a0510');
        fCtx.fillStyle = grad;
        fCtx.fill();
        petalCanvases[i] = fallback;
        loadedCount++;
        if (loadedCount === PETAL_SRCS.length) allLoaded = true;
      };
    });

    // Initialize petals
    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      const depth = Math.random();
      const baseSize = 35 + Math.random() * 60;
      const sizeMultiplier = 0.5 + depth * 0.7; // far = smaller, near = bigger
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height * 2 - height, // spread some above viewport
        size: baseSize * sizeMultiplier,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.4 + Math.random() * 0.9 + depth * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        opacity: 0.5 + depth * 0.5,
        imgIndex: Math.floor(Math.random() * PETAL_SRCS.length),
        tiltX: Math.random() * Math.PI * 2,
        tiltY: Math.random() * Math.PI * 2,
        tiltSpeedX: (Math.random() - 0.5) * 0.02,
        tiltSpeedY: (Math.random() - 0.5) * 0.025,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmplitude: 0.4 + Math.random() * 1.2,
        swaySpeed: 0.005 + Math.random() * 0.015,
        depth,
      });
    }

    // Sort by depth so far petals render behind near ones
    petals.sort((a, b) => a.depth - b.depth);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (!allLoaded) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Wind sway
        p.swayPhase += p.swaySpeed;
        const sway = Math.sin(p.swayPhase) * p.swayAmplitude;

        // Move
        p.x += p.vx + sway;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tiltX += p.tiltSpeedX;
        p.tiltY += p.tiltSpeedY;

        // 3D tumble — scale X/Y to simulate perspective rotation
        const scaleX = Math.cos(p.tiltX) * 0.5 + 0.5; // 0.0 to 1.0
        const scaleY = Math.cos(p.tiltY) * 0.3 + 0.7; // 0.4 to 1.0

        // Wrap around
        if (p.y > height + 80) {
          p.y = -80 - Math.random() * 100;
          p.x = Math.random() * width;
        }
        if (p.x < -80) p.x = width + 80;
        if (p.x > width + 80) p.x = -80;

        // Draw petal from pre-processed canvas (black bg removed)
        const petalCanvas = petalCanvases[p.imgIndex];
        if (!petalCanvas) continue;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(scaleX, scaleY);

        const drawSize = p.size;
        ctx.drawImage(petalCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

        ctx.restore();
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
      className="absolute inset-0 pointer-events-none z-[2]"
    />
  );
};
