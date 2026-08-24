import React, { useRef, useEffect } from 'react';

interface HoneycombCanvasProps {
  interactive?: boolean;
  splitOnScroll?: boolean;
  gridSpacing?: number;
  dotSize?: number;
  hoverOnly?: boolean;
  lightDots?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const HoneycombCanvas: React.FC<HoneycombCanvasProps> = ({
  interactive = true,
  splitOnScroll = true,
  gridSpacing = 16,
  dotSize = 1.8,
  hoverOnly = false,
  lightDots = false,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width || canvas.clientWidth || 300;
      height = rect?.height || canvas.clientHeight || 200;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (interactive && canvas.parentElement) {
      canvas.parentElement.addEventListener('mousemove', handleMouseMove);
      canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);
    }

    let startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = (Date.now() - startTime) * 0.0012;

      // Calculate 2 autonomous floating focal points if not hoverOnly
      const autoX1 = hoverOnly ? -1000 : (Math.sin(elapsed * 0.85) * 0.38 + 0.5) * width;
      const autoY1 = hoverOnly ? -1000 : (Math.cos(elapsed * 1.1) * 0.38 + 0.5) * height;

      const autoX2 = hoverOnly ? -1000 : (Math.cos(elapsed * 0.65 + 2.4) * 0.42 + 0.5) * width;
      const autoY2 = hoverOnly ? -1000 : (Math.sin(elapsed * 0.95 + 1.2) * 0.42 + 0.5) * height;

      // Calculate scroll progress for splitting effect
      let splitOffset = 0;
      if (splitOnScroll && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const progress = 1 - Math.abs(center - viewportHeight / 2) / (viewportHeight / 1.2);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        splitOffset = Math.sin(clampedProgress * Math.PI) * 120;
      }

      const cols = Math.ceil(width / gridSpacing) + 2;
      const rows = Math.ceil(height / gridSpacing) + 2;
      const centerX = width / 2;
      const pulseRadius = hoverOnly ? 180 : 150;

      for (let r = 0; r < rows; r++) {
        const offsetX = (r % 2 === 0) ? 0 : gridSpacing / 2;
        const baseY = r * (gridSpacing * 0.866);

        for (let c = 0; c < cols; c++) {
          const baseX = c * gridSpacing + offsetX;

          let finalX = baseX;
          if (splitOffset > 0) {
            const distFromCenter = baseX - centerX;
            const dir = distFromCenter >= 0 ? 1 : -1;
            const factor = Math.exp(-Math.pow(distFromCenter / (width * 0.4), 2));
            finalX += dir * splitOffset * factor;
          }

          // Compute distance to mouse
          let mouseFactor = 0;
          if (mouseRef.current.active) {
            const mdx = finalX - mouseRef.current.x;
            const mdy = baseY - mouseRef.current.y;
            const mdist = Math.hypot(mdx, mdy);
            if (mdist < pulseRadius) {
              mouseFactor = 1 - mdist / pulseRadius;
            }
          }

          // Compute distance to autonomous moving points
          let autoFactor1 = 0;
          let autoFactor2 = 0;

          if (!hoverOnly) {
            const adx1 = finalX - autoX1;
            const ady1 = baseY - autoY1;
            const adist1 = Math.hypot(adx1, ady1);
            if (adist1 < pulseRadius) {
              autoFactor1 = (1 - adist1 / pulseRadius) * 0.85;
            }

            const adx2 = finalX - autoX2;
            const ady2 = baseY - autoY2;
            const adist2 = Math.hypot(adx2, ady2);
            if (adist2 < pulseRadius) {
              autoFactor2 = (1 - adist2 / pulseRadius) * 0.75;
            }
          }

          const combinedFactor = Math.max(mouseFactor, autoFactor1, autoFactor2);

          if (hoverOnly && combinedFactor <= 0) {
            continue; // Skip rendering idle background dots when hoverOnly is active
          }

          let scale = 1;
          let alpha = hoverOnly ? 0 : 0.12;
          let color = lightDots ? '255, 255, 255' : '0, 0, 0';

          if (combinedFactor > 0) {
            scale = 1 + combinedFactor * 1.8;
            alpha = (hoverOnly ? 0 : 0.12) + combinedFactor * 0.88;

            if (combinedFactor > 0.4) {
              color = '250, 46, 223'; // Pink trail core under cursor
            } else if (lightDots) {
              color = '255, 255, 255';
            }
          }

          if (alpha > 0) {
            ctx.fillStyle = `rgba(${color}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(finalX, baseY, dotSize * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [interactive, splitOnScroll, gridSpacing, dotSize, hoverOnly, lightDots]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
        ...style,
      }}
    />
  );
};
