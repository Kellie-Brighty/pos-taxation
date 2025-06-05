import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issuedDate: Timestamp;
  dueDate: Timestamp;
  bankName: string;
  bankId: string;
  taxReportId: string;
  transactionVolume: number;
  profitBaseline: number;
  taxRate: number;
  taxAmount: number;
  status: string;
  rejectionReason?: string;
  previousPaymentAmount?: number;
  additionalTaxAmount?: number;
  resubmittedAt?: Timestamp;
  revisionCount?: number;
  paymentMethod?: string;
}

const InvoiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taxReportURL, setTaxReportURL] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInvoiceData = async () => {
    if (!id || !currentUser) return;

    try {
      setLoading(true);
      const invoiceRef = doc(db, "invoices", id);
      const invoiceSnap = await getDoc(invoiceRef);

      if (!invoiceSnap.exists()) {
        setError("Invoice not found");
        setLoading(false);
        return;
      }

      const data = invoiceSnap.data();

      // Check if this invoice belongs to the current user
      if (data.bankId !== currentUser.uid) {
        setError("You do not have permission to view this invoice");
        setLoading(false);
        return;
      }

      // Fetch the associated tax report to get the document URL
      if (data.taxReportId) {
        const taxReportRef = doc(db, "taxReports", data.taxReportId);
        const taxReportSnap = await getDoc(taxReportRef);

        if (taxReportSnap.exists()) {
          const taxReportData = taxReportSnap.data();
          setTaxReportURL(taxReportData.documentURL || null);
        }
      }

      setInvoiceData({
        id: invoiceSnap.id,
        invoiceNumber: data.invoiceNumber || "Unknown",
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        bankName: data.bankName || "Unknown",
        bankId: data.bankId,
        taxReportId: data.taxReportId,
        transactionVolume: data.transactionVolume || 0,
        profitBaseline: data.profitBaseline || 0,
        taxRate: data.taxRate || 5,
        taxAmount: data.taxAmount || 0,
        status: data.status || "pending",
        rejectionReason: data.rejectionReason,
        previousPaymentAmount: data.previousPaymentAmount,
        additionalTaxAmount: data.additionalTaxAmount,
        resubmittedAt: data.resubmittedAt,
        revisionCount: data.revisionCount || 0,
        paymentMethod: data.paymentMethod,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      setError("Failed to load invoice details");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [id, currentUser]);

  // Function to handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await fetchInvoiceData();
    } catch (err) {
      console.error("Error refreshing invoice details:", err);
      setError("Failed to refresh invoice details");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayNow = () => {
    navigate(`/bank/dashboard/invoices/${id}/pay`);
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "Not specified";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      case "rejected":
        return "text-gray-600 bg-gray-100";
      case "pending":
      default:
        return "text-amber-600 bg-amber-100";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4400B8]"></div>
          <p className="mt-2 text-sm text-gray-600">
            Loading invoice details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={() => navigate("/bank/dashboard/invoices")}
                className="mt-2 text-sm text-red-800 underline"
              >
                Return to Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Invoice not found
              </p>
              <button
                onClick={() => navigate("/bank/dashboard/invoices")}
                className="mt-2 text-sm text-yellow-800 underline"
              >
                Return to Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Tax Invoice - Payment for POS Tax Remittance
            </h1>
            {invoiceData.revisionCount && invoiceData.revisionCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                Revised Report
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                isRefreshing || loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#4400B8]/10 text-[#4400B8] hover:bg-[#4400B8]/20"
              }`}
            >
              {isRefreshing || loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Status
                </>
              )}
            </button>
            {invoiceData && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                  invoiceData.status
                )}`}
              >
                {invoiceData.status.charAt(0).toUpperCase() +
                  invoiceData.status.slice(1)}
              </span>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          View your tax invoice details below. Pay online or upload proof if you
          paid offline.
        </p>
      </div>

      {/* Add this section to show rejection reason if present */}
      {invoiceData.status === "rejected" && invoiceData.rejectionReason && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Rejection Reason:
              </p>
              <p className="text-sm text-red-700 mt-1">
                {invoiceData.rejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revision Information */}
      {invoiceData.revisionCount && invoiceData.revisionCount > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Revised Report
              </p>
              <p className="text-sm text-blue-700 mt-1">
                This invoice has been revised {invoiceData.revisionCount} time
                {invoiceData.revisionCount > 1 ? "s" : ""}.
                {invoiceData.resubmittedAt && (
                  <span>
                    {" "}
                    Last updated on {formatDate(invoiceData.resubmittedAt)}.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
        <div>
          <label className="text-sm font-medium text-gray-500">
            Invoice Number
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {invoiceData.invoiceNumber}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Total Transaction Volume
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatCurrency(invoiceData.transactionVolume)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Issued Date
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(invoiceData.issuedDate)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Profit Baseline
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {invoiceData.profitBaseline}%
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Due Date</label>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(invoiceData.dueDate)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tax Rate</label>
          <p className="mt-1 text-sm text-gray-900">{invoiceData.taxRate}%</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Bank Name</label>
          <p className="mt-1 text-sm text-gray-900">{invoiceData.bankName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Total Tax Amount
          </label>
          <p className="mt-1 text-sm text-gray-900 font-medium">
            {formatCurrency(invoiceData.taxAmount)}
          </p>
        </div>

        {/* Add previous payment information if available */}
        {invoiceData.previousPaymentAmount &&
          invoiceData.previousPaymentAmount > 0 && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Amount Already Paid
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(invoiceData.previousPaymentAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Additional Amount Due
                </label>
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {formatCurrency(invoiceData.additionalTaxAmount || 0)}
                </p>
              </div>
            </>
          )}

        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <p
            className={`mt-1 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block ${getStatusClass(
              invoiceData.status
            )}`}
          >
            {invoiceData.status.charAt(0).toUpperCase() +
              invoiceData.status.slice(1)}
          </p>
        </div>
        {taxReportURL && (
          <div>
            <label className="text-sm font-medium text-gray-500">
              Supporting Document
            </label>
            <p className="mt-1">
              <a
                href={taxReportURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1 w-fit"
              >
                View Document
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-8">
        {invoiceData.status.toLowerCase() === "pending" && (
          <>
            {/* Check if payment has been made */}
            {invoiceData.paymentMethod ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Payment received - Waiting for administrator approval
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Show pay button only if no payment made yet or additional payment is needed */
              <button
                onClick={handlePayNow}
                className="px-4 py-2 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50"
              >
                {invoiceData.previousPaymentAmount &&
                invoiceData.previousPaymentAmount > 0
                  ? "Pay Additional Amount"
                  : "Pay Now"}
              </button>
            )}
          </>
        )}
        {invoiceData.status.toLowerCase() === "rejected" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  This invoice has been rejected. Please revise your tax report
                  with accurate information.
                </p>
                <button
                  onClick={() =>
                    navigate(
                      `/bank/dashboard/tax-report?reportId=${invoiceData.taxReportId}`
                    )
                  }
                  className="mt-2 text-sm text-red-800 underline"
                >
                  Revise Tax Report
                </button>
              </div>
            </div>
          </div>
        )}
        {invoiceData.status.toLowerCase() === "paid" && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  This invoice has been paid. Thank you for your payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
