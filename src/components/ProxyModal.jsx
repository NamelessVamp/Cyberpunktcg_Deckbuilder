import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import SmartCardImage from "./SmartCardImage";

export default function ProxyModal({ deck, onClose }) {
  const [quality, setQuality] = useState("300"); // 300 DPI o 150 DPI
  const [cardSize, setCardSize] = useState("poker"); // poker o bridge
  const [paperSize, setPaperSize] = useState("a4"); // a4 o letter
  const [showCutLines, setShowCutLines] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Combinar Legends + Main Deck
  const allCards = [...deck.legends, ...deck.mainDeck];

  // Convertir SVG base64 a PNG base64
  const convertSvgToPng = async (svgBase64, width = 630, height = 880) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        // Aseguramos que el fondo del Canvas sea oscuro (por si hay transparencias)
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = svgBase64;
    });
  };

  // Función para convertir imagen a base64 desde tu imageService (Supabase + fallback)
  const getCardImageAsBase64 = async (card) => {
    try {
      // OPCIÓN 1: Intentar cargar desde Supabase Storage (.webp y .jpg)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const formats = [".webp", ".jpg", ".png"];

      for (const format of formats) {
        try {
          const url = `${supabaseUrl}/storage/v1/object/public/card-images/${card.id}${format}`;
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (error) {
          // Continuar con el siguiente formato
          continue;
        }
      }

      // OPCIÓN 2: Intentar cargar desde la URL original (si no está bloqueada por CORS)
      const originalUrl = card.image_uris?.front || card.image_url;
      if (originalUrl) {
        try {
          const response = await fetch(originalUrl);
          if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (corsError) {}
      }

      // OPCIÓN 3: Usar placeholder SVG (convertido a PNG)
      const svgBase64 = generatePlaceholderBase64(card);
      // Reducimos el tamaño a la mitad (315x440) para ahorrar memoria RAM
      return await convertSvgToPng(svgBase64, 315, 440);
    } catch (error) {
      console.error("Error loading image:", error);
      const svgBase64 = generatePlaceholderBase64(card);
      return await convertSvgToPng(svgBase64);
    }
  };

  // Generar placeholder SVG como base64
  const generatePlaceholderBase64 = (card) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 880">
        <rect width="630" height="880" fill="#1a1a1a"/>
        <rect x="10" y="10" width="610" height="860" fill="none" stroke="#f59e0b" stroke-width="4"/>
        <text x="315" y="400" font-family="monospace" font-size="32" fill="#f59e0b" text-anchor="middle" font-weight="bold">
          ${card.name.substring(0, 30)}
        </text>
        <text x="315" y="450" font-family="monospace" font-size="24" fill="#10b981" text-anchor="middle">
          [IMAGE NOT AVAILABLE]
        </text>
        <text x="315" y="500" font-family="monospace" font-size="18" fill="#6b7280" text-anchor="middle">
          Type: ${card.type_line || "Unknown"}
        </text>
        <text x="315" y="540" font-family="monospace" font-size="18" fill="#6b7280" text-anchor="middle">
          ID: ${card.id}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Configuración de tamaño de carta (en mm)
      const cardDimensions = {
        poker: { width: 63, height: 88 },
        bridge: { width: 57, height: 89 },
      };

      // Configuración de tamaño de papel (en mm)
      const paperDimensions = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 }, // US Letter
      };

      const { width: cardWidth, height: cardHeight } = cardDimensions[cardSize];
      const { width: paperWidth, height: paperHeight } =
        paperDimensions[paperSize];

      // Crear PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [paperWidth, paperHeight],
      });

      // Layout: 3 cartas por fila, 3 filas por página (9 cartas/página)
      const cardsPerRow = 3;
      const cardsPerPage = 9;

      // Calcular márgenes para centrar la grilla
      const totalGridWidth = cardWidth * cardsPerRow + 2 * 2; // 2mm spacing entre cartas
      const totalGridHeight = cardHeight * 3 + 2 * 2;
      const marginX = (paperWidth - totalGridWidth) / 2;
      const marginY = (paperHeight - totalGridHeight) / 2;
      const spacing = 2;

      let cardIndex = 0;

      for (const card of allCards) {
        const positionInPage = cardIndex % cardsPerPage;
        const row = Math.floor(positionInPage / cardsPerRow);
        const col = positionInPage % cardsPerRow;

        // Añadir nueva página si es necesario
        if (cardIndex > 0 && positionInPage === 0) {
          pdf.addPage();
        }

        // Calcular posición X, Y
        const x = marginX + col * (cardWidth + spacing);
        const y = marginY + row * (cardHeight + spacing);

        // Obtener imagen como base64 (usando TU sistema de imágenes)
        const base64Image = await getCardImageAsBase64(card);
        if (base64Image) {
          // Todas las imágenes son PNG o JPEG ahora (SVG ya convertido)
          const imageFormat = base64Image.includes("image/png")
            ? "PNG"
            : "JPEG";
          pdf.addImage(base64Image, imageFormat, x, y, cardWidth, cardHeight);
        }

        // Dibujar líneas de corte si está habilitado
        if (showCutLines) {
          pdf.setDrawColor(0, 0, 0); // Negro
          pdf.setLineWidth(0.1);
          pdf.rect(x, y, cardWidth, cardHeight);
        }

        cardIndex++;
        setProgress(Math.round((cardIndex / allCards.length) * 100));
      }

      // Descargar PDF con fecha correcta (2026, no 2024)
      const today = new Date();
      const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
      const fileName = `afterlife-proxies-${dateString}.pdf`;
      pdf.save(fileName);

      setIsGenerating(false);
      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
      alert(`Error generating proxies: ${error.message}. Please try again.`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-term-gray border-2 border-term-amber rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ position: "relative" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-term-gray border-b border-term-amber p-4 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-term-amber font-mono">
              [PROXY GENERATOR]
            </h2>
            <button
              onClick={onClose}
              className="text-term-red hover:text-red-400 font-mono text-xl"
            >
              [X]
            </button>
          </div>

          {/* Settings */}
          <div className="p-6 space-y-6">
            {/* Card Count */}
            <div className="bg-term-gray/50 border border-term-green/30 rounded p-4">
              <p className="text-term-green font-mono">
                <strong className="text-term-amber">Total Cards:</strong>{" "}
                {allCards.length} ({deck.legends.length} Legends +{" "}
                {deck.mainDeck.length} Main Deck)
              </p>
              <p className="text-term-green/60 font-mono text-sm mt-2">
                Estimated Pages: {Math.ceil(allCards.length / 9)} (9 cards per
                page)
              </p>
            </div>

            {/* Quality Settings */}
            <div>
              <label className="block text-term-amber font-mono mb-2">
                Print Quality:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-term-green font-mono cursor-pointer">
                  <input
                    type="radio"
                    value="150"
                    checked={quality === "150"}
                    onChange={(e) => setQuality(e.target.value)}
                    className="accent-term-amber"
                  />
                  150 DPI (Fast, ~5MB)
                </label>
                <label className="flex items-center gap-2 text-term-green font-mono cursor-pointer">
                  <input
                    type="radio"
                    value="300"
                    checked={quality === "300"}
                    onChange={(e) => setQuality(e.target.value)}
                    className="accent-term-amber"
                  />
                  300 DPI (High Quality, ~15MB)
                </label>
              </div>
            </div>

            {/* Card Size */}
            <div>
              <label className="block text-term-amber font-mono mb-2">
                Card Size:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-term-green font-mono cursor-pointer">
                  <input
                    type="radio"
                    value="poker"
                    checked={cardSize === "poker"}
                    onChange={(e) => setCardSize(e.target.value)}
                    className="accent-term-amber"
                  />
                  Poker (63x88mm - Standard TCG)
                </label>
                <label className="flex items-center gap-2 text-term-green font-mono cursor-pointer">
                  <input
                    type="radio"
                    value="bridge"
                    checked={cardSize === "bridge"}
                    onChange={(e) => setCardSize(e.target.value)}
                    className="accent-term-amber"
                  />
                  Bridge (57x89mm - Narrower)
                </label>
              </div>
            </div>

            {/* Paper Size */}
            <div>
              <label className="block text-term-amber font-mono mb-2">
                Paper Size:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-term-green font-mono cursor-pointer">
                  <input
                    type="radio"
                    value="a4"
                    checked={paperSize === "a4"}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="accent-term-amber"
                  />
                  A4 (210x297mm - Global Standard)
                </label>
                <label className="flex items-center gap-2 text-term-green font-mono cursor-pointer">
                  <input
                    type="radio"
                    value="letter"
                    checked={paperSize === "letter"}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="accent-term-amber"
                  />
                  US Letter (8.5x11 inches)
                </label>
              </div>
            </div>

            {/* Cut Lines */}
            <div>
              <label className="flex items-center gap-2 text-term-amber font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="accent-term-amber"
                />
                Show cut lines (black borders for easier cutting)
              </label>
            </div>

            {/* Preview Grid */}
            <div>
              <h3 className="text-term-amber font-mono mb-3">
                Preview (First 9 cards):
              </h3>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-term-green/30 rounded p-2 bg-black/20">
                {allCards.slice(0, 9).map((card, index) => (
                  <div
                    key={`preview-${card.id}-${index}`}
                    className="relative aspect-[63/88] border border-term-green/20"
                  >
                    <SmartCardImage
                      card={card}
                      className="w-full h-full object-cover rounded"
                      eagerLoad={true}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-term-green text-xs font-mono p-1 text-center truncate">
                      {card.name}
                    </div>
                  </div>
                ))}
              </div>
              {allCards.length > 9 && (
                <p className="text-term-green/60 font-mono text-sm mt-2">
                  + {allCards.length - 9} more cards will be included
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-term-gray border-t border-term-amber p-4 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-term-red/20 text-term-red border border-term-red rounded font-mono hover:bg-term-red/30 transition-colors"
            >
              [CANCEL]
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || allCards.length === 0}
              className="px-6 py-2 bg-term-amber/20 text-term-amber border border-term-amber rounded font-mono hover:bg-term-amber/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating
                ? `[GENERATING... ${progress}%]`
                : `[GENERATE PROXIES]`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
