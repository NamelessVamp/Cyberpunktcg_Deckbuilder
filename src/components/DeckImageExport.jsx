// NON OMNIS MORIAR — DeckImageExport: Visual deck card for sharing
// EX MACHINA — Usa Supabase Storage para evitar CORS de CloudFront
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";

// URL de Supabase para las imágenes — no tiene CORS issues
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const getCardImageUrl = (cardId) =>
  `${SUPABASE_URL}/storage/v1/object/public/card-images/${cardId}.webp`;

function RamPill({ color }) {
  const map = {
    Red: { bg: "#ff1744", label: "RED" },
    Blue: { bg: "#00e5ff", label: "BLUE" },
    Green: { bg: "#00ff41", label: "GREEN" },
    Yellow: { bg: "#ffb300", label: "YELLOW" },
  };
  const c = map[color] || { bg: "#666", label: color };
  return (
    <span
      style={{
        background: c.bg,
        color: "#0a0a0a",
        fontSize: 12,
        fontWeight: 900,
        fontFamily: "monospace",
        padding: "4px 12px",
        borderRadius: 4,
        marginRight: 6,
        display: "inline-block",
      }}
    >
      {c.label}
    </span>
  );
}

// Imagen de carta renderizada al tamaño ORIGINAL sin recortes
function CardImg({ card, style = {} }) {
  const [errored, setErrored] = useState(false);
  const src = errored
    ? `https://via.placeholder.com/250x350/1a1a1a/ffb300?text=${encodeURIComponent(card.name?.slice(0, 6) || "?")}`
    : getCardImageUrl(card.id);

  return (
    <img
      src={src}
      alt={card.name}
      crossOrigin="anonymous"
      onError={() => setErrored(true)}
      style={{
        width: "100%",
        height: "auto", // Importante: Deja que la altura se calcule sola
        aspectRatio: "5 / 7", // Proporción natural de carta TCG
        display: "block",
        borderRadius: 8,
        objectFit: "contain", // Garantiza que no se corte NADA
        boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
        ...style,
      }}
    />
  );
}

function CardThumb({ card, count }) {
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: 16 }}>
      <CardImg card={card} />

      {/* Badge de Cantidad*/}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#ffb300",
          color: "#0a0a0a",
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          fontSize: 13,
          padding: "3px 10px",
          borderRadius: 4,
          border: "none",
          boxShadow: "0 4px 6px rgba(0,0,0,0.6)",
          zIndex: 2,
        }}
      >
        x{count}
      </div>
    </div>
  );
}

