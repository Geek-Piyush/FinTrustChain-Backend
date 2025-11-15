import React from "react";

export default function PaymentHistoryTable({ payments }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="text-gray-400 text-center py-6">
        No payment history yet
      </div>
    );
  }

  const getStatusBadge = status => {
    const statusColors = {
      SUCCESS: "bg-green-500/20 text-green-400 border-green-500",
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      FAILED: "bg-red-500/20 text-red-400 border-red-500",
      ACKNOWLEDGED: "bg-blue-500/20 text-blue-400 border-blue-500",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium border ${
          statusColors[status] || statusColors.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-3 text-sm font-semibold text-gray-300">
              Date
            </th>
            <th className="text-left p-3 text-sm font-semibold text-gray-300">
              EMI #
            </th>
            <th className="text-right p-3 text-sm font-semibold text-gray-300">
              Amount
            </th>
            <th className="text-left p-3 text-sm font-semibold text-gray-300">
              Transaction ID
            </th>
            <th className="text-center p-3 text-sm font-semibold text-gray-300">
              Status
            </th>
            <th className="text-center p-3 text-sm font-semibold text-gray-300">
              Proof
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, idx) => (
            <tr
              key={idx}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="p-3 text-sm text-gray-300">
                {new Date(payment.date || payment.createdAt).toLocaleString()}
              </td>
              <td className="p-3 text-sm text-white font-medium">
                #{payment.emiNumber || payment.emi || "-"}
              </td>
              <td className="p-3 text-sm text-white font-semibold text-right">
                ₹{payment.amount?.toLocaleString()}
              </td>
              <td className="p-3 text-sm text-gray-300 font-mono text-xs">
                {payment.transactionId || payment.txnId || "N/A"}
              </td>
              <td className="p-3 text-center">
                {getStatusBadge(payment.status)}
              </td>
              <td className="p-3 text-center">
                {payment.proofUrl || payment.proof ? (
                  <button
                    onClick={() =>
                      window.open(payment.proofUrl || payment.proof, "_blank")
                    }
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-500 text-xs">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
