import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTerraswitch } from "../../context/TerraswitchContext";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { TerraApiError } from "../../config/terraswitch.config";
// import { terraswitchService } from "../../services/terraswitch.service";

/**
 * PayInvoice Component with Terra Switching Integration
 *
 * This component now supports:
 * - Terra Switching payment link generation
 * - Real-time payment status tracking
 * - Automatic settlement to government account
 * - Traditional manual payment upload as fallback
 *
 * @version 2.0.0 - Terra Switching Integration
 */
const PayInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, userData } = useAuth();
  const {
    initializePayment,
    getPaymentStatus,
    isLoading: terraLoading,
    error: terraError,
    clearError,
  } = useTerraswitch();

  // Component state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"terraswitch" | "manual">(
    "terraswitch"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  // Bank account details for manual payment (fallback)
  const bankDetails = {
    accountName: "Ondo State Revenue Account",
    bankName: "ABC National Bank",
    accountNumber: "1234567890",
  };

  /**
   * Fetch invoice data on component mount
   */
  useEffect(() => {
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
          setError("You do not have permission to access this invoice");
          setLoading(false);
          return;
        }

        // Check if invoice is already paid
        if (data.paymentStatus === "success") {
          // Navigate back to invoice details if already paid
          navigate(`/bank/dashboard/invoices/${id}`);
          return;
        }

        setInvoiceData({
          id: invoiceSnap.id,
          ...data,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice details");
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id, currentUser, navigate]);

  /**
   * Clear errors when switching payment methods
   */
  useEffect(() => {
    setError(null);
    clearError();
  }, [paymentMethod, clearError]);

  /**
   * Handle file selection for manual payment
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  /**
   * Handle Terra Switching online payment
   * Creates a payment link and redirects user to Terra checkout
   */
  const handlePayOnline = async () => {
    if (!id || !currentUser || !invoiceData || !userData) {
      setError("Invoice information is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log("[PayInvoice] Initializing Terra Switching payment...", {
        invoiceId: id,
        amount: invoiceData.taxAmount,
        bankName: userData.businessName || "Unknown Bank",
        taxReportId: invoiceData.taxReportId,
      });

      // Initialize payment with Terra Switching
      const response = await initializePayment({
        invoiceId: id,
        amount: invoiceData.taxAmount,
        bankName: userData.businessName || "Unknown Bank",
        taxReportId: invoiceData.taxReportId,
        description: `Tax payment for invoice ${invoiceData.invoiceNumber}`,
      });

      console.log("[PayInvoice] Payment initialized successfully:", response);

      // Store the payment link
      setPaymentLink(response.data.link);

      // Store the slug in localStorage for payment verification
      localStorage.setItem("terra_payment_slug", response.data.slug);
      localStorage.setItem("terra_invoice_id", id); // Also store invoice ID for reference

      // Update invoice with Terra data
      const invoiceRef = doc(db, "invoices", id);
      await updateDoc(invoiceRef, {
        paymentLink: response.data.link,
        paymentStatus: "payment_link_generated",
        updatedAt: serverTimestamp(),
      });

      // Redirect to Terra Switching payment page
      window.location.href = response.data.link;
    } catch (err) {
      console.error("Error processing Terra Switching payment:", err);

      let errorMessage = "Payment processing failed. Please try again.";

      if (err instanceof TerraApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle manual payment receipt upload (fallback method)
   */
  const handleUploadReceipt = async () => {
    if (!selectedFile || !id || !currentUser || !invoiceData) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Upload file to Firebase Storage
      const fileRef = storageRef(
        storage,
        `payment-receipts/${currentUser.uid}/${
          invoiceData.invoiceNumber
        }_${Date.now()}_${selectedFile.name}`
      );

      const uploadTask = uploadBytesResumable(fileRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setError("Failed to upload receipt. Please try again.");
          setIsSubmitting(false);
        },
        async () => {
          try {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update invoice status in Firestore
            const invoiceRef = doc(db, "invoices", id);
            await updateDoc(invoiceRef, {
              status: "pending", // Still pending admin approval
              paymentMethod: "bank_transfer",
              paymentProofURL: downloadURL,
              paymentReference: `RECEIPT-${Date.now()}`,
              updatedAt: serverTimestamp(),
            });

            setSuccess(true);
            setIsSubmitting(false);

            // Navigate back to invoice details after 2 seconds
            setTimeout(() => {
              navigate(`/bank/dashboard/invoices/${id}`);
            }, 2000);
          } catch (err) {
            console.error("Error updating invoice:", err);
            setError("Failed to update invoice. Please try again.");
            setIsSubmitting(false);
          }
        }
      );
    } catch (err) {
      console.error("Error uploading receipt:", err);
      setError("Failed to upload receipt. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Get current payment status from Terra Switching context
  const paymentStatus = id ? getPaymentStatus(id) : undefined;

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4400B8]"></div>
          <p className="mt-2 text-sm text-gray-600">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  /**
   * If invoice is already paid, show success message
   */
  if (invoiceData?.paymentStatus === "success") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
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
                This invoice has already been paid.
              </p>
              <p className="mt-1 text-sm text-green-700">
                Payment was completed successfully. You can view the details in
                your invoice history.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/bank/dashboard/invoices")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Return to Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error && !invoiceData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render success state
   */
  if (success) {
    return (
      <div className="p-6">
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
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
                {paymentMethod === "terraswitch"
                  ? "Payment link generated successfully! Complete your payment in the new tab."
                  : "Payment proof uploaded successfully! Your payment is pending approval."}
              </p>
              <p className="mt-1 text-sm text-green-700">
                Redirecting to invoice details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Main payment interface
   */
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Pay Invoice: {invoiceData?.invoiceNumber}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Choose your preferred payment method. We recommend using our secure
          online payment system powered by Terra Switching.
        </p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">Amount Due:</span>
          <p className="text-2xl font-bold text-gray-900">
            ₦{invoiceData?.taxAmount.toLocaleString()}
          </p>
        </div>

        {/* Payment Status Indicator */}
        {paymentStatus && (
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500">
              Payment Status:
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  paymentStatus.status === "success"
                    ? "bg-green-100 text-green-800"
                    : paymentStatus.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : paymentStatus.status === "payment_link_generated"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {paymentStatus.status === "success"
                  ? "Payment Successful"
                  : paymentStatus.status === "failed"
                  ? "Payment Failed"
                  : paymentStatus.status === "payment_link_generated"
                  ? "Payment Link Generated"
                  : paymentStatus.status === "initializing"
                  ? "Initializing Payment"
                  : "Payment Pending"}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-5 h-5 text-amber-500 mr-2"
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
          <span>
            Please include your invoice number ({invoiceData?.invoiceNumber}) as
            payment reference
          </span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Choose Payment Method
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Terra Switching Payment */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === "terraswitch"
                ? "border-[#4400B8] bg-[#4400B8]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setPaymentMethod("terraswitch")}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="paymentMethod"
                value="terraswitch"
                checked={paymentMethod === "terraswitch"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "terraswitch")
                }
                className="mr-2"
              />
              <h3 className="font-medium text-gray-900">
                Secure Online Payment
              </h3>
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Recommended
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Pay instantly using bank transfer, cards, or USSD. Powered by
              Terra Switching with automatic settlement.
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <svg
                className="w-4 h-4 mr-1"
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
              Instant confirmation • Secure • Multiple payment options
            </div>
          </div>

          {/* Manual Payment */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === "manual"
                ? "border-[#4400B8] bg-[#4400B8]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setPaymentMethod("manual")}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                name="paymentMethod"
                value="manual"
                checked={paymentMethod === "manual"}
                onChange={(e) => setPaymentMethod(e.target.value as "manual")}
                className="mr-2"
              />
              <h3 className="font-medium text-gray-900">
                Manual Bank Transfer
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Transfer to government account and upload payment receipt for
              verification.
            </p>
            <div className="mt-2 flex items-center text-xs text-amber-600">
              <svg
                className="w-4 h-4 mr-1"
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
              Requires manual verification • Processing may take longer
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || terraError) && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error || terraError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Fallback - Show when popup is blocked */}
      {paymentLink && error && error.includes("Popup blocked") && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                Payment Link Available
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Click the button below to open the Terra Switching payment page
                manually.
              </p>
            </div>
            <div className="flex space-x-3">
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open Payment Page
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentLink);
                  alert("Payment link copied to clipboard!");
                }}
                className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Actions */}
      {paymentMethod === "terraswitch" ? (
        // Terra Switching Payment Section
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Secure Online Payment
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Click the button below to proceed to our secure payment portal.
            You'll be redirected to Terra Switching's secure checkout where you
            can pay using your preferred method.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handlePayOnline}
              disabled={isSubmitting || terraLoading}
              className={`px-8 py-3 bg-[#4400B8] text-white rounded-lg text-lg font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50 flex items-center transition-colors ${
                isSubmitting || terraLoading
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {(isSubmitting || terraLoading) && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              )}
              {isSubmitting || terraLoading
                ? "Generating Payment Link..."
                : "Pay Now with Terra Switching"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Secured by Terra Switching • Multiple payment options available
            </p>
          </div>
        </div>
      ) : (
        // Manual Payment Section
        <div className="space-y-6">
          {/* Bank Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bank Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {bankDetails.accountName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Bank Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {bankDetails.bankName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Number
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {bankDetails.accountNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Reference Code
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {invoiceData?.invoiceNumber}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Payment Receipt
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              After making the transfer, please upload your payment receipt for
              verification.
            </p>

            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4400B8]/10 file:text-[#4400B8] hover:file:bg-[#4400B8]/20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Accepted formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4400B8] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <button
                onClick={handleUploadReceipt}
                disabled={!selectedFile || isSubmitting}
                className={`w-full px-4 py-3 bg-[#4400B8] text-white rounded-lg font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50 flex items-center justify-center transition-colors ${
                  !selectedFile || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting && selectedFile && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                )}
                {isSubmitting && selectedFile
                  ? "Uploading Receipt..."
                  : "Upload Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayInvoice;
