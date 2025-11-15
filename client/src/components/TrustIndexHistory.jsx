import React, { useEffect, useState } from "react";
import { dashboard } from "../api/api";
import Loader from "./Loader";

export default function TrustIndexHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await dashboard.tiHistory();
      setHistory(res.data?.data?.tiHistory || res.data?.tiHistory || []);
    } catch (err) {
      console.error("Failed to load TI history", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      {history.length === 0 ? (
        <div className="text-gray-400 text-center py-6">No history yet</div>
      ) : (
        <div className="space-y-2">
          {history
            .slice()
            .reverse()
            .map((entry, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {entry.reason || "TI Update"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(entry.date || entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`font-bold text-lg ${
                      entry.change >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {entry.change >= 0 ? "+" : ""}
                    {entry.change}
                  </div>
                  <div className="text-sm text-gray-300">
                    →{" "}
                    <span className="font-semibold">
                      {entry.newTI || entry.trustIndex}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
