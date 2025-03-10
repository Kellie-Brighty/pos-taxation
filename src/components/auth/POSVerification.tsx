import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const POSVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
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
    // For now, we'll just navigate to the dashboard
    setTimeout(() => {
      navigate("/dashboard");
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
      {/* Left Section */}
      <div className="p-8 lg:p-12 xl:p-16">
        <div className="max-w-[440px] mx-auto">
          {/* Back Link and Brand */}
          <div className="space-y-16">
            <div className="space-y-8">
              <p className="text-[#4400B8] text-sm">POS Taxation</p>
              <Link
                to="/register/pos/business"
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
                  Verify Your Identity
                </h1>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit verification code to your registered
                  phone number. Enter it below to continue.
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
                          onChange={(e) => handleChange(index, e.target.value)}
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

      {/* Right Section - Purple Background */}
      <div className="hidden lg:block bg-[#4400B8] p-8 lg:p-12 xl:p-16">
        <div className="h-full flex items-center">
          <div className="max-w-[480px] space-y-6">
            <h2 className="text-[48px] leading-tight font-bold text-white">
              Register Your POS Business for Tax Compliance
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              Stay compliant with tax regulations. Sign up today and manage your
              taxes with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSVerification;
