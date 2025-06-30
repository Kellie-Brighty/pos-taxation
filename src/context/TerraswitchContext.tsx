/**
 * Terra Switching Context
 *
 * This context provides Terra Switching functionality throughout the React application:
 * - Payment initialization and management
 * - Settlement tracking
 * - Real-time status updates
 * - Error handling and user feedback
 *
 * @author Your Development Team
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

import {
  terraswitchService,
  TerraswitchService,
} from "../services/terraswitch.service";

import {
  InitializeTransactionResponse,
  PaymentVerificationResponse,
  TerraApiError,
} from "../config/terraswitch.config";

import { useAuth } from "./AuthContext";
import {
  // doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

// =============================================
// INTERFACES
// =============================================

/**
 * Settlement record interface for tracking government payments
 */
export interface Settlement {
  id: string;
  type: "tax_payment";
  invoiceId: string;
  bankId: string;
  bankName: string;
  amount: number;
  originalPaymentRef: string;
  settlementRef: string;
  terraTransferId?: number;
  status: "pending" | "success" | "failed";
  createdAt: any;
  terraTransferData?: any;
  error?: string;
}

/**
 * Payment status for tracking invoice payments
 */
export interface PaymentStatus {
  invoiceId: string;
  status:
    | "idle"
    | "initializing"
    | "payment_link_generated"
    | "processing"
    | "success"
    | "failed";
  paymentLink?: string;
  reference?: string;
  error?: string;
  amount?: number;
}

/**
 * Context interface defining all available Terra Switching operations
 */
interface TerraswitchContextType {
  // Payment operations
  initializePayment: (params: {
    invoiceId: string;
    amount: number;
    bankName: string;
    taxReportId?: string;
    description?: string;
  }) => Promise<InitializeTransactionResponse>;

  verifyPayment: (reference: string) => Promise<PaymentVerificationResponse>;

  // Payment status tracking
  paymentStatuses: Map<string, PaymentStatus>;
  getPaymentStatus: (invoiceId: string) => PaymentStatus | undefined;

  // Settlement tracking
  settlements: Settlement[];
  getSettlementsForBank: (bankId: string) => Settlement[];
  getTotalSettlements: () => number;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Utility methods
  clearError: () => void;
  refreshSettlements: () => Promise<void>;

  // Service instance (for advanced usage)
  service: TerraswitchService;
}

// =============================================
// CONTEXT CREATION
// =============================================

const TerraswitchContext = createContext<TerraswitchContextType | undefined>(
  undefined
);

/**
 * Terra Switching Provider Component
 * Wraps your app to provide Terra Switching functionality to all components
 */
