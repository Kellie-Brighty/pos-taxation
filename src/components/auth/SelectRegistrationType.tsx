import React from "react";
import { Link, useNavigate } from "react-router-dom";

const SelectRegistrationType: React.FC = () => {
  const navigate = useNavigate();

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
                to="/"
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

            {/* Selection Section */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-[28px] font-bold text-[#4400B8]">
                  Choose Registration Type
                </h1>
                <p className="text-gray-600 text-sm">
                  Select the type of registration that best suits your business.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/register/bank")}
                  className="w-full bg-white hover:bg-gray-50 text-[#4400B8] py-6 px-6 rounded-lg transition-colors text-base border-2 border-[#4400B8] flex flex-col items-start space-y-1"
                >
                  <span className="font-semibold text-lg">
                    Bank Registration
                  </span>
                  <span className="text-sm text-gray-600 text-left ">
                    Register your bank for POS tax automation and management
                  </span>
                </button>

                <button
                  onClick={() => navigate("/register/pos")}
                  className="w-full bg-white hover:bg-gray-50 text-[#4400B8] py-6 px-6 rounded-lg transition-colors text-base border-2 border-[#4400B8] flex flex-col items-start space-y-1"
                >
                  <span className="font-semibold text-lg">
                    POS Business Registration
                  </span>
                  <span className="text-sm text-gray-600 text-left ">
                    Register your POS business for tax compliance
                  </span>
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
              Choose Your Registration Path
            </h2>
            <p className="text-white/90 text-xl leading-relaxed">
              Whether you're a bank or a POS business, we've got you covered.
              Select your registration type to get started with automated tax
              management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRegistrationType;
