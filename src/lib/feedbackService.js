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
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
  };
}
