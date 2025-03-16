import React from "react";

interface Transaction {
  date: string;
  amount: string;
  taxDeducted: string;
  netEarnings: string;
  status: "Paid" | "Pending" | "Rejected";
}

const TaxSummary: React.FC = () => {
  const transactions: Transaction[] = [
    {
      date: "12.09.2019",
      amount: "₦1,000",
      taxDeducted: "₦2,000",
      netEarnings: "₦15,000",
      status: "Paid",
    },
    {
      date: "12.09.2019",
      amount: "₦2,000",
      taxDeducted: "₦1,500",
      netEarnings: "₦16,500",
      status: "Pending",
    },
    {
      date: "12.09.2019",
      amount: "₦1,000",
      taxDeducted: "₦2,500",
      netEarnings: "₦18,000",
      status: "Rejected",
    },
    {
      date: "12.09.2019",
      amount: "₦1,000",
      taxDeducted: "₦2,500",
      netEarnings: "₦18,000",
      status: "Rejected",
    },
    {
      date: "12.09.2019",
      amount: "₦1,000",
      taxDeducted: "₦2,500",
      netEarnings: "₦18,000",
      status: "Rejected",
    },
  ];

  const getStatusStyles = (status: Transaction["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-[#00B087]/10 text-[#00B087]";
      case "Pending":
        return "bg-[#FFB800]/10 text-[#FFB800]";
      case "Rejected":
        return "bg-[#FF3B3B]/10 text-[#FF3B3B]";
      default:
        return "";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-[300px] pl-10 pr-4 py-2 bg-[#F8F9FE] rounded-lg text-sm focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.5 3a5.5 5.5 0 014.227 9.02l4.127 4.126a.5.5 0 01-.638.765l-.07-.057-4.126-4.127A5.5 5.5 0 118.5 3zm0 1a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B3B] rounded-full"></span>
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-200"></button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 bg-[#F8F9FE] min-h-[calc(100vh-4rem)]">
        <div className="space-y-6 md:space-y-8">
          {/* Page Title */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Transactions
          </h1>

          {/* Filter Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="text-gray-400"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                <span className="text-sm text-gray-600">Filter By</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20">
                  <option>Date</option>
                </select>
                <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20">
                  <option>Order Status</option>
                </select>
                <button className="text-[#FF3B3B] text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1">
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FE]">
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500">
                      Tax Deducted
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500">
                      Net Earnings
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                        {transaction.amount}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                        {transaction.taxDeducted}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                        {transaction.netEarnings}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span
                          className={`inline-flex px-2 md:px-2.5 py-0.5 md:py-1 text-xs font-medium rounded-full ${getStatusStyles(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="text-[#4400B8] text-xs md:text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1">
                Export as PDF
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 12l-4-4h8l-4 4zm0-8l4 4H4l4-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaxSummary;
