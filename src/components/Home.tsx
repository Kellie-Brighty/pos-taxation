import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-8 py-6 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[#4400B8] text-lg font-medium">POS Taxation</p>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[#4400B8] font-medium hover:opacity-80 transition-opacity px-6 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#4400B8] text-white font-medium hover:bg-[#4400B8]/90 transition-colors px-6 py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-8 py-16 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-[#4400B8] leading-tight">
              Simplify Your POS Tax Management
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Streamline your tax compliance process with our automated POS tax
              management system. Perfect for banks and POS agents.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link
                to="/register"
                className="bg-[#4400B8] text-white font-medium hover:bg-[#4400B8]/90 transition-colors px-8 py-4 rounded-lg text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="text-[#4400B8] font-medium hover:opacity-80 transition-opacity px-8 py-4 text-lg flex items-center gap-2"
              >
                Login
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
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 px-8 py-16 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-[#4400B8]/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#4400B8]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Automated Tax Calculations
              </h3>
              <p className="text-gray-600">
                Let our system handle complex tax calculations automatically,
                reducing errors and saving time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-[#4400B8]/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#4400B8]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Compliance Reports
              </h3>
              <p className="text-gray-600">
                Generate detailed compliance reports with a single click,
                ensuring you meet all regulatory requirements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl space-y-4">
              <div className="w-12 h-12 bg-[#4400B8]/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#4400B8]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Secure Platform
              </h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard security measures,
                ensuring confidentiality and integrity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white px-8 py-12 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600">
              © {new Date().getFullYear()} POS Taxation. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-gray-600 hover:text-[#4400B8] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#4400B8] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#4400B8] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
