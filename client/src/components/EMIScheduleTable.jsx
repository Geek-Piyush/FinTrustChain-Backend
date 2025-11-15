import React from "react";

export default function EMIScheduleTable({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="text-gray-400 text-center py-6">
        No EMI schedule available
      </div>
    );
  }

  const getStatusBadge = status => {
    const statusColors = {
      PAID: "bg-green-500/20 text-green-400 border-green-500",
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      OVERDUE: "bg-red-500/20 text-red-400 border-red-500",
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

  const isOverdue = (dueDate, status) => {
    return status === "PENDING" && new Date(dueDate) < new Date();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-3 text-sm font-semibold text-gray-300">
              EMI #
            </th>
            <th className="text-left p-3 text-sm font-semibold text-gray-300">
              Due Date
            </th>
            <th className="text-right p-3 text-sm font-semibold text-gray-300">
              Principal
            </th>
            <th className="text-right p-3 text-sm font-semibold text-gray-300">
              Interest
            </th>
            <th className="text-right p-3 text-sm font-semibold text-gray-300">
              Total EMI
            </th>
            <th className="text-center p-3 text-sm font-semibold text-gray-300">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((emi, idx) => {
            const overdue = isOverdue(emi.dueDate, emi.status);
            return (
              <tr
                key={idx}
                className={`border-b border-white/5 ${
                  emi.status === "PAID"
                    ? "bg-green-500/5"
                    : overdue
                    ? "bg-red-500/10"
                    : idx === schedule.findIndex(e => e.status === "PENDING")
                    ? "bg-yellow-500/10"
                    : ""
                }`}
              >
                <td className="p-3 text-sm text-white font-medium">
                  #{emi.emiNumber || idx + 1}
                </td>
                <td className="p-3 text-sm text-gray-300">
                  {new Date(emi.dueDate).toLocaleDateString()}
                  {overdue && (
                    <span className="ml-2 text-xs text-red-400">(Overdue)</span>
                  )}
                </td>
                <td className="p-3 text-sm text-gray-300 text-right">
                  ₹{emi.principal?.toLocaleString()}
                </td>
                <td className="p-3 text-sm text-gray-300 text-right">
                  ₹{emi.interest?.toLocaleString()}
                </td>
                <td className="p-3 text-sm text-white font-semibold text-right">
                  ₹{(emi.principal + emi.interest).toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  {getStatusBadge(overdue ? "OVERDUE" : emi.status)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-white/20 bg-white/5">
            <td colSpan="2" className="p-3 text-sm font-semibold text-white">
              Total
            </td>
            <td className="p-3 text-sm font-semibold text-white text-right">
              ₹
              {schedule
                .reduce((sum, emi) => sum + (emi.principal || 0), 0)
                .toLocaleString()}
            </td>
            <td className="p-3 text-sm font-semibold text-white text-right">
              ₹
              {schedule
                .reduce((sum, emi) => sum + (emi.interest || 0), 0)
                .toLocaleString()}
            </td>
            <td className="p-3 text-sm font-semibold text-white text-right">
              ₹
              {schedule
                .reduce(
                  (sum, emi) =>
                    sum + (emi.principal || 0) + (emi.interest || 0),
                  0
                )
                .toLocaleString()}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
