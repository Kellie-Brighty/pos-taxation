import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { authService } from "../../services/auth.service";

interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    token: string;
    user: {
      id: string;
      email: string;
      userType: string;
    };
  };
}

const BankVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const email = localStorage.getItem("registrationEmail");
    const userId = localStorage.getItem("pendingUserId");
    if (!email || !userId) {
      showToast("Session expired. Please register again.", "error");
      navigate("/register");
    }
  }, [navigate, showToast]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits are filled, proceed with verification
    if (index === 5 && value) {
      const otpValue = [...newOtp.slice(0, 5), value].join("");
      handleVerification(otpValue);
    }
  };

  const handleVerification = async (otpValue: string) => {
    setIsLoading(true);
    const email = localStorage.getItem("registrationEmail");
    const userId = localStorage.getItem("pendingUserId");

    if (!email || !userId) {
      showToast("Session expired. Please register again.", "error");
      navigate("/register");
      return;
    }

    try {
      const response = (await authService.verifyOTP({
        email,
        otp: otpValue,
      })) as RegistrationResponse;

      if (response.success) {
        showToast(response.message, "success");
        setShowSuccessModal(true);
        // Clean up storage
        localStorage.removeItem("registrationEmail");
        localStorage.removeItem("pendingUserId");
        // Store auth token if provided
        if (response.data?.token) {
          localStorage.setItem("bank_auth_token", response.data.token);
          localStorage.setItem("bank_user", JSON.stringify(response.data.user));
        }
      } else {
        showToast(response.message, "error");
        // Reset OTP fields on error
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      showToast(
        error.message || "Verification failed. Please try again.",
        "error"
      );
      // Reset OTP fields on error
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const email = localStorage.getItem("registrationEmail");
    if (!email) {
      showToast("Session expired. Please register again.", "error");
      navigate("/register");
      return;
    }

    try {
      const response = await authService.resendOTP({ email });
      showToast(response.message, "info");
    } catch (error: any) {
      showToast(
        error.message || "Failed to resend code. Please try again.",
        "error"
      );
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section - Scrollable */}
      <div className="min-h-screen overflow-y-auto">
        <div className="p-8 lg:p-12 xl:p-16">
          <div className="max-w-[440px] mx-auto">
            {/* Back Link and Brand */}
            <div className="space-y-16">
              <div className="space-y-8">
                <p className="text-[#4400B8] text-sm">POS Taxation</p>
                <Link
                  to="/register/details"
                  className="text-[#4400B8] text-sm flex items-center gap-2"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 4.293a1 1 0 0 1 0 1.414L6.414 9H17a1 1 0 1 1 0 2H6.414l3.293 3.293a1 1 0 0 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0z"
                    />
                  </svg>
                  Back
                </Link>
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h1 className="text-[28px] font-bold text-[#4400B8]">
                    Verify Your Email
                  </h1>
                  <p className="text-gray-600 text-sm">
                    We've sent a 6-digit verification code to your registered
                    email. Enter it below to continue.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Enter OTP
                    </label>
                    <div className="flex gap-3">
                      {Array(6)
                        .fill(null)
                        .map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={otp[index]}
                            onChange={(e) =>
                              handleChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(ref) => {
                              inputRefs.current[index] = ref;
                            }}
                            disabled={isLoading}
                            className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      Didn't receive a code?
                    </p>
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-[#4400B8] font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    onClick={() => handleVerification(otp.join(""))}
                    disabled={isLoading || otp.some((digit) => !digit)}
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
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                </div>
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
              Register Your Bank for POS Tax Automation
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              Ensure seamless tax deductions for your POS agents. Sign up today
              to simplify compliance and financial management.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#4400B8]">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600">
                Your email has been verified. You can now access your dashboard
                to manage your bank's POS tax compliance.
              </p>
            </div>
            <button
              onClick={() => navigate("/bank/dashboard")}
              className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="transform rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 4.293a1 1 0 0 1 0 1.414L6.414 9H17a1 1 0 1 1 0 2H6.414l3.293 3.293a1 1 0 0 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankVerification;
