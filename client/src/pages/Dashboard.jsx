import React, { useEffect, useState } from "react";
import { dashboard } from "../api/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [endorsers, setEndorsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await dashboard.myStats();
        setStats(res.data?.data?.stats || null);

        const contractsRes = await dashboard.myActiveContracts();
        setContracts(contractsRes.data?.data?.contracts || []);

        const endorsersRes = await dashboard.myEndorsers();
        setEndorsers(endorsersRes.data?.data?.endorsers || []);
      } catch (err) {
        // ignore for now
      }
    }
    load();
  }, []);

  return (
    <div className="container-max py-12">
      <h1 className="text-2xl font-semibold neon-text">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card p-6 rounded">
          <div className="text-sm text-gray-400">Trust Index</div>
          <div className="text-3xl font-bold neon-text">{stats?.trustIndex ?? "—"}</div>
        </div>

        <div className="card p-6 rounded">
          <div className="text-sm text-gray-400">Eligible Loan</div>
          <div className="text-3xl font-bold neon-text">{stats?.eligibleLoan ?? "—"}</div>
        </div>

        <div className="card p-6 rounded">
          <div className="text-sm text-gray-400">Endorsements Received</div>
          <div className="text-3xl font-bold neon-text">{stats?.endorsementsReceived ?? 0}</div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="card p-4 rounded">
          <h3 className="font-semibold">Active Contracts</h3>
          {contracts.length === 0 ? (
            <div className="text-gray-400 mt-3">No active contracts</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {contracts.map((c) => (
                <li key={c._id || c.id} className="p-2 border border-white/6 rounded">
                  <div className="font-medium">Contract: {c.contractId || c._id}</div>
                  <div className="text-sm text-gray-300">Status: {c.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 rounded">
          <h3 className="font-semibold">Endorsers</h3>
          {endorsers.length === 0 ? (
            <div className="text-gray-400 mt-3">No endorsers yet</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {endorsers.map((e) => (
                <li key={e._id || e.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/6 rounded-full" />
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-gray-300">TI: {e.trustIndex}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
