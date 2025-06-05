import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";

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
  const { currentUser, userData } = useAuth();

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
  const [supportingDocument, setSupportingDocument] = useState<File | null>(
    null
  );

  useEffect(() => {
    // Check if user is authenticated already
    if (currentUser && userData && userData.role !== "bank") {
      showToast("You are not authorized to access this page", "error");
      navigate("/");
      return;
    }

    // If this is part of registration flow, check for basic info
    if (!currentUser) {
      const basicInfo = localStorage.getItem("bankBasicInfo");
      if (!basicInfo) {
        showToast("Please complete your basic information first", "error");
        navigate("/register");
      }
    }
  }, [navigate, showToast, currentUser, userData]);

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSupportingDocument(file);
        setSelectedFile(file);
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
        setSupportingDocument(file);
      }
    }
  }, []);

  const uploadFileToFirebase = async (file: File): Promise<string> => {
    try {
      // Create a unique file name
      const timestamp = new Date().getTime();
      const fileName = `${currentUser?.uid || "temp"}_${timestamp}_${
        file.name
      }`;

      // Create a reference to the file location in Firebase Storage
      const storageRef = ref(storage, `bank_documents/${fileName}`);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let documentURL = "";

      // Upload document if selected
      if (supportingDocument) {
        documentURL = await uploadFileToFirebase(supportingDocument);
      }

      if (currentUser) {
        // User is already registered, update Firestore document
        const userDocRef = doc(db, "users", currentUser.uid);

        await updateDoc(userDocRef, {
          businessName: formData.bankName,
          registrationNumber: formData.registrationNumber,
          businessAddress: formData.headOfficeAddress,
          numAgents: formData.numAgents,
          ...(documentURL && { supportingDocumentURL: documentURL }),
          registrationCompleted: true,
        });

        showToast("Bank details updated successfully", "success");
        navigate("/bank/dashboard");
      } else {
        // Registration flow - store data in localStorage for next step
        const basicInfo = JSON.parse(
          localStorage.getItem("bankBasicInfo") || "{}"
        ) as BankBasicInfo;

        // Store combined data for verification step
        localStorage.setItem(
          "bankFullDetails",
          JSON.stringify({
            ...basicInfo,
            businessName: formData.bankName,
            registrationNumber: formData.registrationNumber,
            businessAddress: formData.headOfficeAddress,
            numAgents: formData.numAgents,
            supportingDocumentURL: documentURL,
          })
        );

        showToast("Bank details saved. Proceed to verification.", "success");
        navigate("/register/verification");
      }
    } catch (error: any) {
      console.error("Error saving bank details:", error);
      showToast(error.message || "Failed to save bank details", "error");
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
                      placeholder="Enter number of POS agents"
                      required
                      min="1"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Supporting Document
                    </label>
                    <div
                      className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-[#4400B8] bg-[#4400B8]/5"
                          : "border-gray-300 hover:border-[#4400B8]/50 hover:bg-[#4400B8]/5"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      {selectedFile ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg
                            className="w-10 h-10 text-[#4400B8]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span className="text-sm text-gray-500">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            className="text-xs text-[#4400B8] hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setSupportingDocument(null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-12 h-12 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path>
                          </svg>
                          <p className="text-sm text-gray-500">
                            Drag & drop your file here, or{" "}
                            <span className="text-[#4400B8]">browse</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Supported formats: PDF, Excel, CSV (Max 5MB)
                          </p>
                        </>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.xls,.xlsx,.csv"
                        onChange={handleFileChange}
                      />
                    </div>
                    {fileError && (
                      <p className="text-red-500 text-xs mt-1">{fileError}</p>
                    )}
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
                        Saving...
                      </>
                    ) : (
                      "Save & Continue"
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
              Provide your bank details and supporting documentation to continue
              the registration process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