export const TerraswitchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser, userData } = useAuth();

  // State management
  const [paymentStatuses, setPaymentStatuses] = useState<
    Map<string, PaymentStatus>
  >(new Map());
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================
  // REAL-TIME DATA SUBSCRIPTION
  // =============================================

  /**
   * Subscribe to real-time settlements data
   * Updates when new settlements are created or status changes
   */
  useEffect(() => {
    if (!currentUser) return;

    const settlementsQuery = query(
      collection(db, "settlements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      settlementsQuery,
      (snapshot) => {
        const settlementsData: Settlement[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          settlementsData.push({
            id: doc.id,
            type: data.type,
            invoiceId: data.invoiceId,
            bankId: data.bankId,
            bankName: data.bankName,
            amount: data.amount,
            originalPaymentRef: data.originalPaymentRef,
            settlementRef: data.settlementRef,
            terraTransferId: data.terraTransferId,
            status: data.status,
            createdAt: data.createdAt,
            terraTransferData: data.terraTransferData,
            error: data.error,
          });
        });

        setSettlements(settlementsData);
      },
      (error) => {
        console.error(
          "[TerraSwitch Context] Error fetching settlements:",
          error
        );
        setError("Failed to load settlement data");
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  /**
   * Subscribe to invoice updates to track payment status changes
   */
  useEffect(() => {
    if (!currentUser || userData?.role !== "bank") return;

    const invoicesQuery = query(
      collection(db, "invoices"),
      where("bankId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      invoicesQuery,
      (snapshot) => {
        const newPaymentStatuses = new Map<string, PaymentStatus>();

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.terraTransactionRef || data.paymentLink) {
            newPaymentStatuses.set(doc.id, {
              invoiceId: doc.id,
              status: data.paymentStatus || "idle",
              paymentLink: data.paymentLink,
              reference: data.terraTransactionRef,
              amount: data.taxAmount,
              error: data.failureReason,
            });
          }
        });

        setPaymentStatuses(newPaymentStatuses);
      },
      (error) => {
        console.error(
          "[TerraSwitch Context] Error fetching invoice updates:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [currentUser, userData]);

  // =============================================
  // PAYMENT OPERATIONS
  // =============================================

  /**
   * Initialize a payment for a tax invoice
   * Creates a Terra Switching payment link that banks can use to pay
   */
  const initializePayment = useCallback(
    async (params: {
      invoiceId: string;
      amount: number;
      bankName: string;
      taxReportId?: string;
      description?: string;
    }): Promise<InitializeTransactionResponse> => {
      if (!currentUser || !userData) {
        throw new TerraApiError("User not authenticated", "AUTH_ERROR");
      }

      try {
        setIsLoading(true);
        setError(null);

        // Update payment status to initializing
        setPaymentStatuses(
          (prev) =>
            new Map(
              prev.set(params.invoiceId, {
                invoiceId: params.invoiceId,
                status: "initializing",
                amount: params.amount,
              })
            )
        );

        const response = await terraswitchService.initializePayment({
          invoiceId: params.invoiceId,
          amount: params.amount,
          email: userData.email,
          bankId: currentUser.uid,
          bankName: params.bankName,
          taxReportId: params.taxReportId,
          description: params.description,
          callbackUrl: `${window.location.origin}/bank/dashboard/invoices/${params.invoiceId}/payment-callback`,
        });

        // Update payment status to payment link generated
        setPaymentStatuses(
          (prev) =>
            new Map(
              prev.set(params.invoiceId, {
                invoiceId: params.invoiceId,
                status: "payment_link_generated",
                paymentLink: response.data.link,
                reference: response.data.reference,
                amount: params.amount,
              })
            )
        );

        return response;
      } catch (error) {
        console.error(
          "[TerraSwitch Context] Payment initialization failed:",
          error
        );

        const errorMessage =
          error instanceof TerraApiError
            ? error.message
            : "Failed to initialize payment";

        setError(errorMessage);

        // Update payment status to failed
        setPaymentStatuses(
          (prev) =>
            new Map(
              prev.set(params.invoiceId, {
                invoiceId: params.invoiceId,
                status: "failed",
                amount: params.amount,
                error: errorMessage,
              })
            )
        );

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, userData]
  );

  /**
   * Verify a payment transaction
   * Called to check the status of a payment after completion
   */
  const verifyPayment = useCallback(
    async (reference: string): Promise<PaymentVerificationResponse> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await terraswitchService.verifyPayment(reference);

        // Find and update the payment status
        const invoiceId = response.data.metadata.invoiceId;
        if (invoiceId) {
          setPaymentStatuses(
            (prev) =>
              new Map(
                prev.set(invoiceId, {
                  invoiceId,
                  status:
                    response.data.status === "success" ? "success" : "failed",
                  reference: response.data.reference,
                  amount: response.data.amount / 100, // Convert from kobo to naira
                  error:
                    response.data.status !== "success"
                      ? response.data.gateway_response
                      : undefined,
                })
              )
          );
        }

        return response;
      } catch (error) {
        console.error(
          "[TerraSwitch Context] Payment verification failed:",
          error
        );

        const errorMessage =
          error instanceof TerraApiError
            ? error.message
            : "Failed to verify payment";

        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // =============================================
  // DATA ACCESS METHODS
  // =============================================

  /**
   * Get payment status for a specific invoice
   */
  const getPaymentStatus = useCallback(
    (invoiceId: string): PaymentStatus | undefined => {
      return paymentStatuses.get(invoiceId);
    },
    [paymentStatuses]
  );

  /**
   * Get settlements for a specific bank
   */
  const getSettlementsForBank = useCallback(
    (bankId: string): Settlement[] => {
      return settlements.filter((settlement) => settlement.bankId === bankId);
    },
    [settlements]
  );

  /**
   * Get total settlement amount
   */
  const getTotalSettlements = useCallback((): number => {
    return settlements
      .filter((settlement) => settlement.status === "success")
      .reduce((total, settlement) => total + settlement.amount, 0);
  }, [settlements]);

  /**
   * Refresh settlements data
   */
  const refreshSettlements = useCallback(async (): Promise<void> => {
    // Real-time subscription will automatically update the data
    // This method is kept for manual refresh if needed
    console.log(
      "[TerraSwitch Context] Settlements refreshed via real-time subscription"
    );
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =============================================
  // CONTEXT VALUE
  // =============================================

  const contextValue: TerraswitchContextType = {
    // Payment operations
    initializePayment,
    verifyPayment,

    // Payment status tracking
    paymentStatuses,
    getPaymentStatus,

    // Settlement tracking
    settlements,
    getSettlementsForBank,
    getTotalSettlements,

    // Loading and error states
    isLoading,
    error,

    // Utility methods
    clearError,
    refreshSettlements,

    // Service instance
    service: terraswitchService,
  };

  return (
    <TerraswitchContext.Provider value={contextValue}>
      {children}
    </TerraswitchContext.Provider>
  );
};

// =============================================
// HOOK
// =============================================

/**
 * Custom hook to use Terra Switching functionality
 *
 * @example
 * ```tsx
 * const { initializePayment, settlements, isLoading } = useTerraswitch();
 *
 * const handlePayInvoice = async () => {
 *   try {
 *     const response = await initializePayment({
 *       invoiceId: 'INV-123',
 *       amount: 50000,
 *       bankName: 'GTBank',
 *       description: 'Tax payment for January 2024'
 *     });
 *
 *     // Redirect user to payment link
 *     window.open(response.data.link, '_blank');
 *   } catch (error) {
 *     console.error('Payment failed:', error);
 *   }
 * };
 * ```
 */
export const useTerraswitch = (): TerraswitchContextType => {
  const context = useContext(TerraswitchContext);

  if (context === undefined) {
    throw new Error("useTerraswitch must be used within a TerraswitchProvider");
  }

  return context;
};
