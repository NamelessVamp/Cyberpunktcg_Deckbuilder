import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AdminFeedbackViewer({ onClose, user, showToast }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

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
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      if (showToast) {
        showToast(`Error loading feedbacks: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleResolved = async (feedbackId, currentStatus) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ resolved: !currentStatus })
        .eq("id", feedbackId);

      if (error) throw error;

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
    } catch (error) {
      console.error("Error updating feedback:", error);
      if (showToast) {
        showToast(`Error updating feedback: ${error.message}`, "error");
      }
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;

      // Show success toast
      if (showToast) {
        showToast("Feedback deleted successfully", "success");
      }

      await loadFeedbacks();
      setSelectedFeedback(null);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      if (showToast) {
        showToast(`Error deleting feedback: ${error.message}`, "error");
      }
    }
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

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-term-gray border-2 border-term-red rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Solo ✕ para cerrar */}
        <div className="bg-term-gray border-b border-term-red p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-term-red font-mono">
              [ADMIN] FEEDBACK VIEWER
            </h2>
            <p className="text-term-green/60 font-mono text-xs mt-1">
              Logged in as: {user?.discord_username || user?.email || "Unknown"}
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
            {/* Category Filter */}
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

            {/* Status Filter */}
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

            {/* Refresh Button */}
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
                    onClick={() => setSelectedFeedback(fb)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedFeedback?.id === fb.id
                        ? "bg-term-amber/20 border-l-4 border-term-amber"
                        : "hover:bg-term-green/10"
                    }`}
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
                        <span className="text-term-green text-xs font-mono font-bold">
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
                ))}
              </div>
            )}
          </div>

          {/* Right: Feedback Detail */}
          <div className="flex-1 overflow-y-auto">
            {selectedFeedback ? (
              <div className="p-6 space-y-6">
                {/* Header */}
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
                      onClick={() =>
                        toggleResolved(
                          selectedFeedback.id,
                          selectedFeedback.resolved,
                        )
                      }
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

                {/* Message */}
                <div className="bg-term-gray/50 border border-term-green/30 rounded p-4">
                  <h3 className="text-term-amber font-mono font-bold mb-2">
                    MESSAGE:
                  </h3>
                  <p className="text-term-green font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>

                {/* Metadata */}
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

                {/* Status */}
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

        {/* Footer - Solo stats, sin botón redundante */}
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
