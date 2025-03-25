import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/common/Toast";
import {
  // SelectRegistrationType, // No longer needed
  BankRegister,
  // POSRegister,
  // POSBusinessInfo,
  // POSVerification,
  BankDetails,
  BankVerification,
  AdminLogin,
  Login,
  OTPVerification,
} from "./components/auth";
import {
  // Dashboard,
  // DashboardLayout,
  // TaxSummary,
  InvoicesReceipts,
  Settings,
  BankDashboard,
  BankDashboardLayout,
  SubmitTaxReport,
  TaxDeductions,
  // POSAgents,
  // AddPOSAgent,
  InvoiceDetails,
  PayInvoice,
  AdminDashboard,
  AdminDashboardLayout,
  InvoiceManagement,
  PaymentsManagement,
  ReportsManagement,
  BankSubmissionsManagement,
  BankSubmissionDetails,
  POSAgents,
  AddPOSAgent,
} from "./components/dashboard";
import { LandingPage } from "./pages";

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="invoice-management" element={<InvoiceManagement />} />
            <Route
              path="bank-submissions"
              element={<BankSubmissionsManagement />}
            />
            <Route
              path="bank-submissions/:id"
              element={<BankSubmissionDetails />}
            />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Settings />} />
          </Route>

          {/* Registration Routes - Simplified for Banks Only */}
          <Route path="/register" element={<BankRegister />} />
          <Route path="/register/details" element={<BankDetails />} />
          <Route path="/register/verification" element={<BankVerification />} />

          {/* Bank Dashboard Routes */}
          <Route path="/bank/dashboard" element={<BankDashboardLayout />}>
            <Route index element={<BankDashboard />} />
            <Route path="tax-report" element={<SubmitTaxReport />} />
            <Route path="tax-deductions" element={<TaxDeductions />} />
            <Route path="invoices" element={<InvoicesReceipts />} />
            <Route path="settings" element={<Settings />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />
            <Route path="invoices/:id/pay" element={<PayInvoice />} />
            <Route path="pos-agents" element={<POSAgents />} />
            <Route path="pos-agents/add" element={<AddPOSAgent />} />

          </Route>

          {/* Removed POS Dashboard Routes */}
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
