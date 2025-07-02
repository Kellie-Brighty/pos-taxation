import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

// Types
export interface MonthlySubmission {
  id: string;
  month: number; // 0-11 (January-December)
  year: number;
  monthLabel: string; // Example: "January 2023"
  submitted: boolean;
  approved: boolean; // Track if submission has been approved
  submissionDate?: Date;
  amount?: number;
  reportId?: string;
  invoiceId?: string;
  status?: string; // Store the status (pending, approved, rejected)
}

// Add Invoice interface
interface Invoice {
  id: string;
  taxReportId: string;
  taxAmount?: number;
  [key: string]: any; // Allow for other properties
}

interface MissingMonth {
  month: number;
  year: number;
  monthLabel: string;
}

interface BankTaxSubmissionContextType {
  currentSubmissions: MonthlySubmission[];
  missingMonths: MissingMonth[];
  currentMonth: { month: number; year: number; label: string };
  canSubmitCurrentMonth: boolean;
  hasSubmittedCurrentMonth: boolean;
  hasApprovedSubmissionForCurrentMonth: boolean;
  isLoading: boolean;
  error: string | null;
  refreshSubmissions: () => Promise<void>;
}

const BankTaxSubmissionContext = createContext<
  BankTaxSubmissionContextType | undefined
>(undefined);

