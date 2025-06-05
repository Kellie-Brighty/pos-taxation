import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
  GovernmentLogin,
  Login,
  OTPVerification,
  ProtectedRoute,
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
  GovernmentDashboard,
  GovernmentDashboardLayout,
  InvoiceManagement,
  PaymentsManagement,
  ReportsManagement,
  BankSubmissionsManagement,
  BankSubmissionDetails,
  POSAgents,
  AddPOSAgent,
} from "./components/dashboard";
import { LandingPage } from "./pages";
import { POSAgentProvider } from "./context/POSAgentContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminDashboardProvider } from "./context/AdminDashboardContext";
import { GovernmentDashboardProvider } from "./context/GovernmentDashboardContext";
import { BankTaxSubmissionProvider } from "./context/BankTaxSubmissionContext";

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <POSAgentProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/government/login" element={<GovernmentLogin />} />
              <Route path="/register" element={<BankRegister />} />

              {/* These routes should be accessible only for users in registration process */}
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/register/details" element={<BankDetails />} />
              <Route
                path="/register/verification"
                element={<BankVerification />}
              />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminDashboardProvider>
                      <AdminDashboardLayout />
                    </AdminDashboardProvider>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route
                    path="invoice-management"
                    element={<InvoiceManagement />}
                  />
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
              </Route>

              {/* Protected Government Routes */}
              <Route element={<ProtectedRoute allowedRoles={["government"]} />}>
                <Route
                  path="/government/dashboard"
                  element={
                    <GovernmentDashboardProvider>
                      <GovernmentDashboardLayout />
                    </GovernmentDashboardProvider>
                  }
                >
                  <Route index element={<GovernmentDashboard />} />
                  <Route path="tax-payments" element={<TaxDeductions />} />
                  <Route path="settlements" element={<InvoicesReceipts />} />
                  <Route path="reports" element={<ReportsManagement />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="support" element={<Settings />} />
                </Route>
              </Route>

              {/* Protected Bank Routes */}
              <Route element={<ProtectedRoute allowedRoles={["bank"]} />}>
                <Route
                  path="/bank/dashboard"
                  element={
                    <BankTaxSubmissionProvider>
                      <BankDashboardLayout />
                    </BankTaxSubmissionProvider>
                  }
                >
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
              </Route>

              {/* Protected POS Agent Routes - Add if needed */}
              <Route element={<ProtectedRoute allowedRoles={["pos_agent"]} />}>
                {/* Add POS agent routes here when needed */}
              </Route>

              {/* Fallback route for 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </POSAgentProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