function MiniCurve({ mainDeck }) {
  const curve = mainDeck
    .filter((c) => c.type !== "LEGEND" && c.cost !== undefined)
    .reduce((acc, c) => {
      acc[c.cost] = (acc[c.cost] || 0) + 1;
      return acc;
    }, {});
  const max = Math.max(...Object.values(curve), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 75, // FIX: Más altura para que las barras no choquen arriba
        overflow: "visible",
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((cost) => {
        const count = curve[cost] || 0;
        const h = count > 0 ? Math.max(10, (count / max) * 50) : 0;
        return (
          <div
            key={cost}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 14,
            }}
          >
            {/* Numerito arriba de la barra opcional, estilo ExBurst */}
            {count > 0 && (
              <span
                style={{
                  color: "#ffb300",
                  fontSize: 10,
                  fontWeight: "bold",
                  marginBottom: 2,
                }}
              >
                {count}
              </span>
            )}
            <div
              style={{
                width: "100%",
                height: h,
                background: count > 0 ? "#ffb300" : "#222",
                borderRadius: "2px 2px 0 0",
              }}
            />
            <span
              style={{
                color: "#ffffff80",
                fontSize: 10,
                fontFamily: "monospace",
                marginTop: 4,
                fontWeight: "bold",
              }}
            >
              {cost}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DeckExportCanvas({
  deck,
  deckName,
  authorName,
  shareUrl,
  canvasRef,
}) {
  const mainCounts = deck.mainDeck.reduce((acc, card) => {
    if (!acc[card.id]) acc[card.id] = { card, count: 0 };
    acc[card.id].count++;
    return acc;
  }, {});
  const uniqueMain = Object.values(mainCounts).sort(
    (a, b) => (a.card.cost ?? 0) - (b.card.cost ?? 0),
  );
  const ramColors = [
    ...new Set(deck.legends.map((l) => l.ram_color).filter(Boolean)),
  ];
  const qrUrl = shareUrl || "https://afterlife-decks.vercel.app";

  return (
    <div
      ref={canvasRef}
      style={{
        width: 1200, // Lienzo más grande para acomodar mejor el 5:7
        background: "#0a0a0a",
        fontFamily: "'Courier New', monospace",
        padding: 40,
        boxSizing: "border-box",
        border: "2px solid #ffb300",
        borderRadius: 8,
        boxShadow:
          "0 0 30px rgba(255,179,0,0.15), inset 0 0 60px rgba(0,0,0,0.5)",
        position: "absolute",
        left: -9999,
        top: 0,
        zIndex: -1,
      }}
    >
      {/* HEADER (Reorganizado como en la 2da imagen) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          borderBottom: "1px solid #ffb30040",
          paddingBottom: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#ffb300",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 2,
              lineHeight: 1.2,
              fontFamily: "'Courier New', monospace",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(255,179,0,0.4)",
            }}
          >
            {deckName || "UNTITLED DECK"}
          </div>
          <div
            style={{
              color: "#00ff41",
              fontSize: 12,
              marginTop: 6,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 1,
            }}
          >
            by{" "}
            <span style={{ color: "#00ff41", fontWeight: 900 }}>
              {authorName || "UNKNOWN_RUNNER"}
            </span>
          </div>
          <div
            style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            {ramColors.map((c) => (
              <RamPill key={c} color={c} />
            ))}
          </div>
        </div>

        {/* CURVA Y QR A LA DERECHA */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
          {/* Curva de Costos en la cabecera */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                color: "#ffb300",
                fontSize: 9,
                fontWeight: 900,
                fontFamily: "'Courier New', monospace",
                textAlign: "center",
                marginBottom: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {/* FIX: marginBottom: 16 para separar el título de las barras */}
              Cost Distribution
            </div>
            <MiniCurve mainDeck={deck.mainDeck} />
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: 8,
              borderRadius: 8,
              lineHeight: 0,
            }}
          >
            <QRCodeSVG
              value={qrUrl}
              size={90}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="M"
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: "flex", gap: 32 }}>
        {/* LEFT: Legends (Ahora usando la carta completa limpia) */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div
            style={{
              color: "#ffb300",
              fontSize: 10,
              fontWeight: 900,
              marginBottom: 12,
              letterSpacing: 2,
              fontFamily: "'Courier New', monospace",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(255,179,0,0.3)",
            }}
          >
            Legends
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {deck.legends.map((legend) => (
              // Usamos la carta al natural, sin text overlays
              <CardImg key={legend.id} card={legend} />
            ))}
          </div>
        </div>

        {/* RIGHT: Main deck */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)", // 5 columnas
              columnGap: 16,
              rowGap: 24, // Espacio suficiente para la etiqueta x3
            }}
          >
            {uniqueMain.map(({ card, count }) => (
              <CardThumb key={card.id} card={card} count={count} />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: 40,
          paddingTop: 16,
          borderTop: "1px solid #ffb30025",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "#ffffff25",
            fontSize: 9,
            fontFamily: "'Courier New', monospace",
            letterSpacing: 1,
          }}
        >
          Decklist Created Using Afterlife Decks — afterlife-decks.vercel.app
        </div>
        <div
          style={{
            color: "#ffb300",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 4,
            fontFamily: "'Courier New', monospace",
            textShadow: "0 0 15px rgba(255,179,0,0.5)",
          }}
        >
          AFTERLIFE DECKS
        </div>
      </div>
    </div>
  );
}

export async function generateDeckImage(canvasRef) {
  if (!canvasRef.current) throw new Error("Canvas ref not mounted");

  const el = canvasRef.current;
  // Move into viewport
  el.style.left = "0";
  el.style.top = "0";
  el.style.zIndex = "9999";
  el.style.position = "fixed";

  // Wait for images to load
  const images = el.querySelectorAll("img");
  await Promise.allSettled(
    Array.from(images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          }),
    ),
  );

  try {
    const canvas = await html2canvas(el, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#0a0a0a",
      scale: 2, // Mantiene la alta resolución
      logging: false,
      imageTimeout: 10000,
    });

    el.style.left = "-9999px";
    el.style.top = "0";
    el.style.zIndex = "-1";
    el.style.position = "absolute";

    return canvas.toDataURL("image/png");
  } catch (err) {
    el.style.left = "-9999px";
    el.style.position = "absolute";
    throw err;
  }
}

export default function DeckImageExport({
  deck,
  deckName,
  authorName,
  shareUrl,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const dataUrl = await generateDeckImage(canvasRef);
      const link = document.createElement("a");
      link.download = `${(deckName || "deck").replace(/\s+/g, "_")}_afterlife.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image export error:", err);
      alert("Error generating image. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  const hasCards =
    (deck?.mainDeck?.length || 0) > 0 || (deck?.legends?.length || 0) > 0;

  return (
    <>
      <DeckExportCanvas
        deck={deck || { legends: [], mainDeck: [], sideboard: [] }}
        deckName={deckName}
        authorName={authorName}
        shareUrl={shareUrl}
        canvasRef={canvasRef}
      />
      <button
        onClick={handleGenerate}
        disabled={generating || !hasCards}
        className={`font-mono font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      >
        {generating ? "[GENERATING...]" : "[[ ◉¯] SHARE AS IMAGE]"}
      </button>
    </>
  );
}
