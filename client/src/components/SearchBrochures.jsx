import React, { useState, useEffect } from "react";
import { dashboard } from "../api/api";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

export default function SearchBrochures({ onBrochureSelect }) {
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBrochures();
  }, []);

  const loadBrochures = async () => {
    setLoading(true);
    try {
      const res = await dashboard.eligibleBrochures();
      const list = res?.data?.data?.brochures || res?.data?.brochures || [];
      setBrochures(list);
    } catch (err) {
      console.error("Failed to load brochures", err);
    } finally {
      setLoading(false);
    }
  };

  const getTIColor = ti => {
    if (ti >= 800) return "text-emerald-400";
    if (ti >= 600) return "text-green-400";
    if (ti >= 500) return "text-yellow-400";
    if (ti >= 400) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) return <Loader />;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          Available Loan Brochures
        </h2>
        <button
          onClick={loadBrochures}
          className="text-sm px-3 py-1 rounded border border-white/20 hover:bg-white/10 transition-colors"
        >
          Refresh
        </button>
      </div>

      {brochures.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-400">
            No eligible brochures available at the moment
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check back later or improve your Trust Index
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brochures.map(brochure => (
            <div
              key={brochure._id || brochure.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => onBrochureSelect && onBrochureSelect(brochure)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl font-bold text-white">
                    ₹{brochure.amount?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {brochure.tenorDays || brochure.tenor} days
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-400">
                    {brochure.interestRate || brochure.roi}%
                  </div>
                  <div className="text-xs text-gray-400">interest</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                    {brochure.lender?.name?.[0]?.toUpperCase() || "L"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {brochure.lender?.name || "Lender"}
                    </div>
                    <div
                      className={`text-xs font-semibold ${getTIColor(
                        brochure.lender?.trustIndex
                      )}`}
                    >
                      TI: {brochure.lender?.trustIndex || "N/A"}
                    </div>
                  </div>
                </div>

                {brochure.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {brochure.description}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (onBrochureSelect) {
                        onBrochureSelect(brochure);
                      } else {
                        navigate("/create-loan-request", {
                          state: { brochure },
                        });
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    Request Loan
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Posted {new Date(brochure.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
