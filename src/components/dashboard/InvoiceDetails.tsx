import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const InvoiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const invoiceData = {
    invoiceNumber: "INV-202501",
    issuedDate: "February 5, 2025",
    dueDate: "February 15, 2025",
    bankName: "XYZ Bank",
    totalPOSAgents: "5,000 Agents",
    totalPOSIncome: "₦500,000,000",
    taxRate: "5%",
    totalTaxAmount: "₦25,000,000",
    status: "Pending Payment",
  };

  const handlePayNow = () => {
    navigate(`/bank/dashboard/invoices/${id}/pay`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Tax Invoice - Payment for POS Tax Remittance
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          View your tax invoice details below. Pay online or upload proof if you
          paid offline.
        </p>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-6">
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
            Total POS Agents
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {invoiceData.totalPOSAgents}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Issued Date
          </label>
          <p className="mt-1 text-sm text-gray-900">{invoiceData.issuedDate}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Total POS Income
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {invoiceData.totalPOSIncome}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Due Date</label>
          <p className="mt-1 text-sm text-gray-900">{invoiceData.dueDate}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tax Rate</label>
          <p className="mt-1 text-sm text-gray-900">{invoiceData.taxRate}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Bank Name</label>
          <p className="mt-1 text-sm text-gray-900">{invoiceData.bankName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Total Tax Amount
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {invoiceData.totalTaxAmount}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <p className="mt-1 text-sm font-medium text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block">
            {invoiceData.status}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8">
        <button
          onClick={handlePayNow}
          className="px-4 py-2 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetails;
