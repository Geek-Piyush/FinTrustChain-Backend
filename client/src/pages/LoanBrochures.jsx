import React, { useEffect, useState } from "react";
import { brochures } from "../api/api";

export default function LoanBrochures() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await brochures.list();
        // Normalize different possible response shapes to an array
        const data = res?.data;
        const arr = data?.data?.brochures || data?.brochures || data?.data || data || [];
        setItems(Array.isArray(arr) ? arr : []);
      } catch (err) {
        // ignore for now
      }
    }
    load();
  }, []);

  return (
    <div className="container-max py-12">
      <h2 className="text-2xl font-semibold neon-text">Loan Brochures</h2>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.length === 0 && <div className="card p-4">No brochures found</div>}
        {items.map((b) => (
          <div key={b._id || b.id} className="card p-4 rounded">
            <h3 className="font-semibold">₹{b.amount}</h3>
            <p className="text-sm text-gray-300">Tenor: {b.tenorDays} days</p>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-400">Lender: {b.lender?.name || '—'}</div>
              <div className="text-sm neon-text">{b.interestRate}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
