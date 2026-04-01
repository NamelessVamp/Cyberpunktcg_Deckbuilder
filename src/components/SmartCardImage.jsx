import { useState, useEffect } from "react";
import { getImageUrl } from "../lib/imageService";

/**
 * SmartCardImage - Intelligent image loading with waterfall fallback
 * Tries: Original URL → Supabase backup → Placeholder
 */
export default function SmartCardImage({
  card,
  className = "",
  showLoadingState = false,
  eagerLoad = false, // ← NUEVO: permite forzar eager loading
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sources = getImageUrl(card);
  const srcArray = [sources.primary, sources.fallback, sources.placeholder];

  // Reset state when card changes
  useEffect(() => {
    setCurrentSrc(0);
    setIsLoading(true);
    setHasError(false);
  }, [card.id]);

  const handleError = () => {
    if (currentSrc < srcArray.length - 1) {
      const nextIndex = currentSrc + 1;
      console.warn(
        `[SmartCardImage] Failed to load image for "${card.name}" (attempt ${currentSrc + 1}). Trying fallback ${nextIndex + 1}...`,
      );
      setCurrentSrc(nextIndex);
    } else {
      console.error(
        `[SmartCardImage] All image sources failed for "${card.name}"`,
      );
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (currentSrc === 1) {
      console.info(
        `[SmartCardImage] Using Supabase fallback for "${card.name}"`,
      );
    } else if (currentSrc === 2) {
      console.warn(`[SmartCardImage] Using placeholder for "${card.name}"`);
    }
  };

  return (
    <div className="relative">
      {/* Loading Skeleton */}
      {showLoadingState && isLoading && (
        <div className="absolute inset-0 bg-term-gray-light animate-pulse rounded" />
      )}

      {/* Image */}
      <img
        src={srcArray[currentSrc]}
        alt={card.name}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
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
