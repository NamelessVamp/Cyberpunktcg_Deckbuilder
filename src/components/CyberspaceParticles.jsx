// NON OMNIS MORIAR — CyberspaceParticles v2
// EX MACHINA — Inspirado en el Ciberespacio de CP2077 (CDPR/SIGGRAPH 2021)
// Dos capas: puntos flotantes + lluvia de datos vertical
import { useEffect, useRef } from "react";

export default function CyberspaceParticles({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── CAPA 1: Puntos flotantes dispersos (estilo imagen 4 — puntos blancos/cian) ──
    const FLOAT_COUNT = 120;
    const floaters = Array.from({ length: FLOAT_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      // Mayoría cian, algunos rojos raros, algunos blancos
      hue:
        Math.random() > 0.85
          ? "255,30,80"
          : Math.random() > 0.7
            ? "200,230,255"
            : "0,220,255",
      alpha: Math.random() * 0.4 + 0.05,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.003,
    }));

    // ── CAPA 2: Lluvia vertical de datos (estilo imagen 2 — líneas cian cayendo) ──
    const RAIN_COUNT = 60;
    const rainDrops = Array.from({ length: RAIN_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      speed: Math.random() * 3 + 1.5,
      length: Math.random() * 60 + 20,
      alpha: Math.random() * 0.25 + 0.05,
      width: Math.random() * 1.2 + 0.3,
      // Cian dominante, algún rojo raro
      color: Math.random() > 0.9 ? "255,40,90" : "0,200,255",
    }));

    // ── CAPA 3: Destellos de datos (flashes blancos muy breves) ──
    const FLASH_COUNT = 15;
    const flashes = Array.from({ length: FLASH_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      life: Math.random(),
      maxLife: 0.8 + Math.random() * 1.5,
      r: Math.random() * 2 + 0.5,
    }));

    let raf;
    const draw = () => {
      // Fondo negro con trail muy sutil
      ctx.fillStyle = "rgba(2, 4, 12, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Dibuja lluvia vertical ──
      rainDrops.forEach((d) => {
        d.y += d.speed;
        if (d.y > canvas.height + d.length) {
          d.y = -d.length;
          d.x = Math.random() * canvas.width;
          d.speed = Math.random() * 3 + 1.5;
        }

        const grad = ctx.createLinearGradient(d.x, d.y - d.length, d.x, d.y);
        grad.addColorStop(0, `rgba(${d.color},0)`);
        grad.addColorStop(0.6, `rgba(${d.color},${d.alpha})`);
        grad.addColorStop(1, `rgba(${d.color},${d.alpha * 0.5})`);

        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.length);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.width;
        ctx.stroke();
      });

      // ── Dibuja puntos flotantes ──
      floaters.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.speed;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${a})`;
        ctx.fill();
      });

      // ── Dibuja destellos ──
      flashes.forEach((f) => {
        f.life += 0.02;
        if (f.life > f.maxLife) {
          f.life = 0;
          f.x = Math.random() * canvas.width;
          f.y = Math.random() * canvas.height;
          f.maxLife = 0.8 + Math.random() * 1.5;
        }
        const progress = f.life / f.maxLife;
        const a = Math.sin(progress * Math.PI) * 0.6;
        if (a > 0.05) {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,240,255,${a})`;
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
