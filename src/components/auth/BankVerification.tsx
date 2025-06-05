import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { useAuth } from "../../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

const BankVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser, signIn } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate("/bank/dashboard");
      return;
    }

    // Get stored bank details
    const bankFullDetails = localStorage.getItem("bankFullDetails");
    if (!bankFullDetails) {
      showToast(
        "Registration information missing. Please start again.",
        "error"
      );
      navigate("/register");
      return;
    }

    try {
      const parsedDetails = JSON.parse(bankFullDetails);
      setEmail(parsedDetails.email || "");
    } catch (error) {
      console.error("Error parsing bank details:", error);
      showToast(
        "Registration information is invalid. Please start again.",
        "error"
      );
      navigate("/register");
    }
  }, [navigate, showToast, currentUser]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerification = async (otpValue: string) => {
    setIsLoading(true);

    if (!email) {
      showToast(
        "Email information missing. Please restart registration.",
        "error"
      );
      navigate("/register");
      return;
    }

    try {
      // Get bank details from localStorage
      const bankFullDetailsString = localStorage.getItem("bankFullDetails");
      if (!bankFullDetailsString) {
        throw new Error("Registration information missing");
      }

      const bankFullDetails = JSON.parse(bankFullDetailsString);

      // This is just for demonstration - in a real scenario, you would verify the OTP
      // against one sent via email or SMS. Here we're just checking if all 6 digits were entered.
      if (otpValue.length === 6) {
        // Sign in the user with email/password
        const password =
          bankFullDetails.password || localStorage.getItem("tempPassword");

        if (!password) {
          throw new Error("Password information missing");
        }

        await signIn(email, password);

        // At this point, currentUser should be available
        if (auth.currentUser) {
          // Update user document with additional bank details
          const userDocRef = doc(db, "users", auth.currentUser.uid);

          await setDoc(
            userDocRef,
            {
              businessName: bankFullDetails.businessName,
              registrationNumber: bankFullDetails.registrationNumber,
              businessAddress: bankFullDetails.businessAddress,
              numAgents: bankFullDetails.numAgents,
              supportingDocumentURL:
                bankFullDetails.supportingDocumentURL || null,
              emailVerified: true,
              registrationCompleted: true,
              createdAt: new Date(),
            },
            { merge: true }
          );

          // Send email verification (optional)
          await sendEmailVerification(auth.currentUser);

          // Show success and clean up localStorage
          showToast("Account verified successfully!", "success");
          setShowSuccessModal(true);

          // Clean up localStorage
          localStorage.removeItem("bankFullDetails");
          localStorage.removeItem("bankBasicInfo");
          localStorage.removeItem("tempPassword");
        }
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
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
    if (!email) {
      showToast(
        "Email information missing. Please restart registration.",
        "error"
      );
      navigate("/register");
      return;
    }

    // In a real implementation, you would call a function to resend the OTP
    // For this demo, we'll just show a success message
    showToast("Verification code resent to your email", "info");
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

  const handleCompleteRegistration = () => {
    navigate("/bank/dashboard");
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
                {!showSuccessModal ? (
                  <>
                    <div className="space-y-1">
                      <h1 className="text-[28px] font-bold text-[#4400B8]">
                        Verify Your Email
                      </h1>
                      <p className="text-gray-600 text-sm">
                        We've sent a 6-digit verification code to your
                        registered email. Enter it below to continue.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Enter Verification Code
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
                          Resend Code
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
                  </>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-100 p-3">
                        <svg
                          className="w-16 h-16 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Registration Successful!
                    </h2>
                    <p className="text-gray-600">
                      Your bank account has been successfully registered. You
                      can now access your dashboard to manage POS agents and tax
                      submissions.
                    </p>
                    <button
                      onClick={handleCompleteRegistration}
                      className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base"
                    >
                      Go to Dashboard
                    </button>
                  </div>
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
              {showSuccessModal
                ? "Welcome to POS Taxation"
                : "Final Step: Verify Your Account"}
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              {showSuccessModal
                ? "Your bank is now registered. Start managing your tax compliance and POS agents today."
                : "Verify your email to complete your registration and access your bank dashboard."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankVerification;
