import React, { useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveTable from "../common/ResponsiveTable";

interface POSAgent {
  agentName: string;
  uniqueId: string;
  businessName: string;
  totalEarnings: string;
  taxDeducted: string;
  complianceStatus: "Compliant" | "Pending" | "Overdue";
}

const POSAgents: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const agents: POSAgent[] = [
    {
      agentName: "John Doe",
      uniqueId: "AGT-12345",
      businessName: "JD POS",
      totalEarnings: "₦2,000",
      taxDeducted: "₦19,000",
      complianceStatus: "Compliant",
    },
    {
      agentName: "Jane Smith",
      uniqueId: "TXN-67890",
      businessName: "Smith POS",
      totalEarnings: "₦1,500",
      taxDeducted: "₦16,500",
      complianceStatus: "Pending",
    },
    {
      agentName: "Heritage Atiba",
      uniqueId: "JFK-88900",
      businessName: "POS-A",
      totalEarnings: "₦2,500",
      taxDeducted: "₦18,000",
      complianceStatus: "Overdue",
    },
    {
      agentName: "Heritage Atiba",
      uniqueId: "JFK-88900",
      businessName: "POS-A",
      totalEarnings: "₦2,500",
      taxDeducted: "₦18,000",
      complianceStatus: "Overdue",
    },
    {
      agentName: "Heritage Atiba",
      uniqueId: "JFK-88900",
      businessName: "POS-A",
      totalEarnings: "₦2,500",
      taxDeducted: "₦18,000",
      complianceStatus: "Overdue",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-100 text-emerald-600";
      case "Pending":
        return "bg-amber-100 text-amber-600";
      case "Overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          POS Agents Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage the list of registered POS agents under your bank.
        </p>
      </div>

      {/* Filters and Add Agent */}
      <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm text-gray-500">Filter By</span>
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:ring-[#4400B8] focus:border-[#4400B8]"
          >
            <option value="all">Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:ring-[#4400B8] focus:border-[#4400B8]"
          >
            <option value="all">Order Status</option>
            <option value="compliant">Compliant</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <button
            onClick={() => {
              setDateFilter("all");
              setStatusFilter("all");
            }}
            className="text-[#4400B8] text-sm font-medium hover:text-[#4400B8]/80 flex items-center gap-1"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Reset Filter
          </button>
        </div>

        <Link
          to="/bank/dashboard/pos-agents/add"
          className="flex items-center gap-2 text-[#4400B8] font-medium hover:text-[#4400B8]/80"
        >
          Add POS Agent
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </Link>
      </div>

      {/* Table */}
      <ResponsiveTable>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Agent Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Unique ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Business Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Earnings
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tax Deducted
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Compliance Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.agentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.uniqueId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.businessName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.totalEarnings}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agent.taxDeducted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      agent.complianceStatus
                    )}`}
                  >
                    {agent.complianceStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 text-[#4400B8] text-sm font-medium hover:text-[#4400B8]/80">
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
          Export as PDF
        </button>
      </div>
    </div>
  );
};

export default POSAgents;
