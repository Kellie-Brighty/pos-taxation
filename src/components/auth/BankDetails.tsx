import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { authService, BankRegistrationData } from "../../services/auth.service";

interface BankDetailsInfo {
  bankName: string;
  registrationNumber: string;
  headOfficeAddress: string;
  numAgents?: number;
}

const BankDetails: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<BankDetailsInfo>({
    bankName: "",
    registrationNumber: "",
    headOfficeAddress: "",
    numAgents: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if basic info exists
    const basicInfo = localStorage.getItem("bankBasicInfo");
    if (!basicInfo) {
      showToast("Please complete the basic information first", "error");
      navigate("/register/bank/new");
    }
  }, [navigate, showToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "numAgents" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const basicInfo = JSON.parse(
        localStorage.getItem("bankBasicInfo") || "{}"
      );

      const registrationData: BankRegistrationData = {
        ...basicInfo,
        ...formData,
        userType: "bank",
      };

      const response = await authService.registerBank(registrationData);

      if (response.success) {
        // Store email for verification
        localStorage.setItem("registrationEmail", basicInfo.email);
        localStorage.setItem("pendingUserId", response.data?.userId || "");

        // Clean up basic info
        localStorage.removeItem("bankBasicInfo");

        showToast(response.message, "success");
        navigate("/register/bank/verification");
      } else {
        showToast(response.message, "error");
      }
    } catch (error: any) {
      showToast(
        error.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
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
                  to="/register/bank/new"
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <h1 className="text-[28px] font-bold text-[#4400B8]">
                    Register Your Bank
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Enter your bank's details to ensure smooth POS agent tax
                    remittance.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="bankName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bank Name
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="e.g First Bank PLC"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="registrationNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bank Registration Number
                    </label>
                    <input
                      type="text"
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="123456789023234"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="headOfficeAddress"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Head Office Address
                    </label>
                    <textarea
                      id="headOfficeAddress"
                      value={formData.headOfficeAddress}
                      onChange={handleChange}
                      placeholder="24, Awolowo Road, Ibadan"
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of POS Agents Managed
                      <span className="text-gray-500 ml-1">
                        (Optional, but recommended)
                      </span>
                    </label>
                    <input
                      type="number"
                      id="numAgents"
                      value={formData.numAgents || ""}
                      onChange={handleChange}
                      placeholder="72"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
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
                        Processing...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </form>
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
    </div>
  );
};

export default BankDetails;
