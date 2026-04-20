import { useState, useEffect, useRef } from "react";
import { getImageUrl } from "../lib/imageService";

/**
 * SmartCardImage - Intelligent image loading with waterfall fallback
 * Tries: Original URL → Supabase backup → Placeholder
 */
export default function SmartCardImage({
  card,
  className = "",
  showLoadingState = false,
  eagerLoad = false,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null); // <-- EL ESCÁNER

  const sources = getImageUrl(card);
  const srcArray = [sources.primary, sources.fallback, sources.placeholder];

  // Reset state when card changes
  useEffect(() => {
    setCurrentSrc(0);
    setIsLoading(true);
    setHasError(false);
  }, [card.id]);

  // FIX: PHANTOM CACHE BUG
  // Si la imagen ya se cargó instantáneamente desde el caché, quita el loading
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoading(false);
    }
  }, [currentSrc, card.id]);

  const handleError = () => {
    if (currentSrc < srcArray.length - 1) {
      const nextIndex = currentSrc + 1;
      console.warn(
        `[SmartCardImage] Failed to load image for "${card.name}". Trying fallback...`,
      );
      setCurrentSrc(nextIndex);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading Skeleton */}
      {null}

      {/* Image */}
      <img
        ref={imgRef} // <-- CONECTAMOS EL ESCÁNER AQUÍ
        src={srcArray[currentSrc]}
        alt={card.name}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading={eagerLoad ? "eager" : "lazy"}
        {...props}
      />

      {/* Error Badge */}
      {hasError && currentSrc === 2 && (
        <div className="absolute top-2 left-2 bg-term-red/80 text-white text-xs px-2 py-1 rounded font-mono font-bold">
          NO IMG
        </div>
      )}
    </div>
  );
}
