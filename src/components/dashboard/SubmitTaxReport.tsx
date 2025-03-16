import React, { useState, useRef } from "react";

const SubmitTaxReport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transactionVolume, setTransactionVolume] = useState("₦ 25,000,000");
  const [profitBaseline, setProfitBaseline] = useState("20%");
  const [notes, setNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      file,
      transactionVolume,
      profitBaseline,
      notes,
      isConfirmed,
    });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Declare POS Income
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the details below to generate your tax invoice. Ensure all
          information is accurate, as it will be used to calculate your tax
          obligation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* File Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Supporting Document (Required)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#4400B8] transition-colors"
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-[#4400B8]">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, XLS, XLSX
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
            />
          </div>
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {/* Transaction Volume Input */}
        <div className="space-y-2">
          <label
            htmlFor="transactionVolume"
            className="block text-sm font-medium text-gray-700"
          >
            Total POS Transaction Volume (₦) (Required)
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="transactionVolume"
              value={transactionVolume}
              onChange={(e) => setTransactionVolume(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#4400B8] focus:ring-[#4400B8] sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Profit Baseline Input */}
        <div className="space-y-2">
          <label
            htmlFor="profitBaseline"
            className="block text-sm font-medium text-gray-700"
          >
            Average Profit Baseline (%) (Required)
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="profitBaseline"
              value={profitBaseline}
              onChange={(e) => setProfitBaseline(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#4400B8] focus:ring-[#4400B8] sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Additional Notes (Optional)
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#4400B8] focus:ring-[#4400B8] sm:text-sm"
              placeholder="We do not have any additional notes, thank you"
            />
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-center">
          <input
            id="confirm"
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#4400B8] focus:ring-[#4400B8]"
          />
          <label htmlFor="confirm" className="ml-2 text-sm text-gray-600">
            I confirm that the details provided are accurate and up to date.
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={!isConfirmed}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
              isConfirmed
                ? "bg-[#4400B8] hover:bg-[#4400B8]/90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Send for Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitTaxReport;
