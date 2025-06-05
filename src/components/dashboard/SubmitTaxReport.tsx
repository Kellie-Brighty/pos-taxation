import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useBankTaxSubmission } from "../../context/BankTaxSubmissionContext";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";

const SubmitTaxReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, currentUser } = useAuth();
  const {
    currentSubmissions,
    missingMonths,
    currentMonth,

    hasSubmittedCurrentMonth,
    hasApprovedSubmissionForCurrentMonth,
    isLoading: isLoadingSubmissions,
    refreshSubmissions,
  } = useBankTaxSubmission();
  const [file, setFile] = useState<File | null>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [transactionVolume, setTransactionVolume] = useState("");
  const [profitBaseline, setProfitBaseline] = useState("");
  const [notes, setNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [success, _setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
    label: string;
  } | null>(null);

  // State for handling rejections
  const [rejectedReport, setRejectedReport] = useState<any>(null);
  const [rejectedInvoice, setRejectedInvoice] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isResubmission, setIsResubmission] = useState(false);
  const [previousDocumentURL, setPreviousDocumentURL] = useState<string | null>(
    null
  );
  const [previousPaymentAmount, setPreviousPaymentAmount] = useState(0);
  const [newTaxAmount, setNewTaxAmount] = useState(0);
  const [additionalTaxAmount, setAdditionalTaxAmount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract reportId from query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const specificReportId = queryParams.get("reportId");

  // Load either a specific report (if reportId is provided) or check for recent rejected reports
  useEffect(() => {
    // Clear any error message when the component mounts without a specific report ID
    if (!specificReportId) {
      setLoadError(null);
    }

    const loadRejectedReport = async () => {
      if (!currentUser) return;

      try {
        let rejectedReportData;
        let rejectedReportId;

        if (specificReportId) {
          // Load the specific report if an ID was provided in the URL
          const reportRef = doc(db, "taxReports", specificReportId);
          const reportSnap = await getDoc(reportRef);

          if (reportSnap.exists()) {
            rejectedReportData = reportSnap.data();
            rejectedReportId = reportSnap.id;

            // Verify this report belongs to the current user and is rejected
            if (rejectedReportData.bankId !== currentUser.uid) {
              setLoadError("You don't have permission to view this report");
              return;
            }

            if (rejectedReportData.status !== "rejected") {
              setLoadError(
                "This report is not currently rejected and cannot be revised"
              );
              return;
            }
          } else {
            setLoadError("Report not found");
            return;
          }
        } else {
          // No specific ID, find the most recent rejected report (fallback behavior)
          const rejectedReportsQuery = query(
            collection(db, "taxReports"),
            where("bankId", "==", currentUser.uid),
            where("status", "==", "rejected"),
            orderBy("updatedAt", "desc"),
            limit(1)
          );

          const querySnapshot = await getDocs(rejectedReportsQuery);

          if (querySnapshot.empty) {
            // No rejected reports found - this is not an error condition
            // when no specific report ID was requested
            return;
          }

          rejectedReportData = querySnapshot.docs[0].data();
          rejectedReportId = querySnapshot.docs[0].id;
        }

        // Process the rejected report data
        setRejectedReport({
          id: rejectedReportId,
          ...rejectedReportData,
        });

        setRejectionReason(rejectedReportData.rejectionReason || null);
        setPreviousDocumentURL(rejectedReportData.documentURL || null);

        // Pre-populate form with rejected report data
        if (rejectedReportData.transactionVolume) {
          setTransactionVolume(
            `₦ ${rejectedReportData.transactionVolume.toLocaleString()}`
          );
        }

        if (rejectedReportData.profitBaseline) {
          setProfitBaseline(`${rejectedReportData.profitBaseline}%`);
        }

        if (rejectedReportData.notes) {
          setNotes(rejectedReportData.notes);
        }

        setIsResubmission(true);

        // Find the associated invoice for the rejected report
        const invoicesQuery = query(
          collection(db, "invoices"),
          where("taxReportId", "==", rejectedReportId)
        );

        const invoiceSnapshot = await getDocs(invoicesQuery);

        if (!invoiceSnapshot.empty) {
          const invoiceData = invoiceSnapshot.docs[0].data();
          const invoiceId = invoiceSnapshot.docs[0].id;

          setRejectedInvoice({
            id: invoiceId,
            ...invoiceData,
          });

          // Store any previous payment amount
          if (
            invoiceData.previousPaymentAmount &&
            invoiceData.previousPaymentAmount > 0
          ) {
            setPreviousPaymentAmount(invoiceData.previousPaymentAmount);
          }
        }
      } catch (err) {
        console.error("Error loading rejected report:", err);
        // Only set error if we were explicitly trying to load a specific report
        if (specificReportId) {
          setLoadError("Failed to load previous report data");
        }
      }
    };

    loadRejectedReport();
  }, [currentUser, specificReportId]);

  // Calculate tax amounts when transaction volume or profit baseline changes
  useEffect(() => {
    try {
      const cleanVolume = transactionVolume.replace(/[₦\s,]/g, "") || "0";
      const cleanProfit = profitBaseline.replace(/[%\s]/g, "") || "0";
      const volumeNum = Number(cleanVolume);
      const profitNum = Number(cleanProfit);

      if (!isNaN(volumeNum) && !isNaN(profitNum)) {
        const estimatedProfit = volumeNum * (profitNum / 100);
        const calculatedTaxAmount = estimatedProfit * 0.05; // 5% tax rate

        setNewTaxAmount(calculatedTaxAmount);

        // Calculate additional tax if there was a previous payment
        if (isResubmission && previousPaymentAmount > 0) {
          const additional = Math.max(
            0,
            calculatedTaxAmount - previousPaymentAmount
          );
          setAdditionalTaxAmount(additional);
        } else {
          setAdditionalTaxAmount(calculatedTaxAmount);
        }
      } else {
        setNewTaxAmount(0);
        setAdditionalTaxAmount(0);
      }
    } catch (e) {
      console.error("Error calculating tax amounts:", e);
      setNewTaxAmount(0);
      setAdditionalTaxAmount(0);
    }
  }, [
    transactionVolume,
    profitBaseline,
    isResubmission,
    previousPaymentAmount,
  ]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileSelected(true);
      // Clear the file selection success message after 3 seconds
      setTimeout(() => setFileSelected(false), 3000);
    }
  };

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return (
          <svg
            className="w-8 h-8 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M8.5 9.5a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-2 3a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "doc":
      case "docx":
        return (
          <svg
            className="w-8 h-8 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M8 10a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0-4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 8a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "xls":
      case "xlsx":
        return (
          <svg
            className="w-8 h-8 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-8 h-8 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Check if file can be previewed in browser
  const canPreviewFile = (file: File): boolean => {
    const fileType = file.type;
    // PDF files can be previewed directly in most browsers
    if (fileType === "application/pdf") return true;

    // Images can be previewed
    if (fileType.startsWith("image/")) return true;

    // Other file types typically can't be previewed directly
    return false;
  };

  // Function to handle file preview
  const handleFilePreview = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  const validateForm = () => {
    // Reset error message
    setError(null);

    // Check if a month is selected for regular submissions
    if (!isResubmission && !selectedMonth) {
      setError("Please select a month for your tax report submission.");
      return false;
    }

    // If no transaction volume is entered
    if (!transactionVolume.trim()) {
      setError("Please enter your total transaction volume for the period.");
      return false;
    }

    // If no profit baseline is entered
    if (!profitBaseline.trim()) {
      setError("Please enter your profit baseline percentage.");
      return false;
    }

    // Check if file is uploaded (only for new submissions or resubmissions with new files)
    if (!file && !previousDocumentURL) {
      setError("Please upload a supporting document for your tax report.");
      return false;
    }

    // Check if confirmation checkbox is checked
    if (!isConfirmed) {
      setError(
        "Please confirm that the information provided is accurate and complete."
      );
      return false;
    }

    return true;
  };

  // Helper function to safely parse number values from form inputs
  const parseNumberInput = (
    value: string,
    fieldType: "volume" | "profit"
  ): number => {
    try {
      const cleaned =
        fieldType === "volume"
          ? value.replace(/[₦\s,]/g, "")
          : value.replace(/[%\s]/g, "");

      if (!cleaned || cleaned === "") return 0;

      const num = Number(cleaned);
      return isNaN(num) ? 0 : num;
    } catch (e) {
      console.error(`Error parsing ${fieldType} input:`, e);
      return 0;
    }
  };

  const calculateTaxAmount = (volume: number, profit: number): number => {
    if (isNaN(volume) || isNaN(profit) || volume <= 0 || profit <= 0) {
      return 0;
    }
    // Calculate tax at 5% of estimated profit
    const estimatedProfit = volume * (profit / 100);
    return estimatedProfit * 0.05; // 5% tax rate
  };

  const generateInvoiceNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(10000 + Math.random() * 90000);
    return `INV-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !currentUser) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Initialize document URL - will either be the previous one or a newly uploaded one
      let documentURL = previousDocumentURL;
      let fileName = rejectedReport?.fileName || "";

      // Only upload a new file if one was selected
      if (file) {
        // 1. Upload file to Firebase Storage
        const storageRef = ref(
          storage,
          `tax-reports/${currentUser.uid}/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        try {
          await new Promise<void>((resolve, reject) => {
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
                setError("Failed to upload file. Please try again.");
                setIsSubmitting(false);
                reject(error);
              },
              async () => {
                // Upload completed successfully
                documentURL = await getDownloadURL(uploadTask.snapshot.ref);
                fileName = file.name;
                resolve();
              }
            );
          });
        } catch (err) {
          // If there was an error during upload, stop the submission
          return;
        }
      }

      // Now that we have the document URL (either new or previous), we can proceed with the submission
      try {
        // Parse form values
        const transactionVolumeNum = parseNumberInput(
          transactionVolume,
          "volume"
        );
        const profitBaselineNum = parseNumberInput(profitBaseline, "profit");

        if (isResubmission && rejectedReport?.id && rejectedInvoice?.id) {
          // UPDATE EXISTING REPORT AND INVOICE

          // 1. Update the tax report
          const taxReportRef = doc(db, "taxReports", rejectedReport.id);
          await updateDoc(taxReportRef, {
            transactionVolume: transactionVolumeNum,
            profitBaseline: profitBaselineNum,
            notes: notes.trim() || null,
            documentURL: documentURL,
            fileName: fileName,
            status: "pending",
            resubmittedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            revisionCount: (rejectedReport.revisionCount || 0) + 1,
            rejectionReason: null, // Clear the rejection reason
          });

          // 2. Update the invoice
          const invoiceRef = doc(db, "invoices", rejectedInvoice.id);

          // Calculate the tax amount
          const newTotalTaxAmount = calculateTaxAmount(
            transactionVolumeNum,
            profitBaselineNum
          );

          // Calculate additional amount needed (if any)
          const additionalAmount = Math.max(
            0,
            newTotalTaxAmount - previousPaymentAmount
          );

          await updateDoc(invoiceRef, {
            transactionVolume: transactionVolumeNum,
            profitBaseline: profitBaselineNum,
            taxAmount: newTotalTaxAmount,
            additionalTaxAmount: additionalAmount,
            previousPaymentAmount: previousPaymentAmount,
            status: "pending",
            updatedAt: serverTimestamp(),
            resubmittedAt: serverTimestamp(),
            rejectionReason: null, // Clear the rejection reason
          });

          // Navigate to the invoice details page
          navigate(`/bank/dashboard/invoices/${rejectedInvoice.id}`);
        } else {
          // CREATE NEW REPORT AND INVOICE (standard flow)

          // Get the month details for new submissions
          const submissionMonth = selectedMonth || currentMonth;

          // 2. Store tax report data in Firestore
          const taxReportData = {
            bankId: currentUser.uid,
            bankName: userData?.businessName || "Unknown Bank",
            transactionVolume: transactionVolumeNum,
            profitBaseline: profitBaselineNum,
            notes: notes.trim() || null,
            documentURL: documentURL,
            fileName: fileName,
            status: "pending",
            submittedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            revisionCount: 0,
            // Add month tracking information
            month: submissionMonth.month,
            year: submissionMonth.year,
            monthLabel: submissionMonth.label,
          };

          // Add the tax report to Firestore
          const taxReportRef = await addDoc(
            collection(db, "taxReports"),
            taxReportData
          );

          // 3. Generate an invoice
          const taxAmount = calculateTaxAmount(
            transactionVolumeNum,
            profitBaselineNum
          );
          const invoiceNumber = generateInvoiceNumber();

          // Set due date (14 days from now)
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);

          const invoiceData = {
            invoiceNumber,
            bankId: currentUser.uid,
            bankName: userData?.businessName || "Unknown Bank",
            taxReportId: taxReportRef.id,
            transactionVolume: transactionVolumeNum,
            profitBaseline: profitBaselineNum,
            taxRate: 5, // 5%
            taxAmount,
            status: "pending",
            issuedDate: serverTimestamp(),
            dueDate: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            paymentStatus: "pending",
            // Add month tracking information
            month: submissionMonth.month,
            year: submissionMonth.year,
            monthLabel: submissionMonth.label,
          };

          // Add the invoice to Firestore
          const invoiceRef = await addDoc(
            collection(db, "invoices"),
            invoiceData
          );

          // Create a tax payment record for government tracking
          const taxPaymentData = {
            bankId: currentUser.uid,
            bankName: userData?.businessName || "Unknown Bank",
            amount: taxAmount,
            referenceNumber: invoiceNumber,
            status: "pending",
            createdAt: serverTimestamp(),
            month: submissionMonth.month,
            year: submissionMonth.year,
            monthLabel: submissionMonth.label,
          };

          await addDoc(collection(db, "taxPayments"), taxPaymentData);

          // Navigate to the invoice details page
          navigate(`/bank/dashboard/invoices/${invoiceRef.id}`);
        }
      } catch (err) {
        console.error("Error creating/updating tax report:", err);
        setError("Failed to process tax report. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error submitting tax report:", err);
      setError("Failed to submit tax report. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Function to handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubmissions();
    } catch (err) {
      console.error("Error refreshing submission status:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {isResubmission ? "Revise Tax Report" : "Declare POS Income"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isResubmission
              ? "Your previous submission was rejected. Please review the feedback and make necessary changes."
              : "Enter the details below to generate your tax invoice. Ensure all information is accurate, as it will be used to calculate your tax obligation."}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoadingSubmissions}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
            isRefreshing || isLoadingSubmissions
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-[#4400B8]/10 text-[#4400B8] hover:bg-[#4400B8]/20"
          }`}
        >
          {isRefreshing || isLoadingSubmissions ? (
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
      </div>

      {/* If submission is approved for current month, only show this message and hide the rest of the form */}
      {hasApprovedSubmissionForCurrentMonth ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
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
                Tax report already approved for {currentMonth.label}
              </p>
              <p className="text-sm text-green-700 mt-1">
                You have already submitted and received approval for your tax
                report this month. You can only submit a new report when the
                next month begins.
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-green-800">
                  Previous Submissions
                </h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Month
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Submission Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentSubmissions.slice(0, 5).map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {submission.monthLabel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.submissionDate?.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                submission.approved
                                  ? "bg-green-100 text-green-800"
                                  : submission.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {submission.approved
                                ? "Approved"
                                : submission.status === "rejected"
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{submission.amount?.toLocaleString() || "0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Rejection notice if applicable */}
          {isResubmission && rejectionReason && (
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
                  <p className="text-sm font-medium text-red-800">
                    Your previous submission was rejected
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Reason: {rejectionReason}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please make the necessary changes and resubmit your tax
                    report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Monthly submission status */}
          {!isResubmission && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Monthly Tax Submission Status
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Tax submissions are required once per month. Select a month to
                  submit your tax report.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Current month status */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {currentMonth.label} (Current Month)
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {hasSubmittedCurrentMonth
                        ? "You have already submitted a tax report for this month."
                        : "Tax report is required for this month."}
                    </p>
                  </div>

                  {hasSubmittedCurrentMonth ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg
                        className="w-4 h-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Submitted
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedMonth(currentMonth)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedMonth &&
                        selectedMonth.month === currentMonth.month &&
                        selectedMonth.year === currentMonth.year
                          ? "bg-[#4400B8] text-white"
                          : "bg-[#4400B8]/10 text-[#4400B8] hover:bg-[#4400B8]/20"
                      }`}
                    >
                      {selectedMonth &&
                      selectedMonth.month === currentMonth.month &&
                      selectedMonth.year === currentMonth.year
                        ? "Selected"
                        : "Select"}
                    </button>
                  )}
                </div>

                {/* Missing months */}
                {missingMonths.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Previous Months
                    </h3>
                    <p className="text-sm text-gray-600">
                      You have missing tax submissions for the following months
                      since your account was created:
                    </p>

                    <div className="space-y-2 mt-3">
                      {missingMonths.map((month) => (
                        <div
                          key={`${month.year}-${month.month}`}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {month.monthLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMonth({
                                month: month.month,
                                year: month.year,
                                label: month.monthLabel,
                              })
                            }
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              selectedMonth &&
                              selectedMonth.month === month.month &&
                              selectedMonth.year === month.year
                                ? "bg-[#4400B8] text-white"
                                : "bg-[#4400B8]/10 text-[#4400B8] hover:bg-[#4400B8]/20"
                            }`}
                          >
                            {selectedMonth &&
                            selectedMonth.month === month.month &&
                            selectedMonth.year === month.year
                              ? "Selected"
                              : "Select"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent submissions */}
                {currentSubmissions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Recent Submissions
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Month
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Submission Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentSubmissions.slice(0, 3).map((submission) => (
                            <tr key={submission.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {submission.monthLabel}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {submission.submissionDate?.toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₦{submission.amount?.toLocaleString() || "0"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Already submitted notification for pending */}
          {hasSubmittedCurrentMonth &&
            !hasApprovedSubmissionForCurrentMonth &&
            !selectedMonth &&
            !isResubmission && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Tax report already submitted for {currentMonth.label}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your submission is pending approval. You can select a
                      previous month if you need to submit a missing report.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Selected month notification */}
          {selectedMonth && !isResubmission && (
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
                    Submitting for {selectedMonth.label}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    You are preparing a tax report for {selectedMonth.label}.
                    Please enter your transaction volume and profit details
                    below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Previous payment information if applicable */}
          {isResubmission && previousPaymentAmount > 0 && (
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
                    Previous Payment Information
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Amount already paid: ₦
                    {previousPaymentAmount.toLocaleString()}
                  </p>
                  {additionalTaxAmount > 0 && (
                    <p className="text-sm text-blue-700 mt-1">
                      Additional amount due: ₦
                      {additionalTaxAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {success && (
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
                    {isResubmission
                      ? "Tax report updated successfully! Redirecting to your invoice..."
                      : "Tax report submitted successfully! Generating your invoice..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loadError && (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {loadError}
                    {loadError === "Failed to load previous report data" && (
                      <button
                        onClick={() =>
                          navigate("/bank/dashboard/submit-tax-report")
                        }
                        className="ml-2 text-[#4400B8] hover:underline"
                      >
                        Start a new report instead
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="max-w-3xl space-y-6 md:space-y-8"
          >
            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Supporting Document{" "}
                {isResubmission
                  ? "(Upload a new document or keep the previous one)"
                  : "(Required)"}
              </label>

              {/* Show previous document if this is a resubmission */}
              {isResubmission && previousDocumentURL && !file && (
                <div className="mt-2 mb-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(
                          rejectedReport?.fileName || "document.pdf"
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rejectedReport?.fileName || "Previous Document"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Previously submitted document
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            Original document from rejected report
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4400B8]"
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
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          Replace
                        </button>
                        <a
                          href={previousDocumentURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-[#4400B8] bg-[#4400B8]/10 hover:bg-[#4400B8]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4400B8]"
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
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Document
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center px-4 md:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#4400B8] transition-colors"
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400"
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

              {/* Display file selection success message */}
              {fileSelected && (
                <div
                  className="mt-2 text-sm text-green-600 flex items-center"
                  style={{
                    animation: "fadeIn 0.3s ease-in-out",
                  }}
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
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  File selected successfully
                </div>
              )}

              {/* Display the selected file */}
              {file && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Document ready for upload
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4400B8]"
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
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Remove
                      </button>
                      {canPreviewFile(file) && (
                        <button
                          type="button"
                          onClick={() => handleFilePreview(file)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-[#4400B8] bg-[#4400B8]/10 hover:bg-[#4400B8]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4400B8]"
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
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                  placeholder="₦ 25,000,000"
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
                  placeholder="20%"
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
                  placeholder="Any additional information about this tax report"
                />
              </div>
            </div>

            {/* Tax Calculation Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-2">
                Tax Calculation Preview
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Transaction Volume:
                  </span>
                  <span className="text-sm text-gray-900">
                    {transactionVolume || "₦ 0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Profit Baseline:
                  </span>
                  <span className="text-sm text-gray-900">
                    {profitBaseline || "0%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Estimated Profit:
                  </span>
                  <span className="text-sm text-gray-900">
                    ₦{" "}
                    {(() => {
                      try {
                        const cleanVolume =
                          transactionVolume.replace(/[₦\s,]/g, "") || "0";
                        const cleanProfit =
                          profitBaseline.replace(/[%\s]/g, "") || "0";
                        const volumeNum = Number(cleanVolume);
                        const profitNum = Number(cleanProfit);
                        if (!isNaN(volumeNum) && !isNaN(profitNum)) {
                          return (
                            volumeNum *
                            (profitNum / 100)
                          ).toLocaleString();
                        }
                        return "0";
                      } catch (e) {
                        return "0";
                      }
                    })()}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-sm text-gray-800">
                    Total Tax Amount (5%):
                  </span>
                  <span className="text-sm text-gray-900">
                    ₦ {newTaxAmount.toLocaleString()}
                  </span>
                </div>

                {isResubmission && previousPaymentAmount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Amount Already Paid:
                      </span>
                      <span className="text-sm text-gray-900">
                        ₦ {previousPaymentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-800">
                        Additional Amount Due:
                      </span>
                      <span className="text-sm text-gray-900">
                        ₦ {additionalTaxAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="confirm"
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#4400B8] focus:ring-[#4400B8]"
                  disabled={isSubmitting}
                />
              </div>
              <label htmlFor="confirm" className="ml-2 text-sm text-gray-600">
                I confirm that the details provided are accurate and up to date.
              </label>
            </div>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Uploading document...</span>
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isConfirmed}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center ${
                  isSubmitting
                    ? "bg-[#4400B8]/70 cursor-wait"
                    : isConfirmed
                    ? "bg-[#4400B8] hover:bg-[#4400B8]/90"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {isSubmitting && (
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
                {isSubmitting
                  ? "Submitting..."
                  : isResubmission
                  ? "Update Report"
                  : "Submit and Generate Invoice"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SubmitTaxReport;
