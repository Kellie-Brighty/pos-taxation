import React from "react";
import { Link, useNavigate } from "react-router-dom";

const POSBusinessInfo: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/register/pos/business/verification");
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
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-[28px] font-bold text-[#4400B8]">
                  Set Up Your POS Business
                </h1>
                <p className="text-gray-600 text-sm">
                  Provide information about your POS business to ensure smooth
                  tax processing.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    placeholder="e.g Johns POS Service"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Number{" "}
                    <span className="text-gray-500 font-normal">
                      (If available)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="registrationNumber"
                    placeholder="12345678902234"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="businessAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Address
                  </label>
                  <input
                    type="text"
                    id="businessAddress"
                    placeholder="25, Awolowo, Ibadan"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                  />
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base mt-2"
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

export default POSBusinessInfo;
