// NON OMNIS MORIAR — CyberspaceLoader
// EX MACHINA — Point cloud loading screen
import { useEffect, useRef, useState } from "react";

export default function CyberspaceLoader() {
  const canvasRef = useRef(null);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 420);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    const COLS = ["0,229,255","255,23,68","0,255,65","255,179,0"];
    const pts = Array.from({ length: 200 }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const start = 180 + Math.random() * 380;
      const ta = (i / 200) * Math.PI * 2;
      const td = 15 + Math.random() * 55;
      return {
        x: cx + Math.cos(a) * start, y: cy + Math.sin(a) * start,
        tx: cx + Math.cos(ta) * td,  ty: cy + Math.sin(ta) * td,
        r: Math.random() * 2 + 0.4,
        col: COLS[Math.floor(Math.random() * COLS.length)],
        prog: Math.random() * 0.25,
        spd: 0.018 + Math.random() * 0.022,
      };
    });

    let raf;
    const animate = () => {
      ctx.fillStyle = "rgba(10,10,10,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.prog = Math.min(1, p.prog + p.spd);
        const ease = 1 - Math.pow(1 - p.prog, 3);
        p.x += (p.tx - p.x) * ease * 0.04;
        p.y += (p.ty - p.y) * ease * 0.04;
        const a = 0.2 + p.prog * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col},${a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-2 border-term-amber/40 rounded-full animate-spin" style={{animationDuration:"9s"}}/>
          <div className="absolute inset-2 border border-cyan-400/30 rounded-full animate-spin" style={{animationDuration:"5s",animationDirection:"reverse"}}/>
          <div className="absolute inset-4 border border-term-red/20 rounded-full animate-spin" style={{animationDuration:"3s"}}/>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-term-amber font-mono font-black text-xl tracking-widest loading-terminal"
              style={{textShadow:"0 0 18px rgba(255,179,0,0.9)"}}>
              AD
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-term-amber font-mono font-bold text-base tracking-widest"
            style={{textShadow:"0 0 12px rgba(255,179,0,0.6)"}}>
            AFTERLIFE DECKS
          </p>
          <p className="text-term-green font-mono text-xs mt-1 tracking-wider opacity-60">
            INITIALIZING DECK_BUILDER{".".repeat(dots)}
          </p>
          <p className="text-cyan-400/40 font-mono text-xs mt-2 tracking-widest">
            &gt; CONNECTING TO NIGHT CITY NET_
          </p>
        </div>
      </div>
    </div>
  );
}
