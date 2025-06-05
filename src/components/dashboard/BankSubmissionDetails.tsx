import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";

interface TaxReport {
  id: string;
  bankId: string;
  bankName: string;
  transactionVolume: number;
  profitBaseline: number;
  documentURL: string;
  fileName: string;
  status: string;
  submittedAt: any;
  resubmittedAt?: any;
  revisionCount?: number;
  notes?: string;
  month?: number;
  year?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  bankId: string;
  bankName: string;
  taxReportId: string;
  transactionVolume: number;
  profitBaseline: number;
  taxRate: number;
  taxAmount: number;
  status: string;
  issuedDate: any;
  dueDate: any;
  paidDate?: any;
  paymentMethod?: string;
  paymentReference?: string;
  paymentProofURL?: string;
  previousPaymentAmount?: number;
  additionalTaxAmount?: number;
}

const BankSubmissionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posAgentCount, setPosAgentCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSubmissionDetails = async () => {
    if (!id || !currentUser) return;

    try {
      setLoading(true);
      // Fetch the tax report
      const taxReportRef = doc(db, "taxReports", id);
      const taxReportSnap = await getDoc(taxReportRef);

      if (!taxReportSnap.exists()) {
        setError("Submission not found");
        setLoading(false);
        return;
      }

      const taxReportData = taxReportSnap.data();
      setTaxReport({
        id: taxReportSnap.id,
        bankId: taxReportData.bankId,
        bankName: taxReportData.bankName,
        transactionVolume: taxReportData.transactionVolume,
        profitBaseline: taxReportData.profitBaseline,
        documentURL: taxReportData.documentURL,
        fileName: taxReportData.fileName,
        status: taxReportData.status,
        submittedAt: taxReportData.submittedAt,
        resubmittedAt: taxReportData.resubmittedAt,
        revisionCount: taxReportData.revisionCount || 0,
        notes: taxReportData.notes,
        month: taxReportData.month,
        year: taxReportData.year,
      });

      // Find the associated invoice
      const invoicesQuery = query(
        collection(db, "invoices"),
        where("taxReportId", "==", id)
      );
      const invoiceSnapshot = await getDocs(invoicesQuery);

      if (!invoiceSnapshot.empty) {
        const invoiceDoc = invoiceSnapshot.docs[0];
        const invoiceData = invoiceDoc.data();
        setInvoice({
          id: invoiceDoc.id,
          invoiceNumber: invoiceData.invoiceNumber,
          bankId: invoiceData.bankId,
          bankName: invoiceData.bankName,
          taxReportId: invoiceData.taxReportId,
          transactionVolume: invoiceData.transactionVolume,
          profitBaseline: invoiceData.profitBaseline,
          taxRate: invoiceData.taxRate,
          taxAmount: invoiceData.taxAmount,
          status: invoiceData.status,
          issuedDate: invoiceData.issuedDate,
          dueDate: invoiceData.dueDate,
          paidDate: invoiceData.paidDate,
          paymentMethod: invoiceData.paymentMethod,
          paymentReference: invoiceData.paymentReference,
          paymentProofURL: invoiceData.paymentProofURL,
          previousPaymentAmount: invoiceData.previousPaymentAmount,
          additionalTaxAmount: invoiceData.additionalTaxAmount,
        });
      }

      // Count POS agents for this bank
      const posAgentsQuery = query(
        collection(db, "posAgents"),
        where("bankId", "==", taxReportData.bankId)
      );
      const posAgentsSnapshot = await getDocs(posAgentsQuery);
      setPosAgentCount(posAgentsSnapshot.size);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching submission details:", err);
      setError("Failed to load submission details");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
  }, [id, currentUser]);

  // Function to handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await fetchSubmissionDetails();
    } catch (err) {
      console.error("Error refreshing submission details:", err);
      setError("Failed to refresh submission details");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApproveConfirm = async () => {
    if (!id || !taxReport || !invoice) return;

    try {
      // Update tax report status
      const taxReportRef = doc(db, "taxReports", id);
      await updateDoc(taxReportRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });

      // Update invoice status
      const invoiceRef = doc(db, "invoices", invoice.id);
      await updateDoc(invoiceRef, {
        status: "approved",
        paymentStatus: "paid",
        updatedAt: serverTimestamp(),
      });

      // Find and update the corresponding tax payment record
      const taxPaymentsQuery = query(
        collection(db, "taxPayments"),
        where("bankId", "==", taxReport.bankId),
        where("referenceNumber", "==", invoice.invoiceNumber)
      );

      const taxPaymentSnapshot = await getDocs(taxPaymentsQuery);

      if (!taxPaymentSnapshot.empty) {
        const taxPaymentDoc = taxPaymentSnapshot.docs[0];
        const taxPaymentRef = doc(db, "taxPayments", taxPaymentDoc.id);

        // Update tax payment status to approved
        await updateDoc(taxPaymentRef, {
          status: "approved",
          updatedAt: serverTimestamp(),
        });

        // Generate a reference number for the settlement
        const generateReferenceNumber = () => {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const random = Math.floor(10000 + Math.random() * 90000);
          return `STLMNT-${year}${month}-${random}`;
        };

        // Create a new settlement record in adminSettlements collection
        await addDoc(collection(db, "adminSettlements"), {
          amount: invoice.taxAmount,
          bankId: taxReport.bankId,
          bankName: taxReport.bankName,
          taxReportId: id,
          invoiceId: invoice.id,
          taxPaymentId: taxPaymentDoc.id,
          referenceNumber: generateReferenceNumber(),
          description: `Tax settlement from ${taxReport.bankName} for ${
            taxReport.month !== undefined
              ? formatMonthLabel(
                  taxReport.month,
                  taxReport.year || new Date().getFullYear()
                )
              : "tax period"
          }`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setShowApproveModal(false);
      // Navigate back to the submissions list
      navigate("/admin/dashboard/bank-submissions");
    } catch (err) {
      console.error("Error approving submission:", err);
      setError("Failed to approve submission");
    }
  };

  // Helper function to format month and year as a label
  const formatMonthLabel = (month: number, year: number): string => {
    const date = new Date(year, month, 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleRejectConfirm = async () => {
    if (!id || !taxReport || !invoice || !rejectionReason.trim()) return;

    try {
      // Update tax report status
      const taxReportRef = doc(db, "taxReports", id);
      await updateDoc(taxReportRef, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        updatedAt: serverTimestamp(),
      });

      // Update invoice status
      const invoiceRef = doc(db, "invoices", invoice.id);
      await updateDoc(invoiceRef, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        updatedAt: serverTimestamp(),
      });

      setShowRejectModal(false);
      // Navigate back to the submissions list
      navigate("/admin/dashboard/bank-submissions");
    } catch (err) {
      console.error("Error rejecting submission:", err);
      setError("Failed to reject submission");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "paid":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Helper to determine payment status display
  // const getPaymentStatusDisplay = (
  //   taxReport: TaxReport,
  //   invoice: Invoice | null
  // ) => {
  //   if (!invoice) {
  //     return "Pending Payment";
  //   }

  //   if (invoice.paymentMethod) {
  //     return "Payment Received - Pending Approval";
  //   }

  //   return "Pending Payment";
  // };

  // Helper to determine if this is a revised report
  const isRevisedReport = () => {
    return taxReport?.revisionCount && taxReport.revisionCount > 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4400B8]"></div>
      </div>
    );
  }

  if (error) {
    return (
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
              onClick={() => navigate("/admin/dashboard/bank-submissions")}
              className="mt-2 text-sm text-red-800 underline"
            >
              Return to Bank Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!taxReport) {
    return (
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
              No submission data found
            </p>
            <button
              onClick={() => navigate("/admin/dashboard/bank-submissions")}
              className="mt-2 text-sm text-yellow-800 underline"
            >
              Return to Bank Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-wrap justify-between items-center mb-2">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Tax Invoice – Payment for POS Tax Remittance
            </h1>
            {isRevisedReport() && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </>
              )}
            </button>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                taxReport.status
              )}`}
            >
              {taxReport.status === "pending" && invoice?.paymentMethod
                ? "Payment Received - Pending Approval"
                : taxReport.status.charAt(0).toUpperCase() +
                  taxReport.status.slice(1)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          This page lets you review the payment details submitted by the bank.
          Approve to confirm the payment and issue a receipt, or reject if
          corrections are needed.
        </p>
      </div>

      {/* Revision Information */}
      {isRevisedReport() && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
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
                Revised Report Information
              </p>
              <p className="text-sm text-blue-700 mt-1">
                This is a revised tax report (revision {taxReport.revisionCount}
                ).
                {taxReport.resubmittedAt && (
                  <span>
                    {" "}
                    Last updated on {formatDate(taxReport.resubmittedAt)}.
                  </span>
                )}
              </p>
              {invoice?.previousPaymentAmount &&
                invoice?.previousPaymentAmount > 0 && (
                  <p className="text-sm text-blue-700 mt-1">
                    The bank previously paid{" "}
                    {formatCurrency(invoice.previousPaymentAmount)}.
                    {invoice.additionalTaxAmount &&
                      invoice.additionalTaxAmount > 0 && (
                        <span>
                          {" "}
                          Additional amount due:{" "}
                          {formatCurrency(invoice.additionalTaxAmount)}.
                        </span>
                      )}
                  </p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Invoice Summary Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Invoice Summary
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice Number</span>
                <span className="text-sm text-gray-900">
                  {invoice?.invoiceNumber || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Issue Date</span>
                <span className="text-sm text-gray-900">
                  {invoice ? formatDate(invoice.issuedDate) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="text-sm text-gray-900">
                  {invoice ? formatDate(invoice.dueDate) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bank Name</span>
                <span className="text-sm text-gray-900">
                  {taxReport.bankName}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total POS Agents</span>
                <span className="text-sm text-gray-900">
                  {posAgentCount.toLocaleString()} Agents
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total POS Income</span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(taxReport.transactionVolume)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax Rate</span>
                <span className="text-sm text-gray-900">
                  {invoice?.taxRate || 5}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Tax Amount</span>
                <span className="text-sm text-gray-900">
                  {invoice
                    ? formatCurrency(invoice.taxAmount)
                    : formatCurrency(
                        (taxReport.transactionVolume *
                          taxReport.profitBaseline *
                          0.05) /
                          100
                      )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    taxReport.status
                  )}`}
                >
                  {taxReport.status === "pending" && invoice?.paymentMethod
                    ? "Payment Received - Pending Approval"
                    : taxReport.status.charAt(0).toUpperCase() +
                      taxReport.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Display previous payment and additional payment details if this is a revised report */}
          {isRevisedReport() &&
            invoice?.previousPaymentAmount &&
            invoice?.previousPaymentAmount > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Payment Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Previous Payment Amount
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatCurrency(invoice.previousPaymentAmount)}
                    </span>
                  </div>
                  {invoice.additionalTaxAmount &&
                    invoice.additionalTaxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Additional Amount Due
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatCurrency(invoice.additionalTaxAmount)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}

          {/* Tax Report Document */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              Supporting Documents
            </h3>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-gray-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {taxReport.fileName || "Tax Report Document"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isRevisedReport() && taxReport.resubmittedAt
                      ? `Revised on ${formatDate(taxReport.resubmittedAt)}`
                      : `Submitted on ${formatDate(taxReport.submittedAt)}`}
                  </p>
                </div>
              </div>
              <a
                href={taxReport.documentURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1"
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
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {invoice && invoice.paymentMethod && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Details
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm text-gray-900">
                    {invoice.paymentMethod === "online"
                      ? "Online Payment"
                      : "Bank Transfer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <span className="text-sm text-gray-900">
                    {isRevisedReport() && invoice.additionalTaxAmount
                      ? formatCurrency(invoice.additionalTaxAmount)
                      : formatCurrency(invoice.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date Paid</span>
                  <span className="text-sm text-gray-900">
                    {invoice.paidDate
                      ? formatDate(invoice.paidDate)
                      : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Reference Number
                  </span>
                  <span className="text-sm text-gray-900">
                    {invoice.paymentReference || "N/A"}
                  </span>
                </div>
                {invoice.paymentProofURL && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Proof</span>
                    <a
                      href={invoice.paymentProofURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1"
                    >
                      View Receipt
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
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {taxReport.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Additional Notes
            </h2>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-700">{taxReport.notes}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {taxReport.status === "pending" && invoice?.paymentMethod && (
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
      )}

      {/* Message for when payment is not yet received */}
      {taxReport.status === "pending" && !invoice?.paymentMethod && (
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
                Awaiting payment from the bank. You'll be able to approve or
                reject once payment is received.
              </p>
            </div>
          </div>
        </div>
      )}

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
              {isRevisedReport() && (
                <span className="block mt-2 font-medium">
                  This is a revised report with updated tax calculations.
                </span>
              )}
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
              {isRevisedReport() && (
                <span className="block mt-2 font-medium">
                  Note: This is already a revised report.
                </span>
              )}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600/20 focus:border-red-600 resize-none"
            />
            <button
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
              className={`w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors ${
                !rejectionReason.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
