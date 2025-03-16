import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BankSubmissionDetails: React.FC = () => {
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApproveConfirm = () => {
    // Handle approval logic here
    console.log("Approved");
    setShowApproveModal(false);
    navigate("/admin/dashboard/bank-submissions");
  };

  const handleRejectConfirm = () => {
    // Handle rejection logic here with reason
    console.log("Rejected with reason:", rejectionReason);
    setShowRejectModal(false);
    navigate("/admin/dashboard/bank-submissions");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Tax Invoice – Payment for POS Tax Remittance
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This page lets you review the payment details submitted by the bank.
          Approve to confirm the payment and issue a receipt, or reject if
          corrections are needed.
        </p>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Invoice Summary Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Invoice Summary Section
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice Number</span>
                <span className="text-sm text-gray-900">INV-202501</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Issue Date</span>
                <span className="text-sm text-gray-900">February 5, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="text-sm text-gray-900">February 15, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bank Name</span>
                <span className="text-sm text-gray-900">XYZ Bank</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total POS Agents</span>
                <span className="text-sm text-gray-900">5,000 Agents</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total POS Income</span>
                <span className="text-sm text-gray-900">₦500,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax Rate</span>
                <span className="text-sm text-gray-900">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Tax Amount</span>
                <span className="text-sm text-gray-900">₦25,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Payment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Invoice Summary Section
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm text-gray-900">Bank Transfer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount Paid</span>
                <span className="text-sm text-gray-900">₦25,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date Paid</span>
                <span className="text-sm text-gray-900">February 15, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference Number</span>
                <span className="text-sm text-gray-900">XYZ Bank</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receipt</span>
                <button className="text-sm text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1">
                  Download PDF
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowApproveModal(true)}
          className="px-6 py-2 bg-[#4400B8] text-white rounded-lg hover:bg-[#4400B8]/90 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          className="px-6 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Reject
        </button>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-[#4400B8]">
                Confirm Payment Approval?
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to approve this payment? A receipt will be
              sent to the bank's registered email once approved.
            </p>
            <button
              onClick={handleApproveConfirm}
              className="w-full bg-[#4400B8] text-white py-3 px-6 rounded-lg hover:bg-[#4400B8]/90 transition-colors"
            >
              Approve Payment
            </button>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-red-600">
                Confirm Payment Rejection?
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to reject this payment? Please provide a
              reason below. The bank will be notified and asked to correct their
              submission.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 resize-none"
            />
            <button
              onClick={handleRejectConfirm}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSubmissionDetails;
