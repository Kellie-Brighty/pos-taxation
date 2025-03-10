import React from "react";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
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

            {/* Form Section */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-[28px] font-bold text-[#4400B8]">
                  Let's Get Started
                </h1>
                <p className="text-gray-600 text-sm">
                  Choose your role to personalize your experience.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Choose Role
                  </label>
                  <select
                    id="role"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Bank
                    </option>
                    <option value="bank">Bank</option>
                    <option value="agent">POS Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-3 px-6 rounded-lg transition-colors text-base">
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

export default Register;
