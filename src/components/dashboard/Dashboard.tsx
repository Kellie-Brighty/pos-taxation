import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    type: "up" | "down";
    period: string;
  };
  variant?: "purple" | "yellow" | "orange" | "green";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  variant = "purple",
}) => {
  const variantStyles = {
    purple: "bg-[#4400B8]/10",
    yellow: "bg-[#FFB800]/10",
    orange: "bg-[#FF8A00]/10",
    green: "bg-[#00B087]/10",
  };

  const changeColor = change.type === "up" ? "text-green-500" : "text-red-500";

  return (
    <div className={`${variantStyles[variant]} rounded-xl p-4 space-y-2`}>
      <p className="text-sm text-gray-600">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <div className="flex items-center gap-1">
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
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button className="p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-[300px] pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.5 3a5.5 5.5 0 0 1 4.227 9.02l4.127 4.126a.5.5 0 0 1-.638.765l-.07-.057-4.126-4.127A5.5 5.5 0 1 1 8.5 3Zm0 1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-200"></button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Earnings"
              value="₦ 500,000"
              change={{
                value: "8.5%",
                type: "up",
                period: "Up from last month",
              }}
              variant="purple"
            />
            <StatCard
              title="Total Tax Deducted"
              value="₦ 25,000"
              change={{
                value: "1.3%",
                type: "up",
                period: "Up from past week",
              }}
              variant="yellow"
            />
            <StatCard
              title="Pending Deductions"
              value="₦ 5,000"
              change={{
                value: "4.3%",
                type: "down",
                period: "Down from yesterday",
              }}
              variant="orange"
            />
            <StatCard
              title="Compliance Score"
              value="85%"
              change={{ value: "Good", type: "up", period: "" }}
              variant="green"
            />
          </div>

          {/* Transactions Section */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transactions
                </h2>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4400B8]/20">
                  <option>October</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Tax Deducted
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Net Earnings
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Reference ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.taxDeducted}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.netEarnings}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.referenceId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="text-[#4400B8] text-sm font-medium hover:opacity-80 transition-opacity">
                Export as PDF ↓
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
