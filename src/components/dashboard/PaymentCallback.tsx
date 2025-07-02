import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuccessfulPayment = async () => {
      try {
        // Get stored invoice ID
        const invoiceId = localStorage.getItem("terra_invoice_id");

        if (!invoiceId) {
          throw new Error("Invoice ID not found");
        }

        // Update invoice payment status
        const invoiceRef = doc(db, "invoices", invoiceId);
        await updateDoc(invoiceRef, {
          paymentStatus: "success",
          paidDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Clean up localStorage
        localStorage.removeItem("terra_payment_slug");
        localStorage.removeItem("terra_invoice_id");

        // Navigate back to invoice details
        navigate(`/bank/dashboard/invoices/${invoiceId}`);
      } catch (err) {
        console.error("[PaymentCallback] Error updating payment status:", err);
        navigate("/bank/dashboard/invoices"); // Fallback navigation
      }
    };

    handleSuccessfulPayment();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center text-green-600 mb-4">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-2 text-center text-xl font-semibold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your payment has been processed successfully. Redirecting you
            back...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
