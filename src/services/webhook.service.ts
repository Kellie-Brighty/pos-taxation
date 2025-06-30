/**
 * Webhook Service for Terra Switching Integration
 *
 * This service handles incoming webhook events from Terra Switching:
 * - Webhook signature verification for security
 * - Event processing and database updates
 * - Error handling and logging
 * - Real-time status updates
 *
 * @author Your Development Team
 * @version 1.0.0
 */

import { terraswitchService } from "./terraswitch.service";

import {
  TerraWebhookEvent,
  PaymentVerificationResponse,
  TransferResponse,
  TERRASWITCH_CONFIG,
} from "../config/terraswitch.config";

import {
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

// =============================================
// WEBHOOK EVENT TYPES
// =============================================

/**
 * Webhook processing result interface
 */
export interface WebhookProcessingResult {
  success: boolean;
  message: string;
  eventType: string;
  processedAt: Date;
  error?: string;
}

/**
 * Webhook verification result interface
 */
export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
}

// =============================================
// WEBHOOK SERVICE CLASS
// =============================================

/**
 * Main Webhook Service Class
 * Handles all incoming Terra Switching webhook events
 */
export class WebhookService {
  /**
   * Process incoming webhook from Terra Switching
   *
   * @param payload - Raw webhook payload string
   * @param signature - Webhook signature for verification
   * @param headers - Request headers
   * @returns Processing result
   */
  async processWebhook(
    payload: string,
    signature: string,
    headers: Record<string, string>
  ): Promise<WebhookProcessingResult> {
    try {
      console.log("[Webhook Service] Processing webhook event...");

      // 1. Verify webhook signature
      const verification = this.verifyWebhookSignature(payload, signature);
      if (!verification.isValid) {
        console.error(
          "[Webhook Service] Webhook verification failed:",
          verification.error
        );
        return {
          success: false,
          message: "Webhook verification failed",
          eventType: "unknown",
          processedAt: new Date(),
          error: verification.error,
        };
      }

      // 2. Parse webhook payload
      let webhookEvent: TerraWebhookEvent;
      try {
        webhookEvent = JSON.parse(payload);
      } catch (error) {
        console.error(
          "[Webhook Service] Failed to parse webhook payload:",
          error
        );
        return {
          success: false,
          message: "Invalid webhook payload format",
          eventType: "unknown",
          processedAt: new Date(),
          error: "Invalid JSON payload",
        };
      }

      // 3. Log webhook event
      await this.logWebhookEvent(webhookEvent, headers);

      // 4. Process the event based on type
      const result = await this.processWebhookEvent(webhookEvent);

      console.log("[Webhook Service] Webhook processed successfully:", result);
      return result;
    } catch (error) {
      console.error("[Webhook Service] Webhook processing failed:", error);

      return {
        success: false,
        message: "Internal webhook processing error",
        eventType: "unknown",
        processedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify webhook signature to ensure it's from Terra Switching
   */
  private verifyWebhookSignature(
    payload: string,
    signature: string
  ): WebhookVerificationResult {
    try {
      // Extract signature from header (usually in format "sha512=...")
      const expectedSignature = signature.replace("sha512=", "");

      // Use the Terra Switching service's verification method
      const isValid = terraswitchService.verifyWebhookSignature(
        payload,
        expectedSignature
      );

      return {
        isValid,
        error: isValid ? undefined : "Signature verification failed",
      };
    } catch (error) {
      console.error("[Webhook Service] Signature verification error:", error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Verification error",
      };
    }
  }

  /**
   * Process webhook event based on event type
   */
  private async processWebhookEvent(
    event: TerraWebhookEvent
  ): Promise<WebhookProcessingResult> {
    const processedAt = new Date();

    try {
      switch (event.event) {
        case "charge.success":
          await this.handleSuccessfulPayment(
            event.data as PaymentVerificationResponse["data"]
          );
          return {
            success: true,
            message: "Payment success event processed",
            eventType: event.event,
            processedAt,
          };

        case "charge.failed":
          await this.handleFailedPayment(
            event.data as PaymentVerificationResponse["data"]
          );
          return {
            success: true,
            message: "Payment failure event processed",
            eventType: event.event,
            processedAt,
          };

        case "transfer.success":
          await this.handleSuccessfulTransfer(
            event.data as TransferResponse["data"]
          );
          return {
            success: true,
            message: "Transfer success event processed",
            eventType: event.event,
            processedAt,
          };

        case "transfer.failed":
          await this.handleFailedTransfer(
            event.data as TransferResponse["data"]
          );
          return {
            success: true,
            message: "Transfer failure event processed",
            eventType: event.event,
            processedAt,
          };

        default:
          console.warn("[Webhook Service] Unknown event type:", event.event);
          return {
            success: false,
            message: `Unknown event type: ${event.event}`,
            eventType: event.event,
            processedAt,
            error: "Unsupported event type",
          };
      }
    } catch (error) {
      console.error(
        `[Webhook Service] Failed to process ${event.event} event:`,
        error
      );
      return {
        success: false,
        message: `Failed to process ${event.event} event`,
        eventType: event.event,
        processedAt,
        error: error instanceof Error ? error.message : "Processing error",
      };
    }
  }

  /**
   * Handle successful payment webhook
   */
  private async handleSuccessfulPayment(
    paymentData: PaymentVerificationResponse["data"]
  ): Promise<void> {
    try {
      const invoiceId = paymentData.metadata.invoiceId;
      const amount = paymentData.amount / 100; // Convert from kobo to naira

      console.log("[Webhook Service] Processing successful payment:", {
        invoiceId,
        amount,
        reference: paymentData.reference,
      });

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
      await terraswitchService.initiateGovernmentSettlement({
        originalTransactionRef: paymentData.reference,
        amount: amount,
        invoiceId: invoiceId,
        bankId: paymentData.metadata.bankId,
        bankName: paymentData.metadata.bankName,
      });

      console.log("[Webhook Service] Successfully processed payment webhook");
    } catch (error) {
      console.error(
        "[Webhook Service] Failed to handle successful payment:",
        error
      );
      throw error;
    }
  }

  /**
   * Handle failed payment webhook
   */
  private async handleFailedPayment(
    paymentData: PaymentVerificationResponse["data"]
  ): Promise<void> {
    try {
      const invoiceId = paymentData.metadata.invoiceId;

      console.log("[Webhook Service] Processing failed payment:", {
        invoiceId,
        reference: paymentData.reference,
        reason: paymentData.gateway_response,
      });

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
            failureReason: paymentData.gateway_response,
            updatedAt: serverTimestamp(),
          }
        );
      }

      console.log(
        "[Webhook Service] Successfully processed failed payment webhook"
      );
    } catch (error) {
      console.error(
        "[Webhook Service] Failed to handle failed payment:",
        error
      );
      throw error;
    }
  }

