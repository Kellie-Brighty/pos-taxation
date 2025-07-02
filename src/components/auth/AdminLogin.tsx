import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../common/Toast";
import { db } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, userData, currentUser, loading } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAdmins, setCheckingAdmins] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Check if admin exists when component mounts
  useEffect(() => {
    const checkIfAdminExists = async () => {
      try {
        setCheckingAdmins(true);
        const adminsQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const querySnapshot = await getDocs(adminsQuery);

        if (!querySnapshot.empty) {
          setAdminExists(true);
          setIsCreatingAdmin(false);
          // Extract admin emails
          const emails: string[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email) {
              emails.push(data.email);
            }
          });
          setAdminEmails(emails);
        } else {
          setAdminExists(false);
          setIsCreatingAdmin(true);
        }
      } catch (error) {
        console.error("Error checking for admin:", error);
        showToast("Error checking for admin accounts", "error");
      } finally {
        setCheckingAdmins(false);
      }
    };

    checkIfAdminExists();
  }, [showToast]);

  useEffect(() => {
    // Check if user is already logged in and is an admin
    if (!loading && currentUser && userData) {
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // If logged in but not admin, show error
        showToast("You don't have admin privileges", "error");
      }
    }
  }, [currentUser, userData, loading, navigate, showToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isCreatingAdmin) {
        // Creating a new admin account
        if (formData.password !== formData.confirmPassword) {
          showToast("Passwords don't match", "error");
          setIsLoading(false);
          return;
        }

        await signUp(formData.email, formData.password, "admin", {
          displayName: "System Administrator",
        });

        showToast("Admin account created successfully", "success");
        setIsCreatingAdmin(false);
        setAdminExists(true);
        setAdminEmails([formData.email]);
    } else {
        // Authenticating with Firebase
        await signIn(formData.email, formData.password);
        // Check if the authenticated user is an admin will be handled by the useEffect
      }
    } catch (error: any) {
      showToast(
        error.message ||
          (isCreatingAdmin ? "Failed to create admin" : "Login failed"),
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
            Admin Email
                      </label>
          {adminEmails.length > 0 ? (
            <select
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
              required
            >
              <option value="" disabled>
                Select your admin email
              </option>
              {adminEmails.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          ) : (
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
                        placeholder="Enter your email address"
              required
                      />
          )}
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
                        placeholder="Enter your password"
            required
                      />
                    </div>
                  </div>

      <div className="flex items-center justify-end">
                    <Link
                      to="/admin/forgot-password"
                      className="text-sm text-[#4400B8] hover:text-[#4400B8]/80"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
        disabled={isLoading || !formData.email || !formData.password}
        className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );

  const renderCreateAdminForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Admin Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
            placeholder="Enter admin email address"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
            placeholder="Create a password"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
            placeholder="Confirm your password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isLoading ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        }
        className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating Admin...
          </>
        ) : (
          "Create Admin Account"
        )}
                  </button>
                </form>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section - Scrollable */}
      <div className="min-h-screen overflow-y-auto">
        <div className="p-8 lg:p-12 xl:p-16">
          <div className="max-w-[440px] mx-auto">
            {/* Brand */}
            <div className="space-y-16">
              <div>
                <Link to="/" className="text-[#4400B8] text-sm">
                  POS Taxation
                </Link>
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h1 className="text-[28px] font-bold text-[#4400B8]">
                    Admin Portal
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {adminExists
                      ? "Sign in to access the administrative dashboard for POS tax management."
                      : "Create an admin account to manage the POS tax system."}
                  </p>
                </div>

                {checkingAdmins ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4400B8]"></div>
                  </div>
                ) : adminExists ? (
                  renderLoginForm()
                ) : (
                  renderCreateAdminForm()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Fixed */}
      <div className="hidden lg:block bg-[#4400B8] fixed top-0 right-0 w-1/2 h-screen">
        <div className="h-full flex items-center p-8 lg:p-12 xl:p-16">
          <div className="max-w-[480px] space-y-6">
            <h2 className="text-[48px] leading-tight font-bold text-white">
              POS Tax Management System
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              {adminExists
                ? "Access administrative tools to manage POS agents, monitor tax compliance, and oversee revenue collection."
                : "Create your admin account to start managing the POS tax system, monitor agents, and oversee tax compliance."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
