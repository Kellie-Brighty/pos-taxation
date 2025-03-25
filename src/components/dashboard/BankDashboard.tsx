import React from "react";
import { Link } from "react-router-dom";
import ResponsiveTable from "../common/ResponsiveTable";

const BankDashboard: React.FC = () => {
  const stats = [
    {
      title: "Total POS Transactions",
      value: "₦ 500,000",
      subtitle: "This month",
      icon: (
        <svg
          className="w-6 h-6 text-[#4400B8]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Total Tax Deducted",
      value: "₦ 25,000",
      subtitle: "5% deduction",
      icon: (
        <svg
          className="w-6 h-6 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Tax Remitted",
      value: "₦ 5,000",
      subtitle: "",
      icon: (
        <svg
          className="w-6 h-6 text-rose-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
        </svg>
      ),
    },
    {
      title: "Projected Remittance",
      value: "₦ 5,000,000",
      subtitle: "",
      icon: (
        <svg
          className="w-6 h-6 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const agents = [
    {
      name: "John Doe",
      id: "AGT-12345",
      business: "JD POS",
      earnings: "₦2,000",
      taxDeducted: "₦19,000",
      status: "Compliant",
    },
    {
      name: "Jane Smith",
      id: "TXN-67890",
      business: "Smith POS",
      earnings: "₦500",
      taxDeducted: "₦6,500",
      status: "Pending",
    },
    {
      name: "Heritage Atiba",
      id: "JFK-88900",
      business: "POS-A",
      earnings: "₦2,500",
      taxDeducted: "₦18,000",
      status: "Overdue",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
        return "bg-emerald-100 text-emerald-600";
      case "pending":
        return "bg-amber-100 text-amber-600";
      case "overdue":
        return "bg-rose-100 text-rose-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* POS Agents Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              POS Agents Management
            </h2>
            <p className="text-sm text-gray-600">
              Manage the list of registered POS agents under your bank.
            </p>
          </div>
          <Link
            to="/bank/dashboard/pos-agents"
            className="text-[#4400B8] text-sm font-medium hover:text-[#4400B8]/90 flex items-center gap-2"
          >
            Manage all POS Agents
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Agents Table */}
        <ResponsiveTable>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Deducted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {agents.map((agent, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.business}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.earnings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.taxDeducted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        agent.status
                      )}`}
                    >
                      {agent.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Export Button */}
        <div className="p-6 border-t border-gray-100">
          <button className="text-[#4400B8] text-sm font-medium hover:text-[#4400B8]/90 flex items-center gap-2">
            Export as PDF
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankDashboard;
