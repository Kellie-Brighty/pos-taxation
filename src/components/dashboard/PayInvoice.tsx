import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PayInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const bankDetails = {
    accountName: "Ondo State Revenue Account",
    bankName: "ABC National Bank",
    accountNumber: "1234567890",
    referenceCode: "INV-202501",
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handlePayOnline = () => {
    // Handle online payment logic
    console.log("Processing online payment...");
  };

  const handleUploadReceipt = () => {
    // Handle receipt upload logic
    console.log("Uploading receipt...", selectedFile);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Pay by Bank Transfer
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Transfer the tax amount to the provided government account.
        </p>
      </div>

      {/* Bank Details */}
      <div className="grid grid-cols-1 gap-y-6 max-w-2xl">
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
            {bankDetails.referenceCode}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handlePayOnline}
          className="px-6 py-2 bg-[#4400B8] text-white rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50"
        >
          Pay Online
        </button>
        <label
          htmlFor="receipt-upload"
          className="px-6 py-2 border border-[#4400B8] text-[#4400B8] rounded-lg text-sm font-medium hover:bg-[#4400B8]/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4400B8]/50"
        >
          Upload Offline Receipt
          <input
            id="receipt-upload"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
};

export default PayInvoice;
