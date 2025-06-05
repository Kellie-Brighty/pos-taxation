import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../../config/firebase";

const PayInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bank account details for manual payment
  const bankDetails = {
    accountName: "Ondo State Revenue Account",
    bankName: "ABC National Bank",
    accountNumber: "1234567890",
  };

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
        if (data.status === "paid") {
          setError("This invoice has already been paid");
          setLoading(false);
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
  }, [id, currentUser]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePayOnline = async () => {
    if (!id || !currentUser || !invoiceData) {
      setError("Invoice information is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // In a real application, this would integrate with a payment gateway
      // For now, we'll simulate a successful payment

      // Update invoice status in Firestore - Note: Still pending admin approval
      const invoiceRef = doc(db, "invoices", id);
      await updateDoc(invoiceRef, {
        status: "pending", // Changed from "paid" to "pending" as it still needs admin approval
        paymentMethod: "online",
        paymentReference: `PAY-${Date.now()}`,
        paidDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // The tax report status remains pending until admin approval
      if (invoiceData.taxReportId) {
        const taxReportRef = doc(db, "taxReports", invoiceData.taxReportId);
        await updateDoc(taxReportRef, {
          status: "pending", // Changed from "approved" to "pending"
          updatedAt: serverTimestamp(),
        });
      }

      setSuccess(true);
      setIsSubmitting(false);

      // Navigate back to invoice details after 2 seconds
      setTimeout(() => {
        navigate(`/bank/dashboard/invoices/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment processing failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !id || !currentUser || !invoiceData) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Upload file to Firebase Storage
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
                onClick={() => navigate(`/bank/dashboard/invoices/${id}`)}
                className="mt-2 text-sm text-red-800 underline"
              >
                Return to Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {selectedFile
                  ? "Payment proof uploaded successfully! Your payment is pending approval."
                  : "Payment processed successfully! Your payment is pending approval by an administrator."}
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Pay Invoice: {invoiceData?.invoiceNumber}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Pay your invoice online or transfer the tax amount to the provided
          government account.
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

      {/* Bank Details */}
      <div className="grid grid-cols-1 gap-y-6 max-w-2xl mb-8">
        <h2 className="text-lg font-medium text-gray-900">
          Bank Transfer Details
        </h2>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Account Name
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {bankDetails.accountName}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Bank Name</label>
          <p className="mt-1 text-sm text-gray-900">{bankDetails.bankName}</p>
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

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handlePayOnline}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50 flex items-center ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting && !selectedFile && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            Pay Online
          </button>
          <label
            htmlFor="receipt-upload"
            className={`px-6 py-2 border border-[#4400B8] text-[#4400B8] rounded-lg text-sm font-medium hover:bg-[#4400B8]/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50 ${
              isSubmitting ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            Upload Offline Receipt
            <input
              id="receipt-upload"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isSubmitting}
              ref={fileInputRef}
            />
          </label>
        </div>

        {selectedFile && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={isSubmitting}
              >
                Remove
              </button>
            </div>

            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Uploading receipt...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#4400B8] h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={handleUploadReceipt}
              disabled={isSubmitting}
              className={`px-4 py-1.5 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50 flex items-center ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && selectedFile && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Submit Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayInvoice;
