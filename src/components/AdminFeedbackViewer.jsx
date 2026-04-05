import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AdminFeedbackViewer({ onClose, user, showToast }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // IDs seleccionados para bulk actions

  // Load feedbacks from Supabase
  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      console.log("🔍 [ADMIN] Loading feedbacks...");

      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ [ADMIN] Error loading feedbacks:", error);
        throw error;
      }

      console.log("✅ [ADMIN] Feedbacks loaded:", data?.length || 0);
      console.log("📊 [ADMIN] Sample feedback:", data?.[0]);

      setFeedbacks(data || []);
    } catch (error) {
      console.error("❌ [ADMIN] Error in loadFeedbacks:", error);
      if (showToast) {
        showToast(`Error loading feedbacks: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleResolved = async (feedbackId, currentStatus) => {
    console.log("🔄 [ADMIN] toggleResolved called");
    console.log("  Feedback ID:", feedbackId);
    console.log("  Current status:", currentStatus);
    console.log("  New status will be:", !currentStatus);

    try {
      const { data, error } = await supabase
        .from("feedback")
        .update({ resolved: !currentStatus })
        .eq("id", feedbackId)
        .select();

      console.log("📝 [ADMIN] Update response:", { data, error });

      if (error) {
        console.error("❌ [ADMIN] Error updating:", error);
        throw error;
      }

      console.log("✅ [ADMIN] Feedback updated successfully");

      // Show success toast
      if (showToast) {
        showToast(
          !currentStatus
            ? "Feedback marked as resolved ✓"
            : "Feedback marked as unresolved",
          "success",
        );
      }

      // Reload feedbacks
      await loadFeedbacks();

      // Update selected feedback to reflect change
      if (data && data[0]) {
        setSelectedFeedback(data[0]);
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error in toggleResolved:", error);
      if (showToast) {
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  const deleteFeedback = async (feedbackId) => {
    console.log("🗑️ [ADMIN] deleteFeedback called for:", feedbackId);

    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      console.log("🚫 [ADMIN] Deletion cancelled by user");
      return;
    }

    try {
      console.log("🔄 [ADMIN] Deleting feedback...");

      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", feedbackId);

      if (error) {
        console.error("❌ [ADMIN] Delete error:", error);
        throw error;
      }

      console.log("✅ [ADMIN] Feedback deleted successfully");

      if (showToast) {
        showToast("Feedback deleted successfully", "success");
      }

      await loadFeedbacks();
      setSelectedFeedback(null);
    } catch (error) {
      console.error("❌ [ADMIN] Error in deleteFeedback:", error);
      if (showToast) {
        showToast(`Error deleting: ${error.message}`, "error");
      }
    }
  };

  // ========== BULK ACTIONS ==========
  const bulkDeleteFeedbacks = async () => {
    if (selectedIds.length === 0) {
      if (showToast) {
        showToast("No feedbacks selected", "error");
      }
      return;
    }

    const confirmMsg = `Are you sure you want to delete ${selectedIds.length} feedback${selectedIds.length > 1 ? "s" : ""}?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      console.log("🗑️ [ADMIN] Bulk deleting:", selectedIds);

      const { error } = await supabase
        .from("feedback")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      console.log("✅ [ADMIN] Bulk delete successful");

      if (showToast) {
        showToast(
          `${selectedIds.length} feedback(s) deleted successfully`,
          "success",
        );
      }

      setSelectedIds([]);
      setSelectedFeedback(null);
      await loadFeedbacks();
    } catch (error) {
      console.error("❌ [ADMIN] Bulk delete error:", error);
      if (showToast) {
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  const bulkMarkResolved = async () => {
    if (selectedIds.length === 0) {
      if (showToast) {
        showToast("No feedbacks selected", "error");
      }
      return;
    }

    try {
      console.log("✓ [ADMIN] Bulk marking as resolved:", selectedIds);

      const { error } = await supabase
        .from("feedback")
        .update({ resolved: true })
        .in("id", selectedIds);

      if (error) throw error;

      console.log("✅ [ADMIN] Bulk resolved successful");

      if (showToast) {
        showToast(
          `${selectedIds.length} feedback(s) marked as resolved`,
          "success",
        );
      }

      setSelectedIds([]);
      setSelectedFeedback(null);
      await loadFeedbacks();
    } catch (error) {
      console.error("❌ [ADMIN] Bulk resolved error:", error);
      if (showToast) {
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  const toggleSelectFeedback = (feedbackId, e) => {
    e.stopPropagation(); // Prevenir que se abra el detail view
    setSelectedIds((prev) =>
      prev.includes(feedbackId)
        ? prev.filter((id) => id !== feedbackId)
        : [...prev, feedbackId],
    );
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filterCategory !== "all" && fb.category !== filterCategory)
      return false;
    if (filterStatus === "resolved" && !fb.resolved) return false;
    if (filterStatus === "unresolved" && fb.resolved) return false;
    return true;
  });

  // Category counts
  const categoryCounts = feedbacks.reduce(
    (acc, fb) => {
      acc[fb.category] = (acc[fb.category] || 0) + 1;
      return acc;
    },
    { bug: 0, feature: 0, improvement: 0, other: 0 },
  );

  const resolvedCount = feedbacks.filter((fb) => fb.resolved).length;
  const unresolvedCount = feedbacks.length - resolvedCount;

  // DEBUG: Log counts
  useEffect(() => {
    console.log("📊 [ADMIN] Feedback counts:", {
      total: feedbacks.length,
      resolved: resolvedCount,
      unresolved: unresolvedCount,
      bugs: categoryCounts.bug,
      features: categoryCounts.feature,
    });
  }, [feedbacks, resolvedCount, unresolvedCount, categoryCounts]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-term-gray border-2 border-term-red rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-term-gray border-b border-term-red p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-2xl font-bold text-term-red font-mono">
                [ADMIN] FEEDBACK VIEWER
              </h2>
              <p className="text-term-green/60 font-mono text-xs mt-1">
                Logged in as:{" "}
                {user?.discord_username || user?.email || "Unknown"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-term-red hover:text-red-400 font-mono text-2xl transition-colors"
              title="Close (ESC)"
            >
              ✕
            </button>
          </div>

          {/* BULK ACTION BUTTONS */}
          {selectedIds.length > 0 && (
            <div className="flex gap-2 pt-3 border-t border-term-amber/20">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-term-amber font-mono text-sm">
                  {selectedIds.length} selected
                </span>
              </div>
              <button
                onClick={bulkMarkResolved}
                className="px-4 py-2 bg-term-green/20 text-term-green border border-term-green rounded font-mono text-sm hover:bg-term-green/30 transition-colors"
              >
                [MARK RESOLVED]
              </button>
              <button
                onClick={bulkDeleteFeedbacks}
                className="px-4 py-2 bg-term-red/20 text-term-red border border-term-red rounded font-mono text-sm hover:bg-term-red/30 transition-colors"
              >
                [DELETE SELECTED]
              </button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="bg-black/20 border-b border-term-amber/20 p-4">
          <div className="grid grid-cols-6 gap-3">
            <div className="bg-term-gray/50 border border-term-green/30 rounded p-3 text-center">
              <p className="text-term-green/60 font-mono text-xs mb-1">TOTAL</p>
              <p className="text-term-green font-mono text-2xl font-bold">
                {feedbacks.length}
              </p>
            </div>

            <div className="bg-term-gray/50 border border-term-red/30 rounded p-3 text-center">
              <p className="text-term-red/60 font-mono text-xs mb-1">BUGS</p>
              <p className="text-term-red font-mono text-2xl font-bold">
                {categoryCounts.bug}
              </p>
            </div>

            <div className="bg-term-gray/50 border border-term-blue/30 rounded p-3 text-center">
              <p className="text-term-blue/60 font-mono text-xs mb-1">
                FEATURES
              </p>
              <p className="text-term-blue font-mono text-2xl font-bold">
                {categoryCounts.feature}
              </p>
            </div>

            <div className="bg-term-gray/50 border border-term-amber/30 rounded p-3 text-center">
              <p className="text-term-amber/60 font-mono text-xs mb-1">
                IMPROVEMENTS
              </p>
              <p className="text-term-amber font-mono text-2xl font-bold">
                {categoryCounts.improvement}
              </p>
            </div>

            <div className="bg-term-gray/50 border border-term-green/30 rounded p-3 text-center">
              <p className="text-term-green/60 font-mono text-xs mb-1">
                RESOLVED
              </p>
              <p className="text-term-green font-mono text-2xl font-bold">
                {resolvedCount}
              </p>
            </div>

            <div className="bg-term-gray/50 border border-term-red/30 rounded p-3 text-center">
              <p className="text-term-red/60 font-mono text-xs mb-1">PENDING</p>
              <p className="text-term-red font-mono text-2xl font-bold">
                {unresolvedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/20 border-b border-term-amber/20 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-term-amber font-mono text-xs mb-2">
                FILTER BY CATEGORY:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-term-gray border border-term-green/30 rounded px-3 py-2 text-term-green font-mono text-sm focus:outline-none focus:border-term-green"
              >
                <option value="all">All Categories</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-term-amber font-mono text-xs mb-2">
                FILTER BY STATUS:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-term-gray border border-term-green/30 rounded px-3 py-2 text-term-green font-mono text-sm focus:outline-none focus:border-term-green"
              >
                <option value="all">All Statuses</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadFeedbacks}
                className="px-4 py-2 bg-term-green/20 text-term-green border border-term-green rounded font-mono hover:bg-term-green/30 transition-colors"
              >
                [REFRESH]
              </button>
            </div>
          </div>
        </div>

        {/* Content: List + Detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Feedback List */}
          <div className="w-1/3 border-r border-term-amber/20 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-term-green font-mono animate-pulse">
                  [LOADING FEEDBACKS...]
                </p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-term-green/60 font-mono text-sm">
                  No feedbacks found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-term-amber/20">
                {filteredFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className={`p-4 cursor-pointer transition-colors flex gap-3 ${
                      selectedFeedback?.id === fb.id
                        ? "bg-term-amber/20 border-l-4 border-term-amber"
                        : selectedIds.includes(fb.id)
                          ? "bg-term-blue/10"
                          : "hover:bg-term-green/10"
                    }`}
                  >
                    {/* Checkbox (SIEMPRE VISIBLE) */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(fb.id)}
                        onChange={(e) => toggleSelectFeedback(fb.id, e)}
                        className="w-4 h-4 cursor-pointer accent-term-green"
                      />
                    </div>

                    {/* Feedback Content */}
                    <div
                      className="flex-1"
                      onClick={() => setSelectedFeedback(fb)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                            fb.category === "bug"
                              ? "bg-term-red/20 text-term-red"
                              : fb.category === "feature"
                                ? "bg-term-blue/20 text-term-blue"
                                : fb.category === "improvement"
                                  ? "bg-term-amber/20 text-term-amber"
                                  : "bg-term-green/20 text-term-green"
                          }`}
                        >
                          {fb.category.toUpperCase()}
                        </span>

                        {fb.resolved && (
                          <span className="text-term-green text-lg font-mono font-bold">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="text-term-green font-mono text-sm line-clamp-2 mb-2">
                        {fb.message}
                      </p>

                      <p className="text-term-green/40 font-mono text-xs">
                        {new Date(fb.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Feedback Detail */}
          <div className="flex-1 overflow-y-auto">
            {selectedFeedback ? (
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-sm font-mono font-bold px-3 py-1 rounded ${
                        selectedFeedback.category === "bug"
                          ? "bg-term-red/20 text-term-red"
                          : selectedFeedback.category === "feature"
                            ? "bg-term-blue/20 text-term-blue"
                            : selectedFeedback.category === "improvement"
                              ? "bg-term-amber/20 text-term-amber"
                              : "bg-term-green/20 text-term-green"
                      }`}
                    >
                      {selectedFeedback.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log("🖱️ [ADMIN] Mark Resolved button clicked");
                        toggleResolved(
                          selectedFeedback.id,
                          selectedFeedback.resolved,
                        );
                      }}
                      className={`px-3 py-1 rounded font-mono text-sm transition-colors ${
                        selectedFeedback.resolved
                          ? "bg-term-red/20 text-term-red border border-term-red hover:bg-term-red/30"
                          : "bg-term-green/20 text-term-green border border-term-green hover:bg-term-green/30"
                      }`}
                    >
                      {selectedFeedback.resolved
                        ? "[MARK UNRESOLVED]"
                        : "[MARK RESOLVED]"}
                    </button>

                    <button
                      onClick={() => deleteFeedback(selectedFeedback.id)}
                      className="px-3 py-1 bg-term-red/20 text-term-red border border-term-red rounded font-mono text-sm hover:bg-term-red/30 transition-colors"
                    >
                      [DELETE]
                    </button>
                  </div>
                </div>

                <div className="bg-term-gray/50 border border-term-green/30 rounded p-4">
                  <h3 className="text-term-amber font-mono font-bold mb-2">
                    MESSAGE:
                  </h3>
                  <p className="text-term-green font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>

                <div className="bg-term-gray/50 border border-term-blue/30 rounded p-4">
                  <h3 className="text-term-blue font-mono font-bold mb-3">
                    METADATA:
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                    <div>
                      <p className="text-term-blue/60 mb-1">USER ID:</p>
                      <p className="text-term-green break-all text-xs">
                        {selectedFeedback.user_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-term-blue/60 mb-1">TIMESTAMP:</p>
                      <p className="text-term-green">
                        {new Date(selectedFeedback.created_at).toLocaleString()}
                      </p>
                    </div>

                    {selectedFeedback.metadata && (
                      <>
                        <div>
                          <p className="text-term-blue/60 mb-1">BROWSER:</p>
                          <p className="text-term-green">
                            {selectedFeedback.metadata.browser || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-term-blue/60 mb-1">OS:</p>
                          <p className="text-term-green">
                            {selectedFeedback.metadata.os || "N/A"}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-term-blue/60 mb-1">URL:</p>
                          <p className="text-term-green break-all text-xs">
                            {selectedFeedback.metadata.url || "N/A"}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-term-blue/60 mb-1">USER AGENT:</p>
                          <p className="text-term-green text-xs break-all">
                            {selectedFeedback.metadata.userAgent || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`border rounded p-4 ${
                    selectedFeedback.resolved
                      ? "border-term-green bg-term-green/10"
                      : "border-term-red bg-term-red/10"
                  }`}
                >
                  <p
                    className={`font-mono font-bold ${
                      selectedFeedback.resolved
                        ? "text-term-green"
                        : "text-term-red"
                    }`}
                  >
                    STATUS:{" "}
                    {selectedFeedback.resolved ? "RESOLVED ✓" : "PENDING ⚠"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-term-green/60 font-mono text-sm">
                  ← Select a feedback to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-term-amber p-4">
          <div className="flex justify-between items-center">
            <p className="text-term-green/60 font-mono text-xs">
              Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
            </p>
            <p className="text-term-amber/60 font-mono text-xs">
              Press ESC or click ✕ to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
