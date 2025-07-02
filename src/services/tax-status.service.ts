import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";

export interface TaxStatusResult {
  success: boolean;
  message: string;
  data?: {
    agentName: string;
    phoneNumber: string;
    tin: string;
    businessName: string;
    bankName: string;
    bankId: string;
    status: "compliant" | "defaulting";
    period: string;
    amountPaid?: number;
    dueDate?: string;
    defaultAmount?: number;
    submissionDate?: string;
    lastSubmissionStatus?: string;
  };
}

export const taxStatusService = {
  /**
   * Check tax status for a POS agent using their phone number or TIN
   * @param identifier - Phone number or TIN
   * @param period - Tax period in YYYY-MM format
   * @returns Promise<TaxStatusResult>
   */
  async checkStatus(
    identifier: string,
    period: string
  ): Promise<TaxStatusResult> {
    try {
      const [yearStr, monthStr] = period.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;

      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return {
          success: false,
          message: "Invalid period format. Please use YYYY-MM format.",
        };
      }

      // Find POS agent by phone number, TIN, or email
      let agentQuery = query(
        collection(db, "posAgents"),
        where("phoneNumber", "==", identifier)
      );

      let agentSnapshot = await getDocs(agentQuery);

      // If not found by phone, try by TIN
      if (agentSnapshot.empty) {
        agentQuery = query(
          collection(db, "posAgents"),
          where("tin", "==", identifier)
        );
        agentSnapshot = await getDocs(agentQuery);
      }

      // If still not found, try by email
      if (agentSnapshot.empty) {
        agentQuery = query(
          collection(db, "posAgents"),
          where("email", "==", identifier)
        );
        agentSnapshot = await getDocs(agentQuery);
      }

      if (agentSnapshot.empty) {
        return {
          success: false,
          message: "No POS agent found with the provided identifier.",
        };
      }

      const agentDoc = agentSnapshot.docs[0];
      const agentData = agentDoc.data();
      const bankId = agentData.bankId;

      if (!bankId) {
        return {
          success: false,
          message: "POS agent is not associated with any bank.",
        };
      }

      // Get bank information
      const bankQuery = query(
        collection(db, "users"),
        where("uid", "==", bankId),
        where("role", "==", "bank")
      );

      const bankSnapshot = await getDocs(bankQuery);

      if (bankSnapshot.empty) {
        return {
          success: false,
          message: "Associated bank not found.",
        };
      }

      const bankData = bankSnapshot.docs[0].data();
      const bankName =
        bankData.businessName || bankData.displayName || "Unknown Bank";

      // Check bank's submissions for the period
      const submissionQuery = query(
        collection(db, "taxReports"),
        where("bankId", "==", bankId),
        orderBy("submittedAt", "desc")
      );

      const submissionSnapshot = await getDocs(submissionQuery);

      // Filter submissions by the specified period
      const periodSubmissions = submissionSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const submittedAt = data.submittedAt?.toDate();

        if (!submittedAt) return false;

        return (
          submittedAt.getMonth() === month && submittedAt.getFullYear() === year
        );
      });

      console.log(
        `Found ${periodSubmissions.length} submissions for ${
          month + 1
        }/${year} for bank ${bankName}`
      );

      // Check for approved submissions first
      const approvedSubmission = periodSubmissions.find(
        (doc) => doc.data().status === "approved"
      );

      // Check for any submissions (including pending ones)
      const anySubmission =
        periodSubmissions.length > 0 ? periodSubmissions[0] : null;

      let amountPaid = 0;
      let paymentStatus = "defaulting";
      let submissionDate = "";
      let lastSubmissionStatus = "none";

      if (approvedSubmission) {
        const reportData = approvedSubmission.data();
        lastSubmissionStatus = reportData.status;
        submissionDate =
          reportData.submittedAt?.toDate().toLocaleDateString() || "";

        console.log(`Found approved submission: ${approvedSubmission.id}`);

        // For approved submissions, default to compliant status
        paymentStatus = "compliant";

        // Try to get invoice details for amount information
        const invoiceQuery = query(
          collection(db, "invoices"),
          where("taxReportId", "==", approvedSubmission.id)
        );

        const invoiceSnapshot = await getDocs(invoiceQuery);

        if (!invoiceSnapshot.empty) {
          const invoiceData = invoiceSnapshot.docs[0].data();
          amountPaid = invoiceData.taxAmount || invoiceData.paidAmount || 0;

          console.log(
            `Found invoice with amount: ₦${amountPaid}, status: ${invoiceData.paymentStatus}`
          );

          // Only mark as defaulting if explicitly marked as failed and no amount paid
          if (
            invoiceData.paymentStatus === "failed" &&
            (!invoiceData.paidAmount || invoiceData.paidAmount <= 0)
          ) {
            paymentStatus = "defaulting";
            amountPaid = 0;
          }
        } else {
          // No invoice found, but submission is approved - still compliant
          console.log(
            "No invoice found but submission is approved - marking as compliant"
          );
          amountPaid = reportData.taxAmount || 5000; // Default amount if not found
        }
      } else if (anySubmission) {
        // Check if there's any submission (even if not approved yet)
        const reportData = anySubmission.data();
        lastSubmissionStatus = reportData.status || "pending";
        submissionDate =
          reportData.submittedAt?.toDate().toLocaleDateString() || "";

        console.log(`Found submission with status: ${lastSubmissionStatus}`);

        // If submission exists but not yet approved, check its status
        if (lastSubmissionStatus === "pending") {
          paymentStatus = "compliant"; // Pending submissions are considered compliant (payment being processed)
          amountPaid = reportData.taxAmount || 0;
        }
      } else {
        console.log("No submissions found for this period");
      }

      const dueDate = new Date(year, month + 2, 0);
      const dueDateString = dueDate.toLocaleDateString();
      const defaultAmount =
        paymentStatus === "defaulting"
          ? Math.floor(Math.random() * 5000) + 2000
          : 0;

      const periodString = new Date(year, month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      // Log final result for debugging
      console.log(
        `Final tax status for ${agentData.fullName}: ${paymentStatus}, Amount: ₦${amountPaid}, Status: ${lastSubmissionStatus}`
      );

      return {
        success: true,
        message: "Tax status retrieved successfully",
        data: {
          agentName: agentData.fullName || agentData.businessName,
          phoneNumber: agentData.phoneNumber,
          tin: agentData.tin || agentData.email || "N/A",
          businessName: agentData.businessName,
          bankName: bankName,
          bankId: bankId,
          status: paymentStatus as "compliant" | "defaulting",
          period: periodString,
          amountPaid: paymentStatus === "compliant" ? amountPaid : undefined,
          dueDate: paymentStatus === "defaulting" ? dueDateString : undefined,
          defaultAmount:
            paymentStatus === "defaulting" ? defaultAmount : undefined,
          submissionDate: submissionDate,
          lastSubmissionStatus: lastSubmissionStatus,
        },
      };
    } catch (error) {
      console.error("Error checking tax status:", error);
      return {
        success: false,
        message: "Failed to check tax status. Please try again later.",
      };
    }
  },
};
