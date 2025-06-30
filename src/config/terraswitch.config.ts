/**
 * Terra Switching Configuration
 *
 * This file contains all Terra Switching related configuration including:
 * - API endpoints
 * - Environment variables
 * - Default settings
 * - TypeScript interfaces for Terra Switching API responses
 *
 * @author Northernreach Tech
 * @version 1.0.0
 */

// =============================================
// ENVIRONMENT CONFIGURATION
// =============================================

/**
 * Terra Switching environment configuration
 * Set VITE_TERRASWITCH_ENV to 'sandbox' for testing or 'live' for production
 */
export const TERRASWITCH_CONFIG = {
  // Environment settings
  environment:
    (import.meta.env.VITE_TERRASWITCH_ENV as "sandbox" | "live") || "sandbox",

  // API Configuration - Updated with correct Terra Switching URLs
  baseURL:
    import.meta.env.VITE_TERRASWITCH_ENV === "live"
      ? "https://api.terraswitching.com/v1"
      : "https://sandbox.terraswitching.com/v1",

  // API Keys (ensure these are set in your .env file)
  secretKey: import.meta.env.VITE_TERRASWITCH_SECRET_KEY,
  publicKey: import.meta.env.VITE_TERRASWITCH_PUBLIC_KEY,

  // Webhook configuration
  webhookSecret: import.meta.env.VITE_TERRASWITCH_WEBHOOK_SECRET,

  // Default currency and country
  defaultCurrency: "NGN",
  defaultCountry: "NG",

  // Government account details for settlements
  governmentAccount: {
    accountNumber: import.meta.env.VITE_GOVERNMENT_ACCOUNT_NUMBER,
    bankCode: import.meta.env.VITE_GOVERNMENT_BANK_CODE,
    accountName:
      import.meta.env.VITE_GOVERNMENT_ACCOUNT_NAME ||
      "Ondo State Government Tax Account",
  },

  // Payment configuration
  payment: {
    // Default fee bearer - who pays transaction fees
    feeBearer: "customer" as "customer" | "merchant",

    // Payment timeout in minutes
    timeoutMinutes: 30,

    // Supported payment channels
    channels: ["bank_transfer", "card", "ussd"] as const,
  },
} as const;

// =============================================
// API ENDPOINTS - Updated to match Terra Switching documentation
// =============================================

/**
 * Terra Switching API endpoints based on official documentation
 * All endpoints are relative to the base URL (/v1)
 */
export const TERRASWITCH_ENDPOINTS = {
  // Account endpoints
  ACCOUNT_DETAILS: "/corporate/account",
  ACCOUNT_BANKS: "/account/banks",
  ACCOUNT_BENEFICIARIES: "/account/beneficiaries",

  // Collections endpoints - CORRECTED
  INITIALIZE_TRANSACTION: "/corporate/initialize",
  GENERATE_ACCOUNT: "/collections/transfer/generate-account",
  CREATE_CHARGE: "/collections/charge/create",
  AUTHORIZE_CHARGE: "/collections/charge/authorize",

  // Transaction endpoints
  VERIFY_TRANSACTION: "/transactions/verify",
  LIST_TRANSACTIONS: "/transactions",

  // Payout endpoints
  BANK_TRANSFER: "/payout/bank-transfer",
  WITHDRAW_MONEY: "/payout/withdraw",
  TRANSFERS: "/payout/bank-transfer", // Alias for transfers/settlements

  // Payment Links endpoints
  PAYMENT_LINKS: "/payment-links",
  PAYMENT_LINK_DETAILS: (linkId: string) => `/payment-links/${linkId}`,

  // Invoice endpoints
  INVOICES: "/invoices",
  INVOICE_DETAILS: (invoiceId: string) => `/invoices/${invoiceId}`,

  // Resources endpoints
  BANKS: "/resources/banks",
  COUNTRIES: "/resources/countries",
  RESOLVE_ACCOUNT: "/resources/resolve-account",

  // Wallet endpoints
  WALLET_DETAILS: "/wallet/details",
  WALLET_TRANSACTIONS: "/wallet/transactions",
  BALANCE: "/wallet/details", // Alias for balance check
} as const;

// =============================================
// TYPESCRIPT INTERFACES - Updated for Terra Switching
// =============================================

/**
 * Customer interface for Terra Switching
 */
export interface TerraCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  phoneCode: string;
}

/**
 * Initialize Transaction Request Interface - Updated for Terra Switching
 */
