export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register/agent",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    BANK_SUBMISSIONS: "/admin/bank-submissions",
    BANK_SUBMISSION_DETAILS: (id: string) => `/admin/bank-submissions/${id}`,
    APPROVE_SUBMISSION: (id: string) => `/admin/bank-submissions/${id}/approve`,
    REJECT_SUBMISSION: (id: string) => `/admin/bank-submissions/${id}/reject`,
    INVOICES: "/admin/invoices",
    INVOICE_DETAILS: (id: string) => `/admin/invoices/${id}`,
    PAYMENTS: "/admin/payments",
    REPORTS: "/admin/reports",
  },
  BANK: {
    DASHBOARD: "/bank/dashboard",
    SUBMIT_TAX_REPORT: "/bank/tax-report",
    TAX_DEDUCTIONS: "/bank/tax-deductions",
    POS_AGENTS: "/bank/pos-agents",
    ADD_POS_AGENT: "/bank/pos-agents",
  },
  POS: {
    DASHBOARD: "/pos/dashboard",
    TAX_SUMMARY: "/pos/tax-summary",
    INVOICES: "/pos/invoices",
    PROFILE: "/pos/profile",
  },
} as const;
