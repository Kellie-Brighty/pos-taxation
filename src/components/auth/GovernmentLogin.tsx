import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../common/Toast";
import { db } from "../../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const GovernmentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, userData, currentUser, loading } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAccounts, setCheckingAccounts] = useState(true);
  const [governmentAccountExists, setGovernmentAccountExists] = useState(false);
  const [governmentEmails, setGovernmentEmails] = useState<string[]>([]);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Check if government account exists when component mounts
  useEffect(() => {
    const checkIfGovernmentAccountExists = async () => {
      try {
        setCheckingAccounts(true);
        const govAccountsQuery = query(
          collection(db, "users"),
          where("role", "==", "government")
        );
        const querySnapshot = await getDocs(govAccountsQuery);

        if (!querySnapshot.empty) {
          setGovernmentAccountExists(true);
          setIsCreatingAccount(false);
          // Extract government emails
          const emails: string[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email) {
              emails.push(data.email);
            }
          });
          setGovernmentEmails(emails);
        } else {
          setGovernmentAccountExists(false);
          setIsCreatingAccount(true);
        }
      } catch (error) {
        console.error("Error checking for government accounts:", error);
        showToast("Error checking for government accounts", "error");
      } finally {
        setCheckingAccounts(false);
      }
    };

    checkIfGovernmentAccountExists();
  }, [showToast]);

  useEffect(() => {
    // Check if user is already logged in and is a government official
    if (!loading && currentUser && userData) {
      if (userData.role === "government") {
        navigate("/government/dashboard");
      } else {
        // If logged in but not government, show error
        showToast("You don't have government portal access", "error");
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
      if (isCreatingAccount) {
        // Creating a new government account
        if (formData.password !== formData.confirmPassword) {
          showToast("Passwords don't match", "error");
          setIsLoading(false);
          return;
        }

        await signUp(formData.email, formData.password, "government", {
          displayName: "Government Tax Authority",
        });

        showToast("Government account created successfully", "success");
        setIsCreatingAccount(false);
        setGovernmentAccountExists(true);
        setGovernmentEmails([formData.email]);
      } else {
        // Authenticating with Firebase
        await signIn(formData.email, formData.password);
        // Check if the authenticated user is a government official will be handled by the useEffect
      }
    } catch (error: any) {
      showToast(
        error.message ||
          (isCreatingAccount
            ? "Failed to create government account"
            : "Login failed"),
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
            Government Email
          </label>
          {governmentEmails.length > 0 ? (
            <select
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
              required
            >
              <option value="" disabled>
                Select your government email
              </option>
              {governmentEmails.map((email) => (
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
          to="/government/forgot-password"
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

  const renderCreateAccountForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Government Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-sm"
            placeholder="Enter government email address"
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
            Creating Account...
          </>
        ) : (
          "Create Government Account"
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="bg-[#4400B8] md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-white">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Government Tax Revenue Portal
          </h1>
          <p className="text-lg mb-8">
            Access the official platform for monitoring tax revenue collection
            and settlements.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Portal Features</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  />
                </svg>
                <span>Real-time tax revenue monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  />
                </svg>
                <span>Track bank tax submissions</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  />
                </svg>
                <span>Settlement reports and reconciliation</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  />
                </svg>
                <span>Generate comprehensive tax reports</span>
              </li>
            </ul>
          </div>

          <div className="text-center text-sm opacity-75">
            Official Tax Authority Platform
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="bg-white md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {governmentAccountExists
                ? "Government Login"
                : "Create Government Account"}
            </h2>
            <p className="text-gray-600 mt-2">
              {governmentAccountExists
                ? "Access your government tax portal dashboard"
                : "Set up the government tax authority account"}
            </p>
          </div>

          {checkingAccounts ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-[#4400B8]"
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
              <p className="mt-4 text-gray-600">
                Checking government accounts...
              </p>
            </div>
          ) : governmentAccountExists ? (
            renderLoginForm()
          ) : (
            renderCreateAccountForm()
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need support? Contact system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentLogin;
