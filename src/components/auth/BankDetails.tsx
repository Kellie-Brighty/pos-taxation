import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { authService } from "../../services/auth.service";

interface BankDetailsInfo {
  bankName: string;
  registrationNumber: string;
  headOfficeAddress: string;
  numAgents: string;
  supportingDocument?: File;
}

interface BankBasicInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
}

const BankDetails: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<BankDetailsInfo>({
    bankName: "",
    registrationNumber: "",
    headOfficeAddress: "",
    numAgents: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // File handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  useEffect(() => {
    const basicInfo = localStorage.getItem("bankBasicInfo");
    if (!basicInfo) {
      showToast("Please complete your basic information first", "error");
      navigate("/register");
    }
  }, [navigate, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setFileError("Please upload a PDF, Excel, or CSV file");
      return false;
    }

    if (file.size > maxSize) {
      setFileError("File size should be less than 5MB");
      return false;
    }

    setFileError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        setFormData((prev) => ({ ...prev, supportingDocument: file }));
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        setFormData((prev) => ({ ...prev, supportingDocument: file }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const basicInfo = JSON.parse(
        localStorage.getItem("bankBasicInfo") || "{}"
      ) as BankBasicInfo;

      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();

      // Append basic info fields
      formDataToSubmit.append("fullName", basicInfo.fullName);
      formDataToSubmit.append("email", basicInfo.email);
      formDataToSubmit.append("phoneNumber", basicInfo.phoneNumber);

      // Append bank details fields
      formDataToSubmit.append("bankName", formData.bankName);
      formDataToSubmit.append(
        "registrationNumber",
        formData.registrationNumber
      );
      formDataToSubmit.append("headOfficeAddress", formData.headOfficeAddress);
      formDataToSubmit.append("numAgents", formData.numAgents);
      formDataToSubmit.append("userType", "bank");

      // Append file if selected
      if (selectedFile) {
        formDataToSubmit.append("supportingDocument", selectedFile);
      }

      const response = await authService.registerBank(formDataToSubmit);

      if (response.success) {
        localStorage.setItem("registrationEmail", basicInfo.email);
        localStorage.setItem("pendingUserId", response.data?.userId || "");
        localStorage.removeItem("bankBasicInfo"); // Clean up basic info

        showToast(response.message, "success");
        navigate("/register/verification");
      } else {
        showToast(response.message, "error");
      }
    } catch (error: any) {
      showToast(error.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="min-h-screen overflow-y-auto">
        <div className="p-8 lg:p-12 xl:p-16">
          <div className="max-w-[440px] mx-auto">
            <div className="space-y-16">
              <div className="space-y-8">
                <p className="text-[#4400B8] text-sm">POS Taxation</p>
                <Link
                  to="/register"
                  className="text-[#4400B8] text-sm flex items-center gap-2"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 4.293a1 1 0 0 1 0 1.414L6.414 9H17a1 1 0 1 1 0 2H6.414l3.293 3.293a1 1 0 0 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0z"
                    />
                  </svg>
                  Back
                </Link>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <h1 className="text-[28px] font-bold text-[#4400B8]">
                    Bank Details
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Provide your bank's information to complete registration.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="bankName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bank Name
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="registrationNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Registration Number
                    </label>
                    <input
                      type="text"
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="Enter registration number"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="headOfficeAddress"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Head Office Address
                    </label>
                    <input
                      type="text"
                      id="headOfficeAddress"
                      value={formData.headOfficeAddress}
                      onChange={handleChange}
                      placeholder="Enter head office address"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="numAgents"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Number of POS Agents
                    </label>
                    <input
                      type="number"
                      id="numAgents"
                      value={formData.numAgents}
                      onChange={handleChange}
                      placeholder="Enter number of agents"
                      required
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Agents Data
                      <span className="text-gray-500 text-xs ml-1">
                        (PDF, Excel, or CSV, max 5MB)
                      </span>
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragging
                          ? "border-[#4400B8] bg-[#4400B8]/5"
                          : "border-gray-300 hover:border-[#4400B8]"
                      }`}
                    >
                      <input
                        type="file"
                        id="supportingDocument"
                        onChange={handleFileChange}
                        accept=".pdf,.csv,.xls,.xlsx"
                        className="hidden"
                      />
                      <label
                        htmlFor="supportingDocument"
                        className="cursor-pointer"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-center">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div className="text-gray-600">
                            {selectedFile ? (
                              <span className="text-[#4400B8]">
                                {selectedFile.name}
                              </span>
                            ) : (
                              <>
                                <span className="text-[#4400B8] font-medium">
                                  Click to upload
                                </span>{" "}
                                or drag and drop your list of active POS agents
                                data
                              </>
                            )}
                          </div>
                          {fileError && (
                            <p className="text-red-500 text-sm">{fileError}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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
                        Processing...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block bg-[#4400B8] fixed top-0 right-0 w-1/2 h-screen">
        <div className="h-full flex items-center p-8 lg:p-12 xl:p-16">
          <div className="max-w-[480px] space-y-6">
            <h2 className="text-[48px] leading-tight font-bold text-white">
              Complete Your Bank Registration
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              Provide your bank details to finalize your registration and start
              managing tax compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
