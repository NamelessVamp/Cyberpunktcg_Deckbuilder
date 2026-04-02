import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AdminFeedbackView() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading feedback:", error);
    } else {
      setFeedback(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-term-green font-mono">Loading feedback...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-term-amber font-bold text-3xl font-mono mb-6">
        FEEDBACK ADMIN PANEL
      </h1>

      <div className="space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="bg-term-gray border border-term-amber/40 rounded p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-term-green font-mono font-bold">
                {item.category.toUpperCase()}
              </span>
              <span className="text-term-amber/60 text-xs font-mono">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>

            <p className="text-term-green font-mono text-sm mb-2">
              {item.message}
            </p>

            <div className="text-term-green/60 text-xs font-mono">
              User ID: {item.user_id}
            </div>

            {item.metadata && (
              <details className="mt-2">
                <summary className="text-term-blue text-xs font-mono cursor-pointer">
                  [SYSTEM INFO]
                </summary>
                <pre className="text-xs text-term-green/60 mt-2 overflow-auto">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {feedback.length === 0 && (
        <p className="text-term-green/60 font-mono text-center">
          No feedback yet
        </p>
      )}
    </div>
  );
}
