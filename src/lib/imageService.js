/**
 * Image Service
 *
 * Loading order:
 * 1. Original card image URL
 * 2. Supabase Storage backup
 * 3. Locally generated SVG placeholder
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const CARD_IMAGE_BUCKET = "card-images";

/**
 * Return the ordered image sources for a card.
 *
 * @param {object} card
 * @returns {{
 *   primary: string,
 *   fallback: string,
 *   placeholder: string
 * }}
 */
export function getImageUrl(card = {}) {
  return {
    primary: sanitizeUrl(card.image_url),
    fallback: getSupabaseImageUrl(card.id),
    placeholder: getPlaceholder(card),
  };
}

/**
 * Extract a usable HTTP URL from either a normal URL or a string
 * accidentally wrapped in HTML anchor markup.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeUrl(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const hrefMatch = trimmedValue.match(/href=https?:\/\/[^"']+["']/i);

  if (hrefMatch?.[1]) {
    return decodeHtmlEntities(hrefMatch[1]);
  }

  const directUrlMatch = trimmedValue.match(/https?:\/\/[^\s"'<>]+/i);

  return directUrlMatch?.[0] ? decodeHtmlEntities(directUrlMatch[0]) : "";
}

/**
 * Build the public Supabase Storage URL for a card image.
 *
 * @param {string} cardId
 * @returns {string}
 */
function getSupabaseImageUrl(cardId) {
  if (!SUPABASE_URL || !cardId) {
    return "";
  }

  const encodedCardId = encodeURIComponent(cardId);

  return (
    `${SUPABASE_URL}/storage/v1/object/public/` +
    `${CARD_IMAGE_BUCKET}/${encodedCardId}.webp`
  );
}

/**
 * Generate an offline SVG placeholder as a data URL.
 *
 * @param {object} card
 * @returns {string}
 */
function getPlaceholder(card = {}) {
  const type = normalizeCardType(card.type);
  const name = escapeSvgText(card.name || "Image unavailable");
  const subtitle = escapeSvgText(card.subtitle || type.label);

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="300"
      height="420"
      viewBox="0 0 300 420"
      role="img"
      aria-label="${name}"
    >
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#111318" />
          <stop offset="100%" stop-color="#08090c" />
        </linearGradient>

        <pattern
          id="grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="${type.color}"
            stroke-opacity="0.08"
            stroke-width="1"
          />
        </pattern>
      </defs>

      <rect width="300" height="420" rx="18" fill="url(#background)" />
      <rect width="300" height="420" rx="18" fill="url(#grid)" />

      <rect
        x="1.5"
        y="1.5"
        width="297"
        height="417"
        rx="16.5"
        fill="none"
        stroke="${type.color}"
        stroke-opacity="0.55"
        stroke-width="3"
      />

      <rect
        x="24"
        y="24"
        width="252"
        height="34"
        rx="9"
        fill="${type.color}"
        fill-opacity="0.12"
        stroke="${type.color}"
        stroke-opacity="0.35"
      />

      <text
        x="40"
        y="46"
        fill="${type.color}"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="700"
        letter-spacing="2"
      >
        ${type.label}
      </text>

      <path
        d="M95 144 H205 V254 H95 Z"
        fill="none"
        stroke="${type.color}"
        stroke-opacity="0.55"
        stroke-width="3"
      />

      <path
        d="M111 230 L145 194 L168 218 L188 196 L205 216"
        fill="none"
        stroke="${type.color}"
        stroke-opacity="0.7"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <circle
        cx="126"
        cy="174"
        r="12"
        fill="${type.color}"
        fill-opacity="0.65"
      />

      <text
        x="150"
        y="300"
        text-anchor="middle"
        fill="#f5f7fa"
        font-family="Arial, sans-serif"
        font-size="20"
        font-weight="700"
      >
        ${truncateText(name, 24)}
      </text>

      <text
        x="150"
        y="328"
        text-anchor="middle"
        fill="#9ca3af"
        font-family="Arial, sans-serif"
        font-size="13"
      >
        ${truncateText(subtitle, 30)}
      </text>

      <text
        x="150"
        y="376"
        text-anchor="middle"
        fill="${type.color}"
        fill-opacity="0.75"
        font-family="Arial, sans-serif"
        font-size="11"
        letter-spacing="2"
      >
        IMAGE UNAVAILABLE
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Normalize supported card types.
 *
 * @param {string} cardType
 * @returns {{ label: string, color: string }}
 */
function normalizeCardType(cardType) {
  const cardTypes = {
    LEGEND: {
      label: "LEGEND",
      color: "#f5b800",
    },
    UNIT: {
      label: "UNIT",
      color: "#ef4444",
    },
    GEAR: {
      label: "GEAR",
      color: "#22d3ee",
    },
    PROGRAM: {
      label: "PROGRAM",
      color: "#a78bfa",
    },
  };

  return (
    cardTypes[String(cardType || "").toUpperCase()] || {
      label: "CARD",
      color: "#f5b800",
    }
  );
}

/**
 * Decode the small set of HTML entities expected inside URLs.
 *
 * @param {string} value
 * @returns {string}
 */
function decodeHtmlEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

/**
 * Escape text before placing it inside generated SVG markup.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeSvgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * Keep placeholder labels within the available width.
 *
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
function truncateText(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

/**
 * Check whether an image URL responds successfully.
 *
 * Some CDNs may reject HEAD requests while still allowing GET.
 *
 * @param {string} url
 * @returns {Promise<boolean>}
 */
export async function isImageAccessible(url) {
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Detect WebP support.
 *
 * @returns {"webp" | "png"}
 */
export function getSupportedImageFormat() {
  const canvas = document.createElement("canvas");

  if (!canvas.getContext?.("2d")) {
    return "png";
  }

  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "webp"
    : "png";
}

/**
 * Preload an image.
 *
 * @param {string} url
 * @returns {Promise<void>}
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("Cannot preload an empty image URL."));
      return;
    }

    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`));

    image.src = url;
  });
}