  /**
   * Handle successful transfer webhook
   */
  private async handleSuccessfulTransfer(
    transferData: TransferResponse["data"]
  ): Promise<void> {
    try {
      console.log("[Webhook Service] Processing successful transfer:", {
        transferId: transferData.id,
        amount: transferData.amount / 100,
        reference: transferData.reference,
      });

      // Find and update settlement record
      const settlementsQuery = query(
        collection(db, "settlements"),
        where("settlementRef", "==", transferData.reference)
      );

      const settlementSnap = await getDocs(settlementsQuery);

      if (!settlementSnap.empty) {
        const settlementDoc = settlementSnap.docs[0];
        await updateDoc(settlementDoc.ref, {
          status: "success",
          terraTransferData: transferData,
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log(
          "[Webhook Service] Settlement record updated:",
          settlementDoc.id
        );
      } else {
        console.warn(
          "[Webhook Service] Settlement record not found for reference:",
          transferData.reference
        );
      }
    } catch (error) {
      console.error(
        "[Webhook Service] Failed to handle successful transfer:",
        error
      );
      throw error;
    }
  }

  /**
   * Handle failed transfer webhook
   */
  private async handleFailedTransfer(
    transferData: TransferResponse["data"]
  ): Promise<void> {
    try {
      console.log("[Webhook Service] Processing failed transfer:", {
        transferId: transferData.id,
        amount: transferData.amount / 100,
        reference: transferData.reference,
      });

      // Find and update settlement record
      const settlementsQuery = query(
        collection(db, "settlements"),
        where("settlementRef", "==", transferData.reference)
      );

      const settlementSnap = await getDocs(settlementsQuery);

      if (!settlementSnap.empty) {
        const settlementDoc = settlementSnap.docs[0];
        await updateDoc(settlementDoc.ref, {
          status: "failed",
          terraTransferData: transferData,
          error:
            "Transfer failed - check Terra Switching dashboard for details",
          updatedAt: serverTimestamp(),
        });

        console.log(
          "[Webhook Service] Failed settlement record updated:",
          settlementDoc.id
        );
      } else {
        console.warn(
          "[Webhook Service] Settlement record not found for reference:",
          transferData.reference
        );
      }

      // TODO: Send alert to administrators about failed settlement
    } catch (error) {
      console.error(
        "[Webhook Service] Failed to handle failed transfer:",
        error
      );
      throw error;
    }
  }

  /**
   * Log webhook event for audit purposes
   */
  private async logWebhookEvent(
    event: TerraWebhookEvent,
    headers: Record<string, string>
  ): Promise<void> {
    try {
      await addDoc(collection(db, "webhookLogs"), {
        eventType: event.event,
        eventData: event.data,
        headers: headers,
        receivedAt: serverTimestamp(),
        environment: TERRASWITCH_CONFIG.environment,
      });
    } catch (error) {
      console.error("[Webhook Service] Failed to log webhook event:", error);
      // Don't throw here - logging failure shouldn't break webhook processing
    }
  }

  /**
   * Get webhook processing statistics
   */
  async getWebhookStats(_dateRange?: { from: Date; to: Date }) {
    try {
      // This would typically query webhook logs for statistics
      // Implementation depends on your specific needs
      console.log("[Webhook Service] Getting webhook statistics...");

      // TODO: Implement webhook statistics
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        eventTypes: {},
      };
    } catch (error) {
      console.error("[Webhook Service] Failed to get webhook stats:", error);
      throw error;
    }
  }
}

// =============================================
// SERVICE INSTANCE
// =============================================

/**
 * Singleton instance of the Webhook Service
 * Use this throughout your application for webhook processing
 */
export const webhookService = new WebhookService();