export const BankTaxSubmissionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser, userData } = useAuth();
  const [currentSubmissions, setCurrentSubmissions] = useState<
    MonthlySubmission[]
  >([]);
  const [missingMonths, setMissingMonths] = useState<MissingMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current month and year
  const now = new Date();
  const currentMonthInfo = {
    month: now.getMonth(),
    year: now.getFullYear(),
    label: now.toLocaleString("default", { month: "long", year: "numeric" }),
  };

  // Calculate start date based on bank's account creation date
  // If creation date is not available, fallback to 6 months ago
  const getStartDate = () => {
    if (userData?.createdAt) {
      // Use the bank's account creation date
      const creationTimestamp = userData.createdAt;
      // Check if it's a Firebase Timestamp or a regular date
      if (creationTimestamp instanceof Timestamp) {
        return creationTimestamp.toDate();
      } else if (
        creationTimestamp.toDate &&
        typeof creationTimestamp.toDate === "function"
      ) {
        return creationTimestamp.toDate();
      } else if (creationTimestamp instanceof Date) {
        return creationTimestamp;
      } else if (typeof creationTimestamp === "string") {
        return new Date(creationTimestamp);
      }
    }

    // Fallback: use 6 months ago if creation date is not available
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  };

  // Function to format month and year as a label
  const formatMonthLabel = (month: number, year: number): string => {
    const date = new Date(year, month, 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Function to check if the given month is the current month
  // const isCurrentMonth = (month: number, year: number): boolean => {
  //   const now = new Date();
  //   return month === now.getMonth() && year === now.getFullYear();
  // };

  // Function to load bank submissions
  const loadBankSubmissions = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      // Query tax reports from this bank
      const reportsQuery = query(
        collection(db, "taxReports"),
        where("bankId", "==", currentUser.uid),
        orderBy("submittedAt", "desc")
      );

      const reportsSnapshot = await getDocs(reportsQuery);

      // Query invoices to get payment information
      const invoicesQuery = query(
        collection(db, "invoices"),
        where("bankId", "==", currentUser.uid),
        orderBy("issuedDate", "desc")
      );

      const invoicesSnapshot = await getDocs(invoicesQuery);

      // Create a map of invoice data by tax report ID
      const invoicesByReportId = new Map();
      invoicesSnapshot.forEach((doc) => {
        const invoice = { id: doc.id, ...doc.data() } as Invoice;
        if (invoice.taxReportId) {
          invoicesByReportId.set(invoice.taxReportId, invoice);
        }
      });

      // Process reports into monthly submissions
      const submissions: MonthlySubmission[] = [];
      const submittedMonths = new Set<string>(); // Track submitted months in format "YYYY-MM"

      reportsSnapshot.forEach((doc) => {
        const report = doc.data();
        const submittedAt = report.submittedAt?.toDate();

        if (submittedAt) {
          const month = submittedAt.getMonth();
          const year = submittedAt.getFullYear();
          const monthKey = `${year}-${month}`;

          // Only add if we haven't seen this month yet (get most recent submission for a month)
          if (!submittedMonths.has(monthKey)) {
            submittedMonths.add(monthKey);

            // Get associated invoice if it exists
            const invoice = invoicesByReportId.get(doc.id);

            // Check if submission is approved
            const isApproved = report.status === "approved";

            submissions.push({
              id: doc.id,
              month,
              year,
              monthLabel: formatMonthLabel(month, year),
              submitted: true,
              approved: isApproved,
              status: report.status || "pending",
              submissionDate: submittedAt,
              amount: invoice?.taxAmount || 0,
              reportId: doc.id,
              invoiceId: invoice?.id,
            });
          }
        }
      });

      // Sort submissions by date (most recent first)
      submissions.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      // Find missing months (starting from account creation date)
      const missingMonthsList: MissingMonth[] = [];
      const startDate = getStartDate();
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();

      console.log(
        `Calculating missing months from ${startMonth}/${startYear} (bank creation date) to current month`
      );

      // Loop through each month from start date to current month
      for (let year = startYear; year <= currentMonthInfo.year; year++) {
        const monthStart = year === startYear ? startMonth : 0;
        const monthEnd =
          year === currentMonthInfo.year ? currentMonthInfo.month : 11;

        for (let month = monthStart; month <= monthEnd; month++) {
          const monthKey = `${year}-${month}`;

          // If this month is not in our submissions list, add it to missing months
          if (!submittedMonths.has(monthKey)) {
            missingMonthsList.push({
              month,
              year,
              monthLabel: formatMonthLabel(month, year),
            });
          }
        }
      }

      // Sort missing months by date (oldest first)
      missingMonthsList.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      setCurrentSubmissions(submissions);
      setMissingMonths(missingMonthsList);
    } catch (err) {
      console.error("Error loading bank tax submissions:", err);
      setError(
        "Failed to load tax submission history. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (currentUser) {
      loadBankSubmissions();
    }
  }, [currentUser]);

  // Determine if user has submitted for current month
  const hasSubmittedCurrentMonth = currentSubmissions.some(
    (sub) =>
      sub.month === currentMonthInfo.month && sub.year === currentMonthInfo.year
  );

  // Determine if user has an approved submission for current month
  const hasApprovedSubmissionForCurrentMonth = currentSubmissions.some(
    (sub) =>
      sub.month === currentMonthInfo.month &&
      sub.year === currentMonthInfo.year &&
      sub.approved
  );

  // Can submit current month if:
  // 1. Not already submitted OR
  // 2. Submitted but rejected (not approved)
  const canSubmitCurrentMonth =
    !hasApprovedSubmissionForCurrentMonth &&
    (!hasSubmittedCurrentMonth ||
      currentSubmissions.some(
        (sub) =>
          sub.month === currentMonthInfo.month &&
          sub.year === currentMonthInfo.year &&
          sub.status === "rejected"
      ));

  const refreshSubmissions = async () => {
    await loadBankSubmissions();
  };

  const value = {
    currentSubmissions,
    missingMonths,
    currentMonth: currentMonthInfo,
    canSubmitCurrentMonth,
    hasSubmittedCurrentMonth,
    hasApprovedSubmissionForCurrentMonth,
    isLoading,
    error,
    refreshSubmissions,
  };

  return (
    <BankTaxSubmissionContext.Provider value={value}>
      {children}
    </BankTaxSubmissionContext.Provider>
  );
};

export const useBankTaxSubmission = () => {
  const context = useContext(BankTaxSubmissionContext);
  if (context === undefined) {
    throw new Error(
      "useBankTaxSubmission must be used within a BankTaxSubmissionProvider"
    );
  }
  return context;
};
 