import React, { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import ResponsiveTable from "../common/ResponsiveTable";
import { usePOSAgents } from "../../context/POSAgentContext";
import ExportButton from "../common/ExportButton";

const POSAgents: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { agents, loading } = usePOSAgents();
  const tableRef = useRef<HTMLTableElement>(null);

  // Filter agents based on selected filters
  const filteredAgents = useMemo(() => {
    if (!agents) return [];

    return agents.filter((agent) => {
      const createdDate = new Date(agent.createdAt);
      const today = new Date();

      // Date filter
      if (dateFilter !== "all") {
        if (dateFilter === "today") {
          if (
            createdDate.getDate() !== today.getDate() ||
            createdDate.getMonth() !== today.getMonth() ||
            createdDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (createdDate < weekAgo) {
            return false;
          }
        } else if (dateFilter === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          if (createdDate < monthAgo) {
            return false;
          }
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        const agentStatus = (agent.status || "Compliant").toLowerCase();
        if (statusFilter !== agentStatus) {
          return false;
        }
      }

      return true;
    });
  }, [agents, dateFilter, statusFilter]);

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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          POS Agents Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage the list of registered POS agents under your bank.
        </p>
      </div>

      {/* Filters and Add Agent */}
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        {/* Filters - stack vertically on mobile */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:items-center md:gap-4">
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

          <div className="flex flex-wrap gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:ring-[#4400B8] focus:border-[#4400B8] w-full sm:w-auto"
            >
              <option value="all">Date</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:ring-[#4400B8] focus:border-[#4400B8] w-full sm:w-auto"
            >
              <option value="all">Status</option>
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
              Reset
            </button>
          </div>
        </div>

        {/* Add Agent Button */}
        <Link
          to="/bank/dashboard/pos-agents/add"
          className="flex items-center justify-center gap-2 text-[#4400B8] font-medium hover:text-[#4400B8]/80 md:justify-start"
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
      <div className="overflow-x-auto">
        <ResponsiveTable>
          <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Agent Name
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Business Name
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Added
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-6 py-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#4400B8]"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading agents...
                    </p>
                  </td>
                </tr>
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 md:px-6 py-4 text-center text-gray-500"
                  >
                    {agents.length === 0
                      ? "No agents found. Add your first POS agent to get started."
                      : "No agents match the selected filters. Try adjusting your filters."}
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agent.fullName}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {agent.businessName}
                      </div>
                      <div className="text-sm text-gray-500 hidden sm:block">
                        {agent.businessAddress}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{agent.email}</div>
                      <div className="text-sm text-gray-500">
                        {agent.phoneNumber}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(agent.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          agent.status || "Compliant"
                        )}`}
                      >
                        {agent.status || "Compliant"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton
          tableRef={tableRef}
          options={{
            title: "POS Agents Report",
            fileName: "pos-agents-report.pdf",
            includeDate: true,
          }}
          disabled={loading || filteredAgents.length === 0}
        />
      </div>
    </div>
  );
};

export default POSAgents;
