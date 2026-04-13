// NON OMNIS MORIAR — CyberspaceParticles
// EX MACHINA — Point cloud background inspirado en CP2077 Ciberespacio
import { useEffect, useRef } from "react";

export default function CyberspaceParticles({ count = 160, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = [
      "rgba(0,229,255,",   // cyan x2
      "rgba(0,229,255,",
      "rgba(255,23,68,",   // red
      "rgba(0,255,65,",    // green terminal
      "rgba(255,179,0,",   // amber
    ];

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.45 + 0.08,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.004,
      linked: Math.random() > 0.65,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.phase += p.speed;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const a = p.alpha * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${a})`;
        ctx.fill();

        if (p.linked) {
          for (let j = i + 1; j < pts.length; j++) {
            if (!pts[j].linked) continue;
            const dx = p.x - pts[j].x, dy = p.y - pts[j].y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 90) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `${p.color}${(1 - d/90) * 0.1})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.55 }}
    />
  );
}
