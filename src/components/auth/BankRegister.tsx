import React from "react";
import { Link, useNavigate } from "react-router-dom";

const BankRegister: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle form submission
    // For now, we'll navigate to bank details
    navigate("/register/bank/details");
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
                  to="/register"
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
                    Tell Us About You
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Provide your details for identification of your bank
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      placeholder="Mr. Ademola Ayo"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="workEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      id="workEmail"
                      placeholder="Enter work email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      placeholder="Enter Phone number"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base"
                  >
                    Continue Registration
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

export default BankRegister;
