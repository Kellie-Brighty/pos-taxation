import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  SelectRegistrationType,
  BankRegister,
  POSRegister,
  POSBusinessInfo,
  POSVerification,
  BankDetails,
  BankVerification,
  AdminLogin,
} from "./components/auth";
import {
  Dashboard,
  DashboardLayout,
  TaxSummary,
  InvoicesReceipts,
  Settings,
  BankDashboard,
  BankDashboardLayout,
  SubmitTaxReport,
  TaxDeductions,
  POSAgents,
  AddPOSAgent,
  InvoiceDetails,
  PayInvoice,
  AdminDashboard,
  AdminDashboardLayout,
  InvoiceManagement,
  PaymentsManagement,
  ReportsManagement,
  BankSubmissionsManagement,
  BankSubmissionDetails,
} from "./components/dashboard";
import { LandingPage } from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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

        {/* Registration Routes */}
        <Route path="/register" element={<SelectRegistrationType />} />
        <Route path="/register/bank/new" element={<BankRegister />} />
        <Route path="/register/bank/details" element={<BankDetails />} />
        <Route
          path="/register/bank/verification"
          element={<BankVerification />}
        />
        <Route path="/register/pos" element={<POSRegister />} />
        <Route path="/register/pos/business" element={<POSBusinessInfo />} />
        <Route
          path="/register/pos/business/verification"
          element={<POSVerification />}
        />

        {/* Bank Dashboard Routes */}
        <Route path="/bank/dashboard" element={<BankDashboardLayout />}>
          <Route index element={<BankDashboard />} />
          <Route path="tax-report" element={<SubmitTaxReport />} />
          <Route path="tax-deductions" element={<TaxDeductions />} />
          <Route path="invoices" element={<InvoicesReceipts />} />
          <Route path="pos-agents" element={<POSAgents />} />
          <Route path="pos-agents/add" element={<AddPOSAgent />} />
          <Route path="settings" element={<Settings />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/:id/pay" element={<PayInvoice />} />
        </Route>

        {/* POS Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tax-summary" element={<TaxSummary />} />
          <Route path="invoices" element={<InvoicesReceipts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
