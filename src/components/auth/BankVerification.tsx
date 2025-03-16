import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const BankVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

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

  const handleVerification = (_otpValue: string) => {
    // Here you would typically verify the OTP with your backend
    // For now, we'll just show the success modal
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 1000);
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
                  to="/register/bank/details"
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
                    Secure Your Account
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
                            className="w-12 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors"
                          />
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      Didn't receive a code?
                    </p>
                    <button className="text-sm text-[#4400B8] font-medium hover:opacity-80 transition-opacity">
                      Resend OTP
                    </button>
                  </div>

                  <button
                    onClick={() => handleVerification(otp.join(""))}
                    className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base"
                  >
                    Continue Registration
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
              <div className="flex justify-center mb-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-[#4400B8]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#4400B8]">
                Your Bank Is Registered!
              </h2>
              <p className="text-gray-600">
                You can now manage POS agent transactions, track tax deductions,
                and ensure compliance effortlessly.
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
              >
                <path d="M10 3.333L8.825 4.508l4.175 4.175H3.333v1.634h9.667l-4.175 4.175L10 15.667l6.667-6.667L10 3.333z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankVerification;
