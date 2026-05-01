import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import * as collectionService from "../lib/collectionService";
import SmartCardImage from "./SmartCardImage";

export default function LiveScannerModal({
  user,
  allCards,
  onClose,
  onCardAdded,
}) {
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [matchFound, setMatchFound] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const MIN_CONFIRMATIONS = 2; // Requiere 2 matches consecutivos
  const [autoAdd, setAutoAdd] = useState(false);
  const [scanStatus, setStatus] = useState("Ready to scan");
  const [recentlyScanned, setRecentlyScanned] = useState([]);

  // Fuzzy match usando Levenshtein distance
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.85;

    // Levenshtein distance simple
    const matrix = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
  };

  const fuzzyMatch = (ocrText) => {
    const cleanText = ocrText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

    // Dynamic threshold basado en longitud
    const getDynamicThreshold = (text) => {
      if (text.length < 5) return 0.85; // Nombres cortos más estrictos
      if (text.length < 10) return 0.75; // Nombres medianos
      return 0.65; // Nombres largos más permisivos
    };

    const threshold = getDynamicThreshold(cleanText);

    let bestMatch = null;
    let bestScore = 0;

    allCards.forEach((card) => {
      const cardName = card.name.toLowerCase();
      const score = calculateSimilarity(cleanText, cardName);

      if (score > bestScore && score > threshold) {
        // Dynamic threshold aplicado: solo considerar matches que superen el umbral dinámico
        bestMatch = { ...card, confidence: Math.round(score * 100) };
        bestScore = score;
      }
    });

    return bestMatch;
  };

  // Extract card name from OCR text
  const extractCardName = (text) => {
    // Simple heuristic: first line usually contains card name
    const lines = text.split("\n").filter((line) => line.trim().length > 3);
    return lines[0] || text;
  };

  // ROI Cropping — solo escanear zona del nombre (top 25%)
  const cropToNameRegion = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Crop top 25% de la carta
        const cropHeight = Math.floor(img.height * 0.25);
        canvas.width = img.width;
        canvas.height = cropHeight;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          cropHeight, // source
          0,
          0,
          img.width,
          cropHeight, // destination
        );

        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = imageSrc;
    });
  };

  // Captura frame + OCR processing
  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current || isProcessing) return;

    setIsProcessing(true);
    setStatus("[SCANNING...]");

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setIsProcessing(false);
        return;
      }

      // ROI: Crop solo la región del nombre
      const croppedImage = await cropToNameRegion(imageSrc);

      // OCR con Tesseract.js
      const result = await Tesseract.recognize(croppedImage, "eng", {
        logger: (m) => console.log(m), // Progress logging
      });

      const cardName = extractCardName(result.data.text);
      const match = fuzzyMatch(cardName);

      if (match) {
        // Agregar a historial
        setMatchHistory((prev) => {
          const newHistory = [...prev, match.id].slice(-5); // Keep last 5

          // Contar confirmaciones del último match
          const confirmations = newHistory.filter(
            (id) => id === match.id,
          ).length;

          if (confirmations >= MIN_CONFIRMATIONS) {
            // CONFIRMADO!
            setMatchFound(match);
            setStatus(`[CONFIRMED] ${match.name} (${match.confidence}%)`);

            // Si Auto-Add está ON, inyectar directamente
            if (autoAdd) {
              handleAutoAdd(match);
            } else {
              // Pausar scan para confirmación manual
              if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
              }
            }
          } else {
            // Pendiente de confirmación
            setStatus(
              `[PENDING] ${match.name} (${confirmations}/${MIN_CONFIRMATIONS})`,
            );
          }

          return newHistory;
        });
      } else {
        setStatus("[!] No match found");
        setMatchHistory([]); // Reset history si no hay match
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setStatus("[ERR] Scan error");
    }

    setIsProcessing(false);
  }, [allCards, autoAdd, isProcessing]);

  // Auto-add sin confirmación (modo ráfaga)
  const handleAutoAdd = async (card) => {
    try {
      await collectionService.addCardToCollection(user.id, card.id, 1);

      // Agregar a lista de recientes
      setRecentlyScanned((prev) => [
        { ...card, timestamp: Date.now() },
        ...prev.slice(0, 4), // Máximo 5 recientes
      ]);

      // Callback para actualizar UI externa
      if (onCardAdded) onCardAdded(card);

      // Reset inmediato para siguiente scan
      setTimeout(() => {
        setMatchFound(null);
        setStatus("Ready to scan");
      }, 800); // Brief visual feedback
    } catch (error) {
      console.error("Error adding to collection:", error);
      setStatus("[!] Failed to add");
    }
  };

  // Confirmación manual (modo OFF)
  const handleManualConfirm = async () => {
    if (!matchFound) return;
    await handleAutoAdd(matchFound);

    // Resumir scanning
    startLiveScanning();
  };

  // Rescanear (descartar match)
  const handleRescan = () => {
    setMatchFound(null);
    setMatchHistory([]); // Reset confirmations
    setStatus("[READY]");
    startLiveScanning();
  };
  // Iniciar loop de scanning
  const startLiveScanning = useCallback(() => {
    if (scanIntervalRef.current) return; // Ya está corriendo

    scanIntervalRef.current = setInterval(() => {
      if (!matchFound || autoAdd) {
        captureAndProcess();
      }
    }, 1500); // Cada 1.5 segundos
  }, [matchFound, autoAdd, captureAndProcess]);

  // Detener scanning
  const stopLiveScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Lifecycle: Start/stop scanning
  useEffect(() => {
    startLiveScanning();
    return () => stopLiveScanning();
  }, [startLiveScanning]);

  // Toggle Auto-Add
  const toggleAutoAdd = () => {
    setAutoAdd((prev) => !prev);
    if (!autoAdd) {
      // Si activamos auto-add y hay un match pendiente, confirmarlo
      if (matchFound) {
        handleAutoAdd(matchFound);
      }
      // Resumir scanning
      startLiveScanning();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-term-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col bg-term-gray border-2 border-term-amber rounded-lg overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-term-black border-b border-term-amber/40">
          <h2 className="text-term-amber font-bold text-base sm:text-lg font-mono">
            [CARD_SCANNER.EXE]
          </h2>
          {/* AUTO-ADD TOGGLE */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleAutoAdd}
              className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                autoAdd
                  ? "bg-term-green text-term-black border-2 border-term-green"
                  : "bg-term-gray text-term-amber/80 border-2 border-term-amber/40"
              }`}
            >
              <span className="text-base">[⚡︎]</span>
              <span className="hidden sm:inline">Auto-Add:</span>
              <span>{autoAdd ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={onClose}
              className="text-term-red hover:text-red-400 font-mono font-bold text-xl sm:text-2xl transition-colors min-h-[44px] min-w-[44px]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CAMERA FEED */}
        <div className="relative flex-1 bg-term-black flex items-center justify-center overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{
              facingMode: "environment", // Cámara trasera en mobile
            }}
          />

          {/* SCAN FRAME OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] border-4 border-term-amber/60 rounded-lg shadow-[0_0_20px_rgba(255,193,7,0.3)]">
              <div className="absolute top-2 left-2 right-2 text-center">
                <p className="text-term-amber text-xs sm:text-sm font-mono bg-term-black/80 px-2 py-1 rounded">
                  Align card here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="p-3 sm:p-4 bg-term-black/90 border-t border-term-amber/40">
          <p className="text-term-green font-mono text-sm sm:text-base text-center">
            {scanStatus}
          </p>
        </div>

        {/* MATCH RESULT (si no está en Auto-Add) */}
        {matchFound && !autoAdd && (
          <div className="p-4 sm:p-6 bg-term-gray border-t-2 border-term-green/40">
            <div className="max-w-md mx-auto">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0">
                  <SmartCardImage
                    card={matchFound}
                    className="w-full h-full object-cover rounded border-2 border-term-green"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-term-green font-bold text-base sm:text-lg font-mono mb-1 truncate">
                    {matchFound.name}
                  </h3>
                  <div className="text-term-amber/80 text-xs sm:text-sm font-mono space-y-1">
                    <p>
                      {matchFound.type} • {matchFound.cost}€
                    </p>
                    {matchFound.power && <p>Power: {matchFound.power}</p>}
                    {matchFound.ram && (
                      <p>
                        RAM: {matchFound.ram}
                        {matchFound.ram_color?.charAt(0)}
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-mono font-bold ${
                        matchFound.confidence >= 90
                          ? "bg-term-green/20 text-term-green"
                          : matchFound.confidence >= 70
                            ? "bg-term-amber/20 text-term-amber"
                            : "bg-term-red/20 text-term-red"
                      }`}
                    >
                      {matchFound.confidence}% match
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleManualConfirm}
                  className="bg-term-green text-term-black font-mono font-bold py-3 sm:py-4 px-4 rounded text-sm sm:text-base hover:bg-green-400 transition-colors min-h-[44px]"
                >
                  ✓ ADD TO COLLECTION
                </button>
                <button
                  onClick={handleRescan}
                  className="bg-term-gray border-2 border-term-amber/60 text-term-amber font-mono font-bold py-3 sm:py-4 px-4 rounded text-sm sm:text-base hover:border-term-amber transition-colors min-h-[44px]"
                >
                  ↻ RESCAN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RECENTLY SCANNED (solo en Auto-Add ON) */}
        {autoAdd && recentlyScanned.length > 0 && (
          <div className="p-3 sm:p-4 bg-term-black/50 border-t border-term-green/20 max-h-32 overflow-y-auto">
            <p className="text-term-green/60 text-xs font-mono mb-2">
              Recently added:
            </p>
            <div className="flex gap-2 flex-wrap">
              {recentlyScanned.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className="text-term-green text-xs font-mono bg-term-gray/50 px-2 py-1 rounded border border-term-green/30"
                >
                  {card.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