export interface InitializeTransactionRequest {
  type: "fixed" | "variable";
  amount: number;
  description: string;
  redirectUrl?: string;
  subaccounts?: any[];
  message?: string;
  customer: TerraCustomer;
  metadata?: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Initialize Transaction Response Interface
 */
export interface InitializeTransactionResponse extends TerraBaseResponse {
  data: {
    name: string;
    slug: string;
    link: string;
    qrcode: string;
    redirectUrl: string;
    feature: string;
    type: string;
    reuseable: boolean;
    isEnabled: boolean;
    message: string;
    description: string;
    amount: number;
    currency: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    options: {
      card: boolean;
      transfer: boolean;
      bank: boolean;
      ussd: boolean;
      bankQR: boolean;
    };
    metadata: Array<{
      key: string;
      value: string;
    }>;
    reference?: string;
  };
}

/**
 * Base response interface for all Terra Switching API calls
 */
export interface TerraBaseResponse {
  status: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Payment Verification Response Interface
 * Used to verify payment status after completion
 */
export interface PaymentVerificationResponse extends TerraBaseResponse {
  data: {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      invoiceId: string;
      bankId: string;
      bankName: string;
      taxReportId?: string;
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
    fees: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    plan: any;
    order_id: string;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    transaction_date: string;
  };
}

/**
 * Transfer Request Interface
 * Used for sending settlements to government account
 */
export interface TransferRequest {
  source: "balance";
  amount: number;
  recipient: string;
  reason: string;
  currency?: string;
  reference?: string;
  metadata?: {
    settlementType: "tax_payment";
    originalTransactionRef: string;
    invoiceId: string;
    bankId: string;
    bankName: string;
  };
}

/**
 * Transfer Response Interface
 */
export interface TransferResponse extends TerraBaseResponse {
  data: {
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: number;
    status: "pending" | "success" | "failed";
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
    reference: string;
    metadata: {
      settlementType: string;
      originalTransactionRef: string;
      invoiceId: string;
      bankId: string;
      bankName: string;
    };
  };
}

/**
 * Webhook Event Interface
 * Structure of webhook events received from Terra Switching
 */
export interface TerraWebhookEvent {
  event:
    | "charge.success"
    | "charge.failed"
    | "transfer.success"
    | "transfer.failed";
  data: PaymentVerificationResponse["data"] | TransferResponse["data"];
}

/**
 * Payment Link Request Interface
 * Alternative to direct checkout - creates a shareable payment link
 */
export interface PaymentLinkRequest {
  name: string;
  description: string;
  amount: number;
  currency?: string;
  metadata?: {
    invoiceId: string;
    bankId: string;
    bankName: string;
  };
}

/**
 * Payment Link Response Interface
 */
export interface PaymentLinkResponse extends TerraBaseResponse {
  data: {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    slug: string;
    url: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    metadata: {
      invoiceId: string;
      bankId: string;
      bankName: string;
    };
  };
}

// =============================================
// ERROR INTERFACES
// =============================================

/**
 * Terra Switching API Error Interface
 */
export interface TerraError {
  message: string;
  code?: string;
  field?: string;
}

/**
 * Custom error class for Terra Switching operations
 */
export class TerraApiError extends Error {
  public code?: string;
  public field?: string;
  public originalError?: any;

  constructor(
    message: string,
    code?: string,
    field?: string,
    originalError?: any
  ) {
    super(message);
    this.name = "TerraApiError";
    this.code = code;
    this.field = field;
    this.originalError = originalError;
  }
}

// =============================================
// VALIDATION FUNCTIONS
// =============================================

/**
 * Validates Terra Switching configuration
 * Call this on app startup to ensure all required environment variables are set
 */
export const validateTerraConfig = (): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!TERRASWITCH_CONFIG.secretKey) {
    errors.push("VITE_TERRASWITCH_SECRET_KEY is required");
  }

  if (!TERRASWITCH_CONFIG.publicKey) {
    errors.push("VITE_TERRASWITCH_PUBLIC_KEY is required");
  }

  // Webhook secret is optional - only warn if missing
  if (!TERRASWITCH_CONFIG.webhookSecret) {
    warnings.push(
      "VITE_TERRASWITCH_WEBHOOK_SECRET is not set - webhook functionality will be disabled"
    );
  }

  if (!TERRASWITCH_CONFIG.governmentAccount.accountNumber) {
    errors.push("VITE_GOVERNMENT_ACCOUNT_NUMBER is required");
  }

  if (!TERRASWITCH_CONFIG.governmentAccount.bankCode) {
    errors.push("VITE_GOVERNMENT_BANK_CODE is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Generates a unique reference for transactions
 */
export const generateTransactionReference = (
  prefix: string = "TAX"
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Formats amount for Terra Switching API (converts to kobo for NGN)
 */
export const formatAmountForTerra = (
  amount: number,
  currency: string = "NGN"
): number => {
  // Terra Switching expects amounts in the smallest currency unit
  // For NGN, this means kobo (1 NGN = 100 kobo)
  if (currency === "NGN") {
    return Math.round(amount * 100);
  }
  return amount;
};

/**
 * Formats amount from Terra Switching API (converts from kobo to NGN)
 */
export const formatAmountFromTerra = (
  amount: number,
  currency: string = "NGN"
): number => {
  if (currency === "NGN") {
    return amount / 100;
  }
  return amount;
};
