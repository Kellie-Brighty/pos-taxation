import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Hero, WhatIs, HowItWorks, Footer } from "../components/layout";
import { ScrollToTop } from "../components/shared";

interface TaxStatusResponse {
  success: boolean;
  message: string;
  data?: {
    agentName: string;
    phoneNumber: string;
    tin: string;
    bankName: string;
    status: "compliant" | "defaulting";
    period: string;
    amountPaid?: number;
    dueDate?: string;
    defaultAmount?: number;
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<TaxStatusResponse | null>(null);
  const [isCompliant, setIsCompliant] = useState(true); // Track alternating status
  const [searchData, setSearchData] = useState({
    identifier: "", // Phone number or TIN
    period: "",
  });

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkTaxStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call with alternating status
      const response = await new Promise<TaxStatusResponse>((resolve) =>
        setTimeout(
          () =>
            resolve({
              success: true,
              message: "Tax status retrieved successfully",
              data: {
                agentName: "John Doe",
                phoneNumber: "08012345678",
                tin: "1234567890",
                bankName: "First Bank",
                status: isCompliant ? "compliant" : "defaulting",
                period: searchData.period,
                amountPaid: 5000,
                dueDate: "2024-04-30",
                defaultAmount: 2000,
              },
            }),
          1500
        )
      );

      setStatusData(response);
      setShowStatusModal(true);
      // Toggle the status for next check
      setIsCompliant((prev) => !prev);
    } catch (error) {
      console.error("Failed to check tax status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen mx-auto max-w-[1440px]">
      <Header onGetStarted={handleGetStarted} />
      <main className="w-full">
        <Hero onGetStarted={handleGetStarted} />

        {/* Tax Status Checker Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Design Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-[#4400B8]/5"></div>
          <div className="absolute -left-10 top-20 w-40 h-40 bg-[#4400B8]/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-10 bottom-20 w-40 h-40 bg-[#4400B8]/10 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Check Your Tax Status
              </h2>
              <div className="w-24 h-1 bg-[#4400B8] mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Verify your tax compliance status instantly. Enter your phone
                number or TIN to check your current standing.
              </p>
            </div>

            <div className="relative max-w-xl mx-auto">
              {/* Card Design */}
              <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100">
                <form onSubmit={checkTaxStatus} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="identifier"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Phone Number or TIN
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="identifier"
                          id="identifier"
                          value={searchData.identifier}
                          onChange={handleChange}
                          placeholder="Enter your phone number or TIN"
                          required
                          className="pl-12 w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="period"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Tax Period
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="month"
                          name="period"
                          id="period"
                          value={searchData.period}
                          onChange={handleChange}
                          required
                          className="pl-12 w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] transition-colors text-base [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:ml-auto appearance-none"
                          style={{ minWidth: "100%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#4400B8] hover:bg-[#4400B8]/90 text-white py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base font-semibold shadow-lg shadow-[#4400B8]/20"
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
                        Checking...
                      </>
                    ) : (
                      <>
                        <span>Check Tax Status</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="px-[10px] md:px-[70px]">
          <WhatIs />
          <HowItWorks />
        </section>
      </main>
      <Footer />
      <ScrollToTop />

      {/* Tax Status Modal */}
      {showStatusModal && statusData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center transform transition-transform hover:scale-110 ${
                    statusData.data?.status === "compliant"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {statusData.data?.status === "compliant" ? (
                    <svg
                      className="w-10 h-10 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-10 h-10 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <h2
                className={`text-3xl font-bold ${
                  statusData.data?.status === "compliant"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {statusData.data?.status === "compliant"
                  ? "Tax Compliant"
                  : "Tax Defaulting"}
              </h2>

              <div className="text-left space-y-4">
                <div className="border-t border-b border-gray-200 py-6 space-y-3">
                  <p className="text-gray-600 flex justify-between items-center">
                    <span className="font-medium">Name:</span>
                    <span className="text-gray-900">
                      {statusData.data?.agentName}
                    </span>
                  </p>
                  <p className="text-gray-600 flex justify-between items-center">
                    <span className="font-medium">Phone:</span>
                    <span className="text-gray-900">
                      {statusData.data?.phoneNumber}
                    </span>
                  </p>
                  <p className="text-gray-600 flex justify-between items-center">
                    <span className="font-medium">TIN:</span>
                    <span className="text-gray-900">
                      {statusData.data?.tin}
                    </span>
                  </p>
                  <p className="text-gray-600 flex justify-between items-center">
                    <span className="font-medium">Bank:</span>
                    <span className="text-gray-900">
                      {statusData.data?.bankName}
                    </span>
                  </p>
                  <p className="text-gray-600 flex justify-between items-center">
                    <span className="font-medium">Period:</span>
                    <span className="text-gray-900">
                      {statusData.data?.period}
                    </span>
                  </p>
                </div>

                {statusData.data?.status === "compliant" ? (
                  <p className="text-green-600 text-lg font-semibold flex justify-between items-center">
                    <span>Amount Paid:</span>
                    <span>₦{statusData.data.amountPaid?.toLocaleString()}</span>
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-600 text-lg font-semibold flex justify-between items-center">
                      <span>Default Amount:</span>
                      <span>
                        ₦{statusData.data?.defaultAmount?.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-gray-600 flex justify-between items-center">
                      <span className="font-medium">Due Date:</span>
                      <span className="text-gray-900">
                        {statusData.data?.dueDate}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] text-base font-semibold flex items-center justify-center gap-2"
            >
              Close
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
