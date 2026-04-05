import { supabase } from "./supabase";

/**
 * Submit feedback to Supabase
 * @param {string} userId - User ID (or 'anonymous' if not logged in)
 * @param {string} category - 'bug' | 'feature' | 'general'
 * @param {string} message - Feedback content
 * @param {object} metadata - Optional: browser info, current page, etc
 */
export async function submitFeedback(userId, category, message, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          user_id: userId,
          category,
          message,
          metadata,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get browser/system metadata for debugging
 */
export function getSystemMetadata() {
  const userAgent = navigator.userAgent;

  // Browser detection
  let browser = "Unknown";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg"))
    browser = "Edge"; // ← Edge antes de Chrome
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Opera")) browser = "Opera";

  // OS detection
  let os = "Unknown";
  if (userAgent.includes("Windows NT 10")) os = "Windows 10/11";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS X")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (
    userAgent.includes("iOS") ||
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad")
  )
    os = "iOS";

  return {
    browser, // ← NUEVO: Browser detectado
    os, // ← NUEVO: OS detectado
    url: window.location.href, // ← NUEVO: URL actual
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
  };
}
