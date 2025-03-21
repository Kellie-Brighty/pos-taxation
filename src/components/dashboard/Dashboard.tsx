import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    type: "up" | "down";
    period: string;
  };
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  const changeColor =
    change.type === "up" ? "text-[#00B087]" : "text-[#FF3B3B]";

  return (
    <div className="bg-white rounded-xl p-6 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{title}</p>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <div className="flex items-center gap-1.5">
        <span className={changeColor}>
          {change.type === "up" ? "↑" : "↓"} {change.value}
        </span>
        <span className="text-sm text-gray-500">{change.period}</span>
      </div>
    </div>
  );
};

interface Transaction {
  date: string;
  amount: string;
  taxDeducted: string;
  netEarnings: string;
  status: "Paid" | "Pending" | "Rejected";
  referenceId: string;
}

const Dashboard: React.FC = () => {
  const transactions: Transaction[] = [
    {
      date: "12.09.2019",
      amount: "₦1,000",
      taxDeducted: "₦2,000",
      netEarnings: "₦15,000",
      status: "Paid",
      referenceId: "TXN12345",
    },
    {
      date: "12.09.2019",
      amount: "₦2,000",
      taxDeducted: "₦1,500",
      netEarnings: "₦16,500",
      status: "Pending",
      referenceId: "TXN67890",
    },
    {
      date: "12.09.2019",
      amount: "₦1,000",
      taxDeducted: "₦2,500",
      netEarnings: "₦18,000",
      status: "Rejected",
      referenceId: "TXN89900",
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
            Dashboard
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Total Earnings"
              value="₦ 500,000"
              change={{
                value: "8.5%",
                type: "up",
                period: "Up from last month",
              }}
              icon={
                <div className="w-10 h-10 rounded-lg bg-[#4400B8]/10 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="#4400B8"
                  >
                    <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V3H8.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H6.04c.1 1.7 1.36 2.66 2.86 2.97V17h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
              }
            />
            <StatCard
              title="Total Tax Deducted"
              value="₦ 25,000"
              change={{
                value: "1.3%",
                type: "up",
                period: "Up from past week",
              }}
              icon={
                <div className="w-10 h-10 rounded-lg bg-[#FFB800]/10 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="#FFB800"
                  >
                    <path d="M17 3H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h14v10zM9 8H7v6h2V8zm4-3h-2v9h2V5zm4 6h-2v3h2v-3z" />
                  </svg>
                </div>
              }
            />
            <StatCard
              title="Pending Deductions"
              value="₦ 5,000"
              change={{
                value: "4.3%",
                type: "down",
                period: "Down from yesterday",
              }}
              icon={
                <div className="w-10 h-10 rounded-lg bg-[#FF8A00]/10 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="#FF8A00"
                  >
                    <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
              }
            />
            <StatCard
              title="Compliance Score"
              value="85%"
              change={{ value: "Good", type: "up", period: "" }}
              icon={
                <div className="w-10 h-10 rounded-lg bg-[#00B087]/10 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="#00B087"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              }
            />
          </div>

          {/* Transactions Section */}
          <div className="bg-white rounded-xl">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Transactions
                </h2>
                <select className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20">
                  <option>October</option>
                  <option>November</option>
                  <option>December</option>
                </select>
              </div>
            </div>
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
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500">
                      Reference ID
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
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                        {transaction.referenceId}
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

export default Dashboard;
