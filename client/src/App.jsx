import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LenderDashboard from "./pages/LenderDashboard";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import UpdateProfile from "./pages/UpdateProfile";
import LoanRequestForm from "./pages/LoanRequestForm";
import LoanBrochures from "./pages/LoanBrochures";
import CreateBrochure from "./pages/CreateBrochure";
import ContractViewer from "./pages/ContractViewer";
import ContractDetail from "./pages/ContractDetail";
import Payments from "./pages/Payments";
import PaymentStatus from "./pages/PaymentStatus";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lender-dashboard"
          element={
            <ProtectedRoute>
              <LenderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-profile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-loan"
          element={
            <ProtectedRoute>
              <LoanRequestForm />
            </ProtectedRoute>
          }
        />
        <Route path="/brochures" element={<LoanBrochures />} />
        <Route
          path="/create-brochure"
          element={
            <ProtectedRoute>
              <CreateBrochure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <ProtectedRoute>
              <ContractDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contract-viewer/:id"
          element={
            <ProtectedRoute>
              <ContractViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
