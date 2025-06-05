import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useAdminDashboard } from "../../context/AdminDashboardContext";
import ExportButton from "../common/ExportButton";



const AdminDashboard: React.FC = () => {
  const { stats, recentSubmissions, isLoading } = useAdminDashboard();
  const tableRef = useRef<HTMLTableElement>(null);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Banks */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#4400B8]/10 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-[#4400B8]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">
                Total Banks Reporting
              </p>
              {isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.totalBanks}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total POS Agents */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">Total POS Agents</p>
              {isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-20"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.totalPosAgents}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Tax Revenue */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">
                Total Tax Revenue
              </p>
              {isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-24"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.totalTaxRevenue}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">Total Deductions</p>
              {isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-24"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.totalDeductions}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12a1 1 0 11-2 0 1 1 0 012 0zm0-2.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v6z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">Pending Amount</p>
              {isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-24"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.pendingAmount}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Submissions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Bank Submissions
              </h2>
              <p className="text-sm text-gray-600">
                Review agent counts and income reports submitted by banks
              </p>
            </div>
            <Link
              to="/admin/dashboard/bank-submissions"
              className="text-sm text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1"
            >
              View All Submissions
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POS Agents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                // Loading state
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={`loading-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                    </tr>
                  ))
              ) : recentSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No submissions found
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.dateSubmitted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.bankName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.posAgents.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(submission.totalIncome)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : submission.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/dashboard/bank-submissions/${submission.id}`}
                        className="text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1"
                      >
                        View details
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <div className="p-4 border-t border-gray-100">
          <ExportButton
            tableRef={tableRef}
            options={{
              title: "Bank Submissions Report",
              fileName: "bank-submissions-report.pdf",
              includeDate: true,
            }}
            disabled={isLoading || recentSubmissions.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
