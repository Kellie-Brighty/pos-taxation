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
  onSnapshot,
  orderBy,
  getDocs,
  Timestamp,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";

// Constants
const TAX_RATE = 0.05; // 5% tax rate used throughout the application

// Types
export interface BankSubmission {
  id: string;
  dateSubmitted: string;
  bankName: string;
  posAgents: number;
  totalIncome: number;
  status: "Approved" | "Pending" | "Rejected";
  createdAt?: Timestamp;
  bankId: string;
}

export interface TaxReport {
  id: string;
  bankId: string;
  bankName: string;
  transactionVolume: number;
  profitBaseline: number;
  documentURL: string;
  fileName: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Timestamp;
  notes?: string;
}

export interface DashboardStats {
  totalBanks: number;
  totalPosAgents: string;
  totalTaxRevenue: string;
  totalDeductions: string;
  pendingAmount: string;
  isLoading: boolean;
}

interface AdminDashboardContextType {
  stats: DashboardStats;
  recentSubmissions: BankSubmission[];
  taxReports: TaxReport[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AdminDashboardContext = createContext<
  AdminDashboardContextType | undefined
>(undefined);

export const AdminDashboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBanks: 0,
    totalPosAgents: "0",
    totalTaxRevenue: "₦0",
    totalDeductions: "₦0",
    pendingAmount: "₦0",
    isLoading: true,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<BankSubmission[]>(
    []
  );
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Count total banks (users with role 'bank')
      const banksQuery = query(
        collection(db, "users"),
        where("role", "==", "bank")
      );
      const banksSnapshot = await getCountFromServer(banksQuery);
      const totalBanks = banksSnapshot.data().count;

      // Count total POS agents
      const posAgentsQuery = query(collection(db, "posAgents"));
      const posAgentsSnapshot = await getCountFromServer(posAgentsQuery);
      const totalPosAgents = posAgentsSnapshot.data().count;

      // Calculate tax revenue stats
      const taxReportsQuery = query(
        collection(db, "taxReports"),
        orderBy("submittedAt", "desc")
      );

      const taxReportsSnapshot = await getDocs(taxReportsQuery);
      let totalRevenue = 0;
      let totalDeductions = 0;
      let pendingAmount = 0;

      const reports: TaxReport[] = [];

      taxReportsSnapshot.forEach((doc) => {
        const data = doc.data();

        // Calculate tax at 5% of transaction volume
        const transactionVolume = data.transactionVolume || 0;
        const profitBaseline = data.profitBaseline || 0;
        const estimatedProfit = transactionVolume * (profitBaseline / 100);
        const taxAmount = estimatedProfit * TAX_RATE;

        if (data.status === "approved") {
          totalRevenue += transactionVolume;
          totalDeductions += taxAmount;
        } else if (data.status === "pending") {
          pendingAmount += taxAmount;
        }

        reports.push({
          id: doc.id,
          bankId: data.bankId,
          bankName: data.bankName,
          transactionVolume: data.transactionVolume,
          profitBaseline: data.profitBaseline,
          documentURL: data.documentURL,
          fileName: data.fileName,
          status: data.status,
          submittedAt: data.submittedAt,
          notes: data.notes,
        });
      });

      setTaxReports(reports);

      // Format bank submissions for the dashboard
      const recentSubmissionsData: BankSubmission[] = reports
        .slice(0, 5)
        .map((report) => ({
          id: report.id,
          dateSubmitted: report.submittedAt
            ? new Date(report.submittedAt.toDate()).toLocaleDateString()
            : "Unknown",
          bankName: report.bankName,
          posAgents: Math.floor(Math.random() * 5000) + 1000, // Placeholder - in real app we'd get actual counts
          totalIncome: report.transactionVolume,
          status:
            report.status === "approved"
              ? "Approved"
              : report.status === "rejected"
              ? "Rejected"
              : "Pending",
          bankId: report.bankId,
        }));

      setRecentSubmissions(recentSubmissionsData);

      // Update stats
      setStats({
        totalBanks,
        totalPosAgents:
          totalPosAgents > 1000
            ? `${Math.floor(totalPosAgents / 1000)}k+`
            : totalPosAgents.toString(),
        totalTaxRevenue: `₦${totalRevenue.toLocaleString()}`,
        totalDeductions: `₦${totalDeductions.toLocaleString()}`,
        pendingAmount: `₦${pendingAmount.toLocaleString()}`,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadDashboardData();
    let unsubscribeListener = () => {};

    try {
      // Set up real-time listeners for tax reports
      const taxReportsQuery = query(
        collection(db, "taxReports"),
        orderBy("submittedAt", "desc"),
        limit(20) // Limit to recent reports for performance
      );

      unsubscribeListener = onSnapshot(
        taxReportsQuery,
        (_snapshot) => {
          // When tax reports change, refresh all dashboard data
          loadDashboardData();
        },
        (error) => {
          console.error("Error in tax reports listener:", error);
        }
      );
    } catch (err) {
      console.error("Error setting up admin dashboard listener:", err);
    }

    return () => {
      try {
        if (unsubscribeListener) {
          unsubscribeListener();
        }
      } catch (err) {
        console.error(
          "Error unsubscribing from admin dashboard listener:",
          err
        );
      }
    };
  }, [currentUser]);

  const refreshData = async () => {
    await loadDashboardData();
  };

  const value = {
    stats,
    recentSubmissions,
    taxReports,
    isLoading,
    refreshData,
  };

  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error(
      "useAdminDashboard must be used within an AdminDashboardProvider"
    );
  }
  return context;
};
