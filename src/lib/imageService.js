/**
 * Image Service - Hybrid loading strategy
 * 1. Try original URL (Discord/Cloudfront)
 * 2. Fallback to Supabase Storage
 * 3. Fallback to placeholder
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get image URLs with fallback strategy
 * @param {object} card - Card object
 * @returns {object} - { primary, fallback, placeholder }
 */
export function getImageUrl(card) {
  return {
    primary: card.image_url || "",
    fallback: getSupabaseImageUrl(card.id),
    import noImage from "../assets/placeholders/no-image.webp";
  };
}

/**
 * Get Supabase Storage URL for card image
 * @param {string} cardId - Card ID
 * @returns {string} - Supabase Storage URL
 */
function getSupabaseImageUrl(cardId) {
  if (!SUPABASE_URL) {
    console.warn("VITE_SUPABASE_URL not configured");
    return "";
  }

  return `${SUPABASE_URL}/storage/v1/object/public/card-images/${cardId}.webp`;
}

/**
 * Get placeholder image based on card type
 * @param {string} cardType - Card type (LEGEND, ASSET, EVENT, etc)
 * @returns {string} - Placeholder URL
 */
function getPlaceholder(cardType) {
  const placeholders = {
    LEGEND: "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=LEGEND",
    ASSET: "https://via.placeholder.com/300x420/1a1a1a/00ff41?text=ASSET",
    EVENT: "https://via.placeholder.com/300x420/1a1a1a/ff4141?text=EVENT",
    GIGS: "https://via.placeholder.com/300x420/1a1a1a/4169e1?text=GIGS",
    default: "https://via.placeholder.com/300x420/1a1a1a/ffb300?text=NO+IMAGE",
  };

  return placeholders[cardType] || placeholders.default;
}

/**
 * Check if image URL is accessible
 * @param {string} url - Image URL
 * @returns {Promise<boolean>}
 */
export async function isImageAccessible(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get optimal image format based on browser support
 * @returns {string} - 'webp' or 'png'
 */
export function getSupportedImageFormat() {
  // Check if browser supports WebP
  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
      ? "webp"
      : "png";
  }
  return "png";
}

/**
 * Preload image for better UX
 * @param {string} url - Image URL
 * @returns {Promise<void>}
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}
