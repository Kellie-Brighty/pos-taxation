import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { authService } from "../../services/auth.service";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.requestLoginOTP({ email });
      if (response.success) {
        localStorage.setItem("loginEmail", email);
        navigate("/verify-otp");
        showToast(response.message, "success");
      } else {
        showToast(response.message, "error");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to send login code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="min-h-screen overflow-y-auto">
        <div className="p-8 lg:p-12 xl:p-16">
          <div className="max-w-[440px] mx-auto">
            <div className="space-y-16">
              <p
                className="text-[#4400B8] text-sm"
                onClick={() => navigate("/")}
              >
                POS Taxation
              </p>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h1 className="text-[28px] font-bold text-[#4400B8]">
                    Login
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Enter your email to receive a login code.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
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
                        Sending Code...
                      </>
                    ) : (
                      "Send Login Code"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block bg-[#4400B8] fixed top-0 right-0 w-1/2 h-screen">
        <div className="h-full flex items-center p-8 lg:p-12 xl:p-16">
          <div className="max-w-[480px] space-y-6">
            <h2 className="text-[48px] leading-tight font-bold text-white">
              Welcome Back to POS Taxation
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              Login to manage your tax compliance and reporting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
