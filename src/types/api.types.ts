// Payment Status Types
export type PaymentStatus = "pending" | "processing" | "success" | "failed";
export type PaymentMethod = "terraswitch" | "bank_transfer";

// Investigation Status Types
export type InvestigationStatus =
  | "pending_review"
  | "under_review"
  | "approved"
  | "rejected";

// Invoice Interface
export interface Invoice {
  id: string;
  invoiceNumber: string;
  bankId: string;
  bankName: string;
  taxReportId: string;
  transactionVolume: number;
  profitBaseline: number;
  taxRate: number;
  taxAmount: number;
  issuedDate: any;
  dueDate: any;

  // Payment Related Fields
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidDate?: any;
  paymentReference?: string;
  paymentProofURL?: string;
  paidAmount?: number;
  terraTransactionId?: string;
  terraPaymentData?: any;

  // Investigation Related Fields
  investigationStatus: InvestigationStatus;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;

  // Additional Fields for Revised Reports
  previousPaymentAmount?: number;
  additionalTaxAmount?: number;

  // Metadata
  createdAt: any;
  updatedAt: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}
