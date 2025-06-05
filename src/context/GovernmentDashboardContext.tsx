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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";



// Types
export interface TaxPayment {
  id: string;
  bankId: string;
  bankName: string;
  amount: number;
  date: string;
  referenceNumber: string;
  status: "settled" | "pending";
  createdAt: Timestamp;
}

export interface AdminSettlement {
  id: string;
  amount: number;
  date: string;
  referenceNumber: string;
  description: string;
  createdAt: Timestamp;
}

export interface BankSubmissionStatus {
  bankId: string;
  bankName: string;
  hasSubmitted: boolean;
  lastSubmissionDate?: string;
  amount?: number;
}

export interface GovernmentDashboardStats {
  totalTaxCollected: string;
  pendingSettlements: string;
  totalBanks: number;
  monthlyRevenue: string;
  recentPayments: TaxPayment[];
  recentSettlements: AdminSettlement[];
  bankSubmissionStatus: BankSubmissionStatus[];
  currentMonth: string;
  isLoading: boolean;
}

interface GovernmentDashboardContextType {
  stats: GovernmentDashboardStats;
  refreshData: () => Promise<void>;
}

const GovernmentDashboardContext = createContext<
  GovernmentDashboardContextType | undefined
>(undefined);

export const GovernmentDashboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [_isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<GovernmentDashboardStats>({
    totalTaxCollected: "₦0",
    pendingSettlements: "₦0",
    totalBanks: 0,
    monthlyRevenue: "₦0",
    recentPayments: [],
    recentSettlements: [],
    bankSubmissionStatus: [],
    currentMonth: new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    }),
    isLoading: true,
  });

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Get current month for monthly revenue calculation
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentMonthStr = now.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      // Count total banks (users with role 'bank')
      const banksQuery = query(
        collection(db, "users"),
        where("role", "==", "bank")
      );
      const banksSnapshot = await getDocs(banksQuery);
      const totalBanks = banksSnapshot.size;

      // Initialize bank data for submission tracking
      const bankData: Map<
        string,
        {
          id: string;
          name: string;
          hasSubmitted: boolean;
          lastSubmissionDate?: string;
          amount?: number;
        }
      > = new Map();

      // Populate bank data map
      banksSnapshot.forEach((doc) => {
        const data = doc.data();
        bankData.set(doc.id, {
          id: doc.id,
          name: data.businessName || data.displayName || data.email,
          hasSubmitted: false,
        });
      });

      // Get tax payments from banks
      const taxPaymentsQuery = query(
        collection(db, "taxPayments"),
        orderBy("createdAt", "desc")
      );

      const taxPaymentsSnapshot = await getDocs(taxPaymentsQuery);
      let totalTaxCollected = 0;
      let pendingSettlements = 0;
      let monthlyRevenue = 0;

      const payments: TaxPayment[] = [];

      taxPaymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        const paymentDate = data.createdAt?.toDate() || new Date();
        const amount = data.amount || 0;
        const bankId = data.bankId;

        // Calculate total tax collected
        totalTaxCollected += amount;

        // Calculate pending settlements (not yet settled to government)
        // Only include payments with status "pending" in pending settlements
        if (data.status === "pending") {
          pendingSettlements += amount;
        }

        // Track bank submissions for current month
        if (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear &&
          bankId &&
          bankData.has(bankId)
        ) {
          // Calculate monthly revenue (including both pending and approved)
          monthlyRevenue += amount;

          // Update bank submission status
          const bank = bankData.get(bankId);
          if (bank) {
            bank.hasSubmitted = true;
            bank.lastSubmissionDate = paymentDate.toLocaleDateString();
            bank.amount = amount;
          }
        }

        payments.push({
          id: doc.id,
          bankId: data.bankId,
          bankName: data.bankName,
          amount: amount,
          date: paymentDate.toLocaleDateString(),
          referenceNumber: data.referenceNumber || "N/A",
          status: data.status || "pending",
          createdAt: data.createdAt,
        });
      });

      // Get admin settlements to government
      const settlementsQuery = query(
        collection(db, "adminSettlements"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const settlementsSnapshot = await getDocs(settlementsQuery);
      const settlements: AdminSettlement[] = [];

      settlementsSnapshot.forEach((doc) => {
        const data = doc.data();
        settlements.push({
          id: doc.id,
          amount: data.amount || 0,
          date: data.createdAt?.toDate().toLocaleDateString() || "Unknown",
          referenceNumber: data.referenceNumber || "N/A",
          description: data.description || "Tax revenue settlement",
          createdAt: data.createdAt,
        });
      });

      // Create array of bank submission status
      const bankSubmissionStatus: BankSubmissionStatus[] = Array.from(
        bankData.values()
      ).map((bank) => ({
        bankId: bank.id,
        bankName: bank.name,
        hasSubmitted: bank.hasSubmitted,
        lastSubmissionDate: bank.lastSubmissionDate,
        amount: bank.amount,
      }));

      // Update stats
      setStats({
        totalTaxCollected: `₦${totalTaxCollected.toLocaleString()}`,
        pendingSettlements: `₦${pendingSettlements.toLocaleString()}`,
        totalBanks,
        monthlyRevenue: `₦${monthlyRevenue.toLocaleString()}`,
        recentPayments: payments.slice(0, 10), // Get only the 10 most recent payments
        recentSettlements: settlements,
        bankSubmissionStatus,
        currentMonth: currentMonthStr,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading government dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadDashboardData();
    let unsubscribeTaxPayments = () => {};
    let unsubscribeSettlements = () => {};

    try {
      // Set up real-time listeners for tax payments
      const taxPaymentsQuery = query(
        collection(db, "taxPayments"),
        orderBy("createdAt", "desc"),
        limit(20) // Limit to recent payments for performance
      );

      unsubscribeTaxPayments = onSnapshot(
        taxPaymentsQuery,
        (_snapshot) => {
          // When tax payments change, refresh all dashboard data
          loadDashboardData();
        },
        (error) => {
          console.error("Error in tax payments listener:", error);
        }
      );

      // Set up real-time listeners for admin settlements
      const settlementsQuery = query(
        collection(db, "adminSettlements"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      unsubscribeSettlements = onSnapshot(
        settlementsQuery,
        (_snapshot) => {
          // When settlements change, refresh all dashboard data
          loadDashboardData();
        },
        (error) => {
          console.error("Error in settlements listener:", error);
        }
      );
    } catch (err) {
      console.error("Error setting up government dashboard listeners:", err);
    }

    return () => {
      try {
        if (unsubscribeTaxPayments) {
          unsubscribeTaxPayments();
        }
        if (unsubscribeSettlements) {
          unsubscribeSettlements();
        }
      } catch (err) {
        console.error(
          "Error unsubscribing from government dashboard listeners:",
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
    refreshData,
  };

  return (
    <GovernmentDashboardContext.Provider value={value}>
      {children}
    </GovernmentDashboardContext.Provider>
  );
};

export const useGovernmentDashboard = () => {
  const context = useContext(GovernmentDashboardContext);
  if (context === undefined) {
    throw new Error(
      "useGovernmentDashboard must be used within a GovernmentDashboardProvider"
    );
  }
  return context;
};
