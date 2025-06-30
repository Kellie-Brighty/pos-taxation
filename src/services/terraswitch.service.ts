/**
 * Terra Switching API Service
 *
 * This service handles all interactions with the Terra Switching API including:
 * - Payment initialization and verification
 * - Transfer/settlement processing
 * - Webhook signature verification
 * - Error handling and retry logic
 *
 * @author Your Development Team
 * @version 1.0.0
 */

import {
  TERRASWITCH_CONFIG,
  TERRASWITCH_ENDPOINTS,
  InitializeTransactionRequest,
  InitializeTransactionResponse,
  PaymentVerificationResponse,
  TransferRequest,
  TransferResponse,
  TerraWebhookEvent,
  TerraApiError,
  generateTransactionReference,
  formatAmountForTerra,
  formatAmountFromTerra,
  validateTerraConfig,
} from "../config/terraswitch.config";

import {
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Main Terra Switching Service Class
 * Handles all Terra Switching API operations with proper error handling
 */
export class TerraswitchService {
  private baseURL: string;
  private secretKey: string;
  private publicKey: string;

  constructor() {
    // Validate configuration on initialization
    const validation = validateTerraConfig();
    if (!validation.isValid) {
      throw new TerraApiError(
        `Terra Switching configuration invalid: ${validation.errors.join(
          ", "
        )}`,
        "CONFIG_ERROR"
      );
    }

    // Log warnings if any (e.g., missing webhook secret)
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn(
        "[TerraSwitch] Configuration warnings:",
        validation.warnings
      );
    }

    this.baseURL = TERRASWITCH_CONFIG.baseURL;
    this.secretKey = TERRASWITCH_CONFIG.secretKey!;
    this.publicKey = TERRASWITCH_CONFIG.publicKey!;
  }

  /**
   * Creates headers for Terra Switching API requests
   */
  private getHeaders(useSecretKey: boolean = true): Record<string, string> {
    return {
      Authorization: `Bearer ${useSecretKey ? this.secretKey : this.publicKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      lg: "en", // Language header required by Terra Switching
      ch: "web", // Channel header required by Terra Switching
      "Cache-Control": "no-cache",
    };
  }

  /**
   * Makes HTTP requests to Terra Switching API with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    useSecretKey: boolean = true
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = this.getHeaders(useSecretKey);

      console.log(`[TerraSwitch] ${method} ${url}`);
      console.log(`[TerraSwitch] Headers:`, headers);
      console.log(`[TerraSwitch] Body:`, body);

      const response = await fetch(url, {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      });

      console.log(`[TerraSwitch] Response Status:`, response.status);
      console.log(
        `[TerraSwitch] Response Headers:`,
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is ok first
      if (!response.ok) {
        console.error(
          `[TerraSwitch] HTTP Error: ${response.status} ${response.statusText}`
        );

        // Try to get error response body
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }

        console.error(`[TerraSwitch] Error Response:`, errorData);

        // Extract meaningful error message from Terra Switching response
        let errorMessage = "Payment processing failed";

        if (errorData && typeof errorData === "object") {
          // Handle Terra Switching error format
          if (
            errorData.errors &&
            Array.isArray(errorData.errors) &&
            errorData.errors.length > 0
          ) {
            // Extract first error message from errors array
            errorMessage = errorData.errors[0];
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }

        // Add HTTP status context if it's not already in the message
        if (
          !errorMessage.toLowerCase().includes("error") &&
          !errorMessage.toLowerCase().includes("failed")
        ) {
          errorMessage = `${errorMessage} (HTTP ${response.status})`;
        }

        throw new TerraApiError(
          errorMessage,
          errorData?.code || `HTTP_${response.status}`,
          errorData?.field,
          errorData
        );
      }

      const responseData = await response.json();
      console.log(`[TerraSwitch] Success Response:`, responseData);

      // Check if Terra Switching returned an error in the response body
      if (responseData.error === true || responseData.status === false) {
        let errorMessage = "Terra Switching operation failed";

        // Extract error message from response
        if (
          responseData.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          errorMessage = responseData.errors[0];
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }

        throw new TerraApiError(
          errorMessage,
          "OPERATION_FAILED",
          undefined,
          responseData
        );
      }

      // For successful responses, check if error is false and status is 200
      if (
        responseData.error === true ||
        (responseData.status && responseData.status !== 200)
      ) {
        throw new TerraApiError(
          responseData.message || "Terra Switching operation failed",
          "OPERATION_FAILED",
          undefined,
          responseData
        );
      }

      return responseData as T;
    } catch (error) {
      console.error("[TerraSwitch] API Error Details:", error);

      if (error instanceof TerraApiError) {
        throw error;
      }

      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("[TerraSwitch] Network/CORS Error - Check:");
        console.error("1. API URL:", this.baseURL);
        console.error("2. Internet connection");
        console.error("3. CORS configuration");
        console.error("4. API endpoint availability");

        throw new TerraApiError(
          `Network error: Unable to connect to Terra Switching API. Check console for details.`,
          "NETWORK_ERROR",
          undefined,
          error
        );
      }

      if (error instanceof Error) {
        throw new TerraApiError(
          `Request error: ${error.message}`,
          "REQUEST_ERROR",
          undefined,
          error
        );
      }

      throw new TerraApiError(
        "Unknown error occurred",
        "UNKNOWN_ERROR",
        undefined,
        error
      );
    }
  }

  /**
   * Logs transaction activities to Firebase for audit trail
   */
  private async logTransaction(
    type:
      | "payment_initialized"
      | "payment_verified"
      | "transfer_initiated"
      | "webhook_received",
    data: any,
    invoiceId?: string,
    bankId?: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, "terraTransactionLogs"), {
        type,
        data,
        invoiceId,
        bankId,
        timestamp: serverTimestamp(),
        environment: TERRASWITCH_CONFIG.environment,
      });
    } catch (error) {
      console.error("[TerraSwitch] Failed to log transaction:", error);
      // Don't throw here - logging failure shouldn't break the main flow
    }
  }

  // =============================================
  // PAYMENT METHODS
  // =============================================

  /**
   * Initialize a payment transaction for an invoice
   * This creates a payment link that banks can use to pay their tax invoices
   */
  async initializePayment(params: {
    invoiceId: string;
    amount: number;
    email: string;
    bankId: string;
    bankName: string;
    taxReportId?: string;
    description?: string;
    callbackUrl?: string;
  }): Promise<InitializeTransactionResponse> {
    try {
      // Extract customer details from email (you might want to get these from user data)
      // const emailParts = params.email.split("@")[0];
      const firstName = params.bankName.split(" ")[0] || "Bank";
      const lastName = params.bankName.split(" ")[1] || "User";

      const requestBody: InitializeTransactionRequest = {
        type: "fixed",
        amount: params.amount, // Terra Switching expects amount in Naira, not kobo
        description:
          params.description || `Tax payment for invoice ${params.invoiceId}`,
        redirectUrl:
          params.callbackUrl ||
          `${window.location.origin}/bank/dashboard/invoices/${params.invoiceId}`,
        subaccounts: [],
        message: "Thank you for your tax payment",
        customer: {
          email: params.email,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: "08000000000", // You might want to get this from user data
          phoneCode: "+234",
        },
        metadata: [
          { key: "invoiceId", value: params.invoiceId },
          { key: "bankId", value: params.bankId },
          { key: "bankName", value: params.bankName },
          ...(params.taxReportId
            ? [{ key: "taxReportId", value: params.taxReportId }]
            : []),
        ],
      };

      const response = await this.makeRequest<InitializeTransactionResponse>(
        TERRASWITCH_ENDPOINTS.INITIALIZE_TRANSACTION,
        "POST",
        requestBody
      );

      // Log the transaction initialization
      await this.logTransaction(
        "payment_initialized",
        { request: requestBody, response },
        params.invoiceId,
        params.bankId
      );

      // Update invoice with Terra transaction reference
      await updateDoc(doc(db, "invoices", params.invoiceId), {
        terraTransactionRef: response.data.slug,
        terraAccessCode: response.data.slug,
        paymentLink: response.data.link,
        paymentStatus: "payment_link_generated",
        updatedAt: serverTimestamp(),
      });

      return response;
    } catch (error) {
      console.error("[TerraSwitch] Payment initialization failed:", error);
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   * Called after a payment is completed to confirm its status
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await this.makeRequest<PaymentVerificationResponse>(
        `${TERRASWITCH_ENDPOINTS.VERIFY_TRANSACTION}/${reference}`,
        "GET"
      );

      // Log the verification
      await this.logTransaction(
        "payment_verified",
        response,
        response.data.metadata?.invoiceId,
        response.data.metadata?.bankId
      );

      return response;
    } catch (error) {
      console.error("[TerraSwitch] Payment verification failed:", error);
      throw error;
    }
  }

  /**
   * Process successful payment
   * Updates invoice and initiates government settlement
   */
  async processSuccessfulPayment(
    paymentData: PaymentVerificationResponse["data"]
  ): Promise<void> {
    try {
      const invoiceId = paymentData.metadata.invoiceId;
      const bankId = paymentData.metadata.bankId;
      const amount = formatAmountFromTerra(
        paymentData.amount,
        paymentData.currency
      );

      // Update invoice status
      await updateDoc(doc(db, "invoices", invoiceId), {
        status: "paid",
        paymentMethod: "terraswitch",
        paymentReference: paymentData.reference,
        terraTransactionId: paymentData.id,
        paidAmount: amount,
        paidDate: serverTimestamp(),
        terraPaymentData: paymentData,
        updatedAt: serverTimestamp(),
      });

      // Update tax report status if available
      if (paymentData.metadata.taxReportId) {
        await updateDoc(
          doc(db, "taxReports", paymentData.metadata.taxReportId),
          {
            status: "paid",
            paymentReference: paymentData.reference,
            updatedAt: serverTimestamp(),
          }
        );
      }

      // Initiate government settlement
      await this.initiateGovernmentSettlement({
        originalTransactionRef: paymentData.reference,
        amount: amount,
        invoiceId: invoiceId,
        bankId: bankId,
        bankName: paymentData.metadata.bankName,
      });
    } catch (error) {
      console.error(
        "[TerraSwitch] Failed to process successful payment:",
        error
      );
      throw error;
    }
  }

  // =============================================
  // TRANSFER/SETTLEMENT METHODS
  // =============================================

  /**
   * Initiate settlement transfer to government account
   * Called after successful payment to transfer funds to government
   */
  async initiateGovernmentSettlement(params: {
    originalTransactionRef: string;
    amount: number;
    invoiceId: string;
    bankId: string;
    bankName: string;
  }): Promise<TransferResponse> {
    try {
      // Note: In a real implementation, you would need to create a transfer recipient first
      // For this example, we assume the government recipient is already set up
      const transferReference = generateTransactionReference("TAX_SETTLE");
      const formattedAmount = formatAmountForTerra(
        params.amount,
        TERRASWITCH_CONFIG.defaultCurrency
      );

      const transferRequest: TransferRequest = {
        source: "balance",
        amount: formattedAmount,
        recipient: "government_recipient_code", // This should be the actual recipient code from Terra
        reason: `Tax settlement for invoice ${params.invoiceId}`,
        currency: TERRASWITCH_CONFIG.defaultCurrency,
        reference: transferReference,
        metadata: {
          settlementType: "tax_payment",
          originalTransactionRef: params.originalTransactionRef,
          invoiceId: params.invoiceId,
          bankId: params.bankId,
          bankName: params.bankName,
        },
      };

      const response = await this.makeRequest<TransferResponse>(
        TERRASWITCH_ENDPOINTS.TRANSFERS,
        "POST",
        transferRequest
      );

      // Log the transfer
      await this.logTransaction(
        "transfer_initiated",
        { request: transferRequest, response },
        params.invoiceId,
        params.bankId
      );

      // Create settlement record in Firebase
      await addDoc(collection(db, "settlements"), {
        type: "tax_payment",
        invoiceId: params.invoiceId,
        bankId: params.bankId,
        bankName: params.bankName,
        amount: params.amount,
        originalPaymentRef: params.originalTransactionRef,
        settlementRef: transferReference,
        terraTransferId: response.data.id,
        status: response.data.status,
        createdAt: serverTimestamp(),
        terraTransferData: response.data,
      });

      return response;
    } catch (error) {
      console.error("[TerraSwitch] Government settlement failed:", error);

      // Create failed settlement record for tracking
      await addDoc(collection(db, "settlements"), {
        type: "tax_payment",
        invoiceId: params.invoiceId,
        bankId: params.bankId,
        bankName: params.bankName,
        amount: params.amount,
        originalPaymentRef: params.originalTransactionRef,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        createdAt: serverTimestamp(),
      });

      throw error;
    }
  }

  /**
   * Process successful settlement
   * Updates settlement records when transfer is completed
   */
  async processSuccessfulSettlement(
    transferData: TransferResponse["data"]
  ): Promise<void> {
    try {
      // const settlementQuery = collection(db, "settlements");
      // You would typically query for the settlement by transfer reference
      // For brevity, this is simplified

      // Update settlement status
      // In a real implementation, you'd query and update the specific settlement record
      console.log("[TerraSwitch] Settlement successful:", transferData);

      // You could also update government dashboard data here
      // or trigger notifications to relevant parties
    } catch (error) {
      console.error(
        "[TerraSwitch] Failed to process successful settlement:",
        error
      );
      throw error;
    }
  }

  // =============================================
  // WEBHOOK PROCESSING
  // =============================================

  /**
   * Verify webhook signature to ensure it's from Terra Switching
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // If no webhook secret is configured, skip verification but log warning
      if (!TERRASWITCH_CONFIG.webhookSecret) {
        console.warn(
          "[TerraSwitch] Webhook signature verification skipped - no webhook secret configured"
        );
        return true; // Allow processing but with warning
      }

      // Terra Switching webhook signature verification
      // This is a simplified version - implement actual signature verification
      // based on Terra Switching's webhook security documentation

      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha512", TERRASWITCH_CONFIG.webhookSecret)
        .update(payload)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error(
        "[TerraSwitch] Webhook signature verification failed:",
        error
      );
      return false;
    }
  }

  /**
   * Process incoming webhook events from Terra Switching
   */
  async processWebhookEvent(event: TerraWebhookEvent): Promise<void> {
    try {
      // Log webhook receipt
      await this.logTransaction("webhook_received", event);

      switch (event.event) {
        case "charge.success":
          await this.processSuccessfulPayment(
            event.data as PaymentVerificationResponse["data"]
          );
          break;

        case "charge.failed":
          await this.processFailedPayment(
            event.data as PaymentVerificationResponse["data"]
          );
          break;

        case "transfer.success":
          await this.processSuccessfulSettlement(
            event.data as TransferResponse["data"]
          );
          break;

        case "transfer.failed":
          await this.processFailedTransfer(
            event.data as TransferResponse["data"]
          );
          break;

        default:
          console.warn("[TerraSwitch] Unknown webhook event:", event.event);
      }
    } catch (error) {
      console.error("[TerraSwitch] Webhook processing failed:", error);
      throw error;
    }
  }

  /**
   * Process failed payment
   */
  private async processFailedPayment(
    paymentData: PaymentVerificationResponse["data"]
  ): Promise<void> {
    try {
      const invoiceId = paymentData.metadata.invoiceId;

      // Update invoice status
      await updateDoc(doc(db, "invoices", invoiceId), {
        paymentStatus: "failed",
        paymentReference: paymentData.reference,
        terraTransactionId: paymentData.id,
        failureReason: paymentData.gateway_response,
        terraPaymentData: paymentData,
        updatedAt: serverTimestamp(),
      });

      // Update tax report status if available
      if (paymentData.metadata.taxReportId) {
        await updateDoc(
          doc(db, "taxReports", paymentData.metadata.taxReportId),
          {
            status: "payment_failed",
            paymentReference: paymentData.reference,
            updatedAt: serverTimestamp(),
          }
        );
      }
    } catch (error) {
      console.error("[TerraSwitch] Failed to process payment failure:", error);
      throw error;
    }
  }

  /**
   * Process failed transfer
   */
  private async processFailedTransfer(
    transferData: TransferResponse["data"]
  ): Promise<void> {
    try {
      // Update settlement status to failed
      // In a real implementation, you'd query and update the specific settlement record
      console.error("[TerraSwitch] Settlement failed:", transferData);

      // You might want to create alerts or notifications here
      // for manual intervention
    } catch (error) {
      console.error("[TerraSwitch] Failed to process transfer failure:", error);
      throw error;
    }
  }

  // =============================================
  // DEBUG METHODS
  // =============================================

  /**
   * Debug method to test Terra Switching connection
   * Call this first to verify your configuration
   */
  async debugConnection(): Promise<void> {
    console.log("=== TERRA SWITCHING DEBUG ===");
    console.log("Environment:", TERRASWITCH_CONFIG.environment);
    console.log("Base URL:", this.baseURL);
    console.log("Has Secret Key:", !!this.secretKey);
    console.log("Has Public Key:", !!this.publicKey);
    console.log(
      "Secret Key Preview:",
      this.secretKey ? `${this.secretKey.substring(0, 10)}...` : "MISSING"
    );
    console.log(
      "Public Key Preview:",
      this.publicKey ? `${this.publicKey.substring(0, 10)}...` : "MISSING"
    );

    // Test a simple GET request first
    try {
      console.log("Testing connection to Terra Switching...");
      const testResponse = await fetch(this.baseURL + "/banks", {
        method: "GET",
        headers: this.getHeaders(false), // Use public key for banks endpoint
      });

      console.log("Test Response Status:", testResponse.status);
      console.log(
        "Test Response Headers:",
        Object.fromEntries(testResponse.headers.entries())
      );

      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log("✅ Connection successful!");
        console.log("Sample response:", data);
      } else {
        console.error("❌ Connection failed with status:", testResponse.status);
        const errorText = await testResponse.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(
          "This is likely a CORS issue or the API endpoint is unreachable"
        );
      }
    }
    console.log("=== END DEBUG ===");
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Get account balance from Terra Switching
   */
  async getBalance(): Promise<any> {
    try {
      return await this.makeRequest(TERRASWITCH_ENDPOINTS.BALANCE, "GET");
    } catch (error) {
      console.error("[TerraSwitch] Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Get list of supported banks
   */
  async getBanks(): Promise<any> {
    try {
      return await this.makeRequest(TERRASWITCH_ENDPOINTS.BANKS, "GET");
    } catch (error) {
      console.error("[TerraSwitch] Failed to get banks:", error);
      throw error;
    }
  }
}

// =============================================
// SERVICE INSTANCE
// =============================================

/**
 * Singleton instance of the Terra Switching service
 * Use this throughout your application for all Terra Switching operations
 */
export const terraswitchService = new TerraswitchService();
