import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

const COLOR_PALETTE = [
  '#FA2EDF', // Magenta
  '#00F0FF', // Cyan
  '#7000FF', // Deep Purple
  '#0055FF', // Electric Blue
  '#FF3300', // Bright Orange
  '#00FF99', // Mint Green
];

export const ColorfulDotCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const particlesRef: Particle[] = [];
    const gridSpacing = 14;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnDotsAroundMouse = (mx: number, my: number) => {
      const radius = 60;
      const count = 8;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const rawX = mx + Math.cos(angle) * dist;
        const rawY = my + Math.sin(angle) * dist;

        // Align to grid
        const gridX = Math.round(rawX / gridSpacing) * gridSpacing;
        const gridY = Math.round(rawY / gridSpacing) * gridSpacing;

        // Avoid duplicate particles at exact same spot
        const existing = particlesRef.find(
          (p) => Math.hypot(p.x - gridX, p.y - gridY) < 4
        );

        if (!existing) {
          particlesRef.push({
            x: gridX,
            y: gridY,
            color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
            size: 3 + Math.random() * 2.5,
            alpha: 1,
            life: 0,
            maxLife: 60 + Math.random() * 40,
          });
        } else {
          existing.life = 0; // Reset life
          existing.alpha = 1;
        }
      }

      // Limit particle count
      if (particlesRef.length > 350) {
        particlesRef.splice(0, particlesRef.length - 350);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      spawnDotsAroundMouse(mx, my);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particlesRef.length - 1; i >= 0; i--) {
        const p = particlesRef[i];
        p.life++;

        // Fade out as life increases
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.alpha <= 0) {
          particlesRef.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        display: 'block',
      }}
    />
  );
};
