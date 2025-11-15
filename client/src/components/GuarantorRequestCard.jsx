import React, { useState } from "react";
import { guarantorRequests } from "../api/api";

export default function GuarantorRequestCard({ request, onResponse }) {
  const [loading, setLoading] = useState(false);

  const getTIColor = ti => {
    if (ti >= 800) return "text-emerald-400";
    if (ti >= 600) return "text-green-400";
    if (ti >= 500) return "text-yellow-400";
    if (ti >= 400) return "text-orange-400";
    return "text-red-400";
  };

  const handleResponse = async status => {
    setLoading(true);
    try {
      await guarantorRequests.respond(request._id || request.id, { status });
      onResponse && onResponse(request._id || request.id, status);
    } catch (err) {
      console.error("Failed to respond to guarantor request", err);
      alert(err.response?.data?.message || "Failed to respond");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-semibold">
            {request.receiver?.name?.[0]?.toUpperCase() || "R"}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="font-medium text-white">
              {request.receiver?.name || "Receiver"}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`text-sm font-semibold ${getTIColor(
                  request.receiver?.trustIndex
                )}`}
              >
                TI: {request.receiver?.trustIndex || "N/A"}
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-300">
                ₹
                {request.loanRequest?.amount?.toLocaleString() ||
                  request.amount?.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-300">
                {request.loanRequest?.tenorDays || request.tenor} days
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Requested {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleResponse("ACCEPTED")}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accept
          </button>
          <button
            onClick={() => handleResponse("DECLINED")}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decline
          </button>
        </div>
      </div>

      {request.loanRequest?.purpose && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400">Purpose:</div>
          <div className="text-sm text-gray-300 mt-1">
            {request.loanRequest.purpose}
          </div>
        </div>
      )}
    </div>
  );
}
