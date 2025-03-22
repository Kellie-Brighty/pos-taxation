import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../common/Toast";
import { authService, RegistrationData } from "../../services/auth.service";

interface BusinessInfo {
  businessName: string;
  registrationNumber: string;
  businessAddress: string;
}

const POSBusinessInfo: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessInfo>({
    businessName: "",
    registrationNumber: "",
    businessAddress: "",
  });

  useEffect(() => {
    // Check if basic info exists
    const basicInfo = localStorage.getItem("pos_basic_info");
    if (!basicInfo) {
      showToast("Please complete your basic information first", "error");
      navigate("/register/pos");
    }
  }, [navigate, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const basicInfo = JSON.parse(
        localStorage.getItem("pos_basic_info") || "{}"
      );

      const registrationData: RegistrationData = {
        ...basicInfo,
        ...formData,
        userType: "pos_agent",
      };

      const response = await authService.register(registrationData);

      if (response.success) {
        showToast(response.message, "success");
        // Store email for OTP verification
        localStorage.setItem("registrationEmail", basicInfo.email);
        // Store userId for verification
        if (response.data?.userId) {
          localStorage.setItem("pendingUserId", response.data.userId);
        }
        // Clean up basic info
        localStorage.removeItem("pos_basic_info");
        navigate("/register/pos/business/verification");
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
                  to="/register/pos"
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
                    Business Information
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Tell us about your POS business
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors"
                      placeholder="Enter your registration number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <input
                      type="text"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors"
                      placeholder="Enter your business address"
                    />
                  </div>
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

export default POSBusinessInfo;
