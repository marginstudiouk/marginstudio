import { useEffect, useRef } from 'react';

const TRAIL_MS = 650;

export default function PencilCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf;
    const points = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e) => {
      const now = performance.now();
      const prev = points[points.length - 1];

      if (!prev || Math.hypot(e.clientX - prev.x, e.clientY - prev.y) > 2) {
        points.push({
          x: e.clientX,
          y: e.clientY,
          t: now,
        });
      }
    };

    const passes = [
      { width: 2.2, color: '63, 74, 92', alpha: 0.18 },
      { width: 1.1, color: '36, 47, 65', alpha: 0.48 },
      { width: 0.55, color: '33, 53, 135', alpha: 0.58 },
    ];

    const draw = () => {
      const now = performance.now();

      while (points.length && now - points[0].t > TRAIL_MS) {
        points.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.length > 1) {
        const head = points[points.length - 1];
        const tail = points[0];

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        passes.forEach(({ width, color, alpha }) => {
          const gradient = ctx.createLinearGradient(
            head.x,
            head.y,
            tail.x,
            tail.y
          );

          gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
          gradient.addColorStop(0.45, `rgba(${color}, ${alpha * 0.7})`);
          gradient.addColorStop(1, `rgba(${color}, 0)`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = width;

          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);

          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }

          ctx.stroke();
        });
      }

      raf = requestAnimationFrame(draw);
    };

    resize();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60]"
    />
  );
}
