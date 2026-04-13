// NON OMNIS MORIAR — PointCloudReveal
// EX MACHINA — Carta se materializa desde nube de puntos (técnica CDPR SIGGRAPH 2021)
import { useEffect, useRef, useState } from "react";

export default function PointCloudReveal({ imageUrl, alt = "", onComplete, className = "" }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [phase, setPhase] = useState("points"); // points → dissolve → image
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    // Wait for image to load, then sample pixels
    const run = () => {
      // Draw image offscreen to sample colors
      const offscreen = document.createElement("canvas");
      offscreen.width = W; offscreen.height = H;
      const octx = offscreen.getContext("2d");
      octx.drawImage(img, 0, 0, W, H);

      let pixels;
      try {
        pixels = octx.getImageData(0, 0, W, H).data;
      } catch {
        pixels = null;
      }

      // Generate point cloud — sample from image pixels
      const DENSITY = 600;
      const points = Array.from({ length: DENSITY }, (_, i) => {
        // Target position: grid sample from image
        const col = Math.floor(Math.random() * W);
        const row = Math.floor(Math.random() * H);
        const idx = (row * W + col) * 4;

        // Get color from image pixel (fallback to cyan/red if no pixel data)
        let r = 0, g = 229, b = 255;
        if (pixels) {
          r = pixels[idx]; g = pixels[idx+1]; b = pixels[idx+2];
          // Boost saturation for cyberpunk feel
          const avg = (r+g+b)/3;
          r = Math.min(255, r + (r-avg) * 0.5);
          g = Math.min(255, g + (g-avg) * 0.3);
          b = Math.min(255, b + (b-avg) * 0.3);
        }

        // Start far from target — scattered
        const startX = W/2 + (Math.random()-0.5) * W * 2.5;
        const startY = H/2 + (Math.random()-0.5) * H * 2.5;

        return {
          x: startX, y: startY,
          tx: col, ty: row,     // target: image position
          r, g, b,
          size: Math.random() * 2.5 + 0.5,
          prog: 0,
          delay: Math.random() * 0.4,  // stagger
          speed: 0.025 + Math.random() * 0.02,
        };
      });

      let startTime = null;
      const TOTAL_DURATION = 900; // ms

      const animate = (ts) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const globalProg = Math.min(elapsed / TOTAL_DURATION, 1);

        ctx.clearRect(0, 0, W, H);

        // Dark background with slight trail
        ctx.fillStyle = "rgba(10,10,10,0.3)";
        ctx.fillRect(0, 0, W, H);

        let allDone = true;
        points.forEach(p => {
          const localProg = Math.max(0, (globalProg - p.delay) / (1 - p.delay));
          if (localProg < 1) allDone = false;
          p.prog = Math.min(1, localProg);

          // Ease out cubic
          const ease = 1 - Math.pow(1 - p.prog, 3);
          p.x += (p.tx - p.x) * ease * 0.1;
          p.y += (p.ty - p.y) * ease * 0.1;

          // Alpha: starts bright, settles
          const alpha = p.prog < 0.5
            ? p.prog * 2
            : 1 - (p.prog - 0.5) * 0.3;

          // Color: starts cyan, transitions to actual pixel color
          const cr = Math.round(p.r * p.prog + 0 * (1-p.prog));
          const cg = Math.round(p.g * p.prog + 229 * (1-p.prog));
          const cb = Math.round(p.b * p.prog + 255 * (1-p.prog));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1-p.prog) * 2), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.fill();
        });

        if (!allDone || globalProg < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          // Animation done — show real image
          setPhase("image");
          onComplete?.();
        }
      };

      animRef.current = requestAnimationFrame(animate);
    };

    if (img.complete) run();
    else { img.onload = run; }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [imageUrl]);

  return (
    <div className={`relative ${className}`} style={{ overflow: "hidden" }}>
      {/* Real image — hidden during animation, shown after */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt}
        crossOrigin="anonymous"
        className="w-full h-auto block rounded"
        style={{ opacity: phase === "image" ? 1 : 0, transition: "opacity 0.3s ease" }}
      />
      {/* Canvas overlay for point cloud animation */}
      {phase === "points" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded"
          style={{ background: "#0a0a0a" }}
        />
      )}
    </div>
  );
}
