import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  SelectRegistrationType,
  Register,
  POSRegister,
  POSBusinessInfo,
  POSVerification,
} from "./components/auth";
import { Dashboard, DashboardLayout } from "./components/dashboard";
import { LandingPage } from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<SelectRegistrationType />} />
        <Route path="/register/bank" element={<Register />} />
        <Route path="/register/pos" element={<POSRegister />} />
        <Route path="/register/pos/business" element={<POSBusinessInfo />} />
        <Route
          path="/register/pos/business/verification"
          element={<POSVerification />}
        />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          {/* Add other dashboard routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
