import React, { useEffect, useState } from "react";
import { dashboard, payments as paymentsApi } from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function Payments() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await dashboard.myActiveContracts();
        if (!mounted) return;
        const list = res?.data?.data?.contracts || res?.data || [];
        setContracts(Array.isArray(list) ? list : []);
      } catch (err) {
        setContracts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const handlePay = async contractId => {
    setPaying(contractId);
    try {
      const res = await paymentsApi.pay({ contractId });
      const redirectUrl =
        res?.data?.data?.redirectUrl || res?.data?.redirectUrl;
      if (redirectUrl) {
        // Redirect to PhonePe payment page
        window.location.href = redirectUrl;
      } else {
        toast.error("Failed to get payment URL");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Payment failed"
      );
      setPaying(null);
    }
  };

  return (
    <div className="container-max py-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl neon-text font-semibold mb-4">Payments</h2>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-4">
            {contracts.length === 0 && (
              <div className="card p-4">
                No active contracts available for payment.
              </div>
            )}
            {contracts.map(c => (
              <div
                key={c._id || c.id}
                className="card p-4 rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    Contract: {c.contractId || c._id}
                  </div>
                  <div className="text-sm text-gray-300">
                    Status: {c.status} • Amount: ₹
                    {c.totalAmount?.toLocaleString?.() ?? c.amount}
                  </div>
                </div>
                <div>
                  <button
                    className="btn-neon px-4 py-2 rounded"
                    onClick={() => handlePay(c._id || c.id)}
                    disabled={paying === (c._id || c.id)}
                  >
                    {paying === (c._id || c.id) ? "Processing..." : "Pay"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
