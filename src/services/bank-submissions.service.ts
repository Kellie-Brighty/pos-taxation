import { apiService } from "./api.service";
import { API_ENDPOINTS } from "../config/api.endpoints";
import { ApiResponse, PaginatedResponse } from "../types/api.types";

export interface BankSubmission {
  id: string;
  dateSubmitted: string;
  bankName: string;
  posAgents: number;
  totalIncome: number;
  status: "pending" | "approved" | "rejected";
}

export interface BankSubmissionDetails extends BankSubmission {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  taxRate: number;
  totalTaxAmount: number;
  paymentMethod: string;
  amountPaid: number;
  datePaid: string;
  referenceNumber: string;
}

export const bankSubmissionsService = {
  // Get all bank submissions with pagination
  getSubmissions: async (page: number = 1, limit: number = 10) => {
    return apiService.get<PaginatedResponse<BankSubmission>>(
      API_ENDPOINTS.ADMIN.BANK_SUBMISSIONS,
      { page, limit }
    );
  },

  // Get single bank submission details
  getSubmissionDetails: async (id: string) => {
    return apiService.get<BankSubmissionDetails>(
      API_ENDPOINTS.ADMIN.BANK_SUBMISSION_DETAILS(id)
    );
  },

  // Approve a bank submission
  approveSubmission: async (id: string) => {
    return apiService.post<ApiResponse>(
      API_ENDPOINTS.ADMIN.APPROVE_SUBMISSION(id)
    );
  },

  // Reject a bank submission
  rejectSubmission: async (id: string, reason: string) => {
    return apiService.post<ApiResponse>(
      API_ENDPOINTS.ADMIN.REJECT_SUBMISSION(id),
      { reason }
    );
  },
};
