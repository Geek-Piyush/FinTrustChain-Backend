import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { contracts, payments } from "../api/api";
import EMIScheduleTable from "../components/EMIScheduleTable";
import PaymentHistoryTable from "../components/PaymentHistoryTable";
import Loader from "../components/Loader";

export default function ContractDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [emiSchedule, setEmiSchedule] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadContract = async () => {
    setLoading(true);
    try {
      const [contractRes, scheduleRes, historyRes] = await Promise.all([
        contracts.get(id),
        contracts
          .getEMISchedule(id)
          .catch(() => ({ data: { data: { schedule: [] } } })),
        contracts
          .getPaymentHistory(id)
          .catch(() => ({ data: { data: { payments: [] } } })),
      ]);

      setContract(
        contractRes.data?.data?.contract || contractRes.data?.contract
      );
      setEmiSchedule(
        scheduleRes.data?.data?.schedule || scheduleRes.data?.schedule || []
      );
      setPaymentHistory(
        historyRes.data?.data?.payments || historyRes.data?.payments || []
      );
    } catch (err) {
      console.error("Failed to load contract", err);
      alert("Failed to load contract");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSign = async () => {
    if (!confirm("Sign this contract?")) return;
    setSigning(true);
    try {
      await contracts.sign(id);
      alert("Contract signed successfully!");
      loadContract();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to sign contract");
    } finally {
      setSigning(false);
    }
  };

  const handleDisburse = async () => {
    if (!confirm(`Disburse ₹${contract?.principal?.toLocaleString()}?`)) return;
    setDisbursing(true);
    try {
      // Mock PhonePe payment
      const mockTxnId = `TXN${Date.now()}`;
      await payments.disburse({
        contractId: id,
        amount: contract.principal,
        transactionId: mockTxnId,
      });
      alert(`₹${contract.principal.toLocaleString()} disbursed successfully!`);
      loadContract();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to disburse payment");
    } finally {
      setDisbursing(false);
    }
  };

  const handleUploadProof = async e => {
    e.preventDefault();
    if (!paymentProof) {
      alert("Please select a payment proof file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("proof", paymentProof);
      formData.append("contractId", id);
      formData.append("transactionId", `TXN${Date.now()}`);

      await payments.uploadProof(formData);
      alert("Payment proof submitted! Waiting for lender acknowledgment.");
      setPaymentProof(null);
      loadContract();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload proof");
    } finally {
      setUploading(false);
    }
  };

  const handleAcknowledgePayment = async paymentId => {
    if (!confirm("Acknowledge this payment?")) return;
    try {
      await payments.acknowledgeProof(paymentId);
      alert("Payment acknowledged successfully!");
      loadContract();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to acknowledge payment");
    }
  };

  const getStatusBadge = status => {
    const colors = {
      PENDING_RECEIVER_SIGNATURE:
        "bg-purple-500/20 text-purple-400 border-purple-500",
      PENDING_LENDER_SIGNATURE:
        "bg-purple-500/20 text-purple-400 border-purple-500",
      PENDING_DISBURSEMENT:
        "bg-orange-500/20 text-orange-400 border-orange-500",
      ACTIVE: "bg-green-500/20 text-green-400 border-green-500",
      COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500",
      DEFAULTED: "bg-red-500/20 text-red-400 border-red-500",
    };
    return (
      <span
        className={`px-3 py-1 rounded-lg text-sm font-medium border ${
          colors[status] || colors.ACTIVE
        }`}
      >
        {status?.replace(/_/g, " ")}
      </span>
    );
  };

  const getTIColor = ti => {
    if (ti >= 800) return "text-emerald-400";
    if (ti >= 600) return "text-green-400";
    if (ti >= 500) return "text-yellow-400";
    if (ti >= 400) return "text-orange-400";
    return "text-red-400";
  };

  const downloadPDF = async () => {
    try {
      const res = await contracts.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `contract_${contract.contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to download PDF");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-gray-400">Contract not found</p>
      </div>
    );
  }

  const isReceiver =
    user?._id === contract.receiver?._id || user?.id === contract.receiver?._id;
  const isLender =
    user?._id === contract.lender?._id || user?.id === contract.lender?._id;

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-400 hover:text-blue-300"
      >
        ← Back
      </button>

      {/* Contract Header */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Contract #{contract.contractId || contract._id}
            </h1>
            <div className="text-sm text-gray-400">
              Created {new Date(contract.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-3">
            {getStatusBadge(contract.status)}
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Receiver</div>
            <div className="font-semibold text-white">
              {contract.receiver?.name}
            </div>
            <div
              className={`text-sm ${getTIColor(contract.receiver?.trustIndex)}`}
            >
              TI: {contract.receiver?.trustIndex}
            </div>
          </div>
          <div className="bg-white/5 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Lender</div>
            <div className="font-semibold text-white">
              {contract.lender?.name}
            </div>
            <div
              className={`text-sm ${getTIColor(contract.lender?.trustIndex)}`}
            >
              TI: {contract.lender?.trustIndex}
            </div>
          </div>
          <div className="bg-white/5 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Guarantor</div>
            <div className="font-semibold text-white">
              {contract.guarantor?.name}
            </div>
            <div
              className={`text-sm ${getTIColor(
                contract.guarantor?.trustIndex
              )}`}
            >
              TI: {contract.guarantor?.trustIndex}
            </div>
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Loan Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Principal</div>
            <div className="text-2xl font-bold text-white">
              ₹{contract.principal?.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Interest Rate</div>
            <div className="text-2xl font-bold text-green-400">
              {contract.interestRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Tenor</div>
            <div className="text-2xl font-bold text-white">
              {contract.tenorDays} days
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Repayable</div>
            <div className="text-2xl font-bold text-yellow-400">
              ₹
              {contract.totalRepayable?.toLocaleString() ||
                (
                  (contract.principal || 0) *
                  (1 + (contract.interestRate || 0) / 100)
                ).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Start Date</div>
            <div className="text-sm text-white">
              {contract.startDate
                ? new Date(contract.startDate).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">End Date</div>
            <div className="text-sm text-white">
              {contract.endDate
                ? new Date(contract.endDate).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* RECEIVER-SPECIFIC SECTIONS */}
      {isReceiver && (
        <>
          {contract.status === "PENDING_RECEIVER_SIGNATURE" && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-400 mb-3">
                Action Required: Sign Contract
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Please review the terms and sign the contract to proceed.
              </p>
              <button
                onClick={handleSign}
                disabled={signing}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              >
                {signing ? "Signing..." : "Sign Contract"}
              </button>
            </div>
          )}

          {contract.status === "ACTIVE" && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-white mb-4">
                Upload Payment Proof
              </h3>
              <form onSubmit={handleUploadProof} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Payment Proof (Screenshot/Receipt)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => setPaymentProof(e.target.files[0])}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-500 file:text-white
                      hover:file:bg-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading || !paymentProof}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Submit Proof"}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* LENDER-SPECIFIC SECTIONS */}
      {isLender && (
        <>
          {contract.status === "PENDING_LENDER_SIGNATURE" && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-400 mb-3">
                Action Required: Sign Contract
              </h3>
              <button
                onClick={handleSign}
                disabled={signing}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              >
                {signing ? "Signing..." : "Sign Contract"}
              </button>
            </div>
          )}

          {contract.status === "PENDING_DISBURSEMENT" && (
            <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-orange-400 mb-3">
                Disburse Loan Amount
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                Receiver UPI:{" "}
                <span className="font-mono">
                  {contract.receiver?.upiId || "N/A"}
                </span>
              </p>
              <p className="text-sm text-gray-300 mb-4">
                Amount: ₹{contract.principal?.toLocaleString()}
              </p>
              <button
                onClick={handleDisburse}
                disabled={disbursing}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              >
                {disbursing ? "Processing..." : "Disburse via PhonePe (Mock)"}
              </button>
            </div>
          )}

          {contract.status === "ACTIVE" &&
            paymentHistory.some(p => p.status === "PENDING") && (
              <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-400 mb-3">
                  Pending Payment Acknowledgments
                </h3>
                <div className="space-y-3">
                  {paymentHistory
                    .filter(p => p.status === "PENDING")
                    .map((payment, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 rounded p-4 flex justify-between items-center"
                      >
                        <div>
                          <div className="text-white font-medium">
                            ₹{payment.amount?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Submitted{" "}
                            {new Date(payment.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAcknowledgePayment(payment._id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white text-sm"
                        >
                          Acknowledge
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </>
      )}

      {/* EMI Schedule */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">EMI Schedule</h2>
        <EMIScheduleTable schedule={emiSchedule} />
      </div>

      {/* Payment History */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Payment History
        </h2>
        <PaymentHistoryTable payments={paymentHistory} />
      </div>
    </div>
  );
}
