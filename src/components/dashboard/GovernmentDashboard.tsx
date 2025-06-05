import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useGovernmentDashboard } from "../../context/GovernmentDashboardContext";
import ExportButton from "../common/ExportButton";
import ResponsiveTable from "../common/ResponsiveTable";

const GovernmentDashboard: React.FC = () => {
  const { stats } = useGovernmentDashboard();
  const bankSubmissionTableRef = useRef<HTMLTableElement>(null);

  // // Helper function to format status badges
  // const getStatusBadge = (status: string) => {
  //   const statusColors = {
  //     settled: "bg-green-100 text-green-800",
  //     pending: "bg-amber-100 text-amber-800",
  //   };
  //   return (
  //     <span
  //       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //         statusColors[status as keyof typeof statusColors] ||
  //         "bg-gray-100 text-gray-800"
  //       }`}
  //     >
  //       {status.charAt(0).toUpperCase() + status.slice(1)}
  //     </span>
  //   );
  // };

  // Helper function for bank submission status badges
  const getSubmissionBadge = (hasSubmitted: boolean) => {
    return hasSubmitted ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Submitted
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Not Submitted
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900">
        Government Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tax Collection */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#4400B8]/10 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-[#4400B8]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">
                Total Tax Collection
              </p>
              {stats.isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-24"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.totalTaxCollected}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Settlements */}
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
              <p className="text-sm text-gray-600 truncate">
                Pending Settlements
              </p>
              {stats.isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-24"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.pendingSettlements}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Reporting Banks */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600 truncate">Reporting Banks</p>
              {stats.isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.totalBanks}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* This Month's Revenue */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-green-500"
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
              <p className="text-sm text-gray-600 truncate">
                {stats.currentMonth} Revenue
              </p>
              {stats.isLoading ? (
                <div className="animate-pulse h-6 mt-1 bg-gray-200 rounded w-24"></div>
              ) : (
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {stats.monthlyRevenue}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Bank Submission Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {stats.currentMonth} - Bank Tax Submissions
              </h2>
              <p className="text-sm text-gray-600">
                Monthly tax submission status for all registered banks
              </p>
            </div>
          </div>
        </div>

        {/* Bank Submissions Table */}
        <ResponsiveTable>
          <table ref={bankSubmissionTableRef} className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stats.isLoading ? (
                // Loading state
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={`loading-bank-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
              ) : stats.bankSubmissionStatus.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No banks found.
                  </td>
                </tr>
              ) : (
                stats.bankSubmissionStatus.map((bank) => (
                  <tr key={bank.bankId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {bank.bankName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubmissionBadge(bank.hasSubmitted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bank.lastSubmissionDate || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bank.amount ? `₦${bank.amount.toLocaleString()}` : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Export Button */}
        <div className="p-6 border-t border-gray-100">
          <ExportButton
            tableRef={bankSubmissionTableRef}
            options={{
              title: `Bank Tax Submissions - ${stats.currentMonth}`,
              fileName: "bank-submissions-report.pdf",
              includeDate: true,
            }}
            disabled={
              stats.isLoading || stats.bankSubmissionStatus.length === 0
            }
          />
        </div>
      </div>

      {/* Recent Settlements Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Settlements
              </h2>
              <p className="text-sm text-gray-600">
                Settlements processed by admin to the government
              </p>
            </div>
            <Link
              to="/government/dashboard/settlements"
              className="text-sm text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1"
            >
              View All Settlements
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
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stats.isLoading ? (
                // Loading state
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={`loading-settlement-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                    </tr>
                  ))
              ) : stats.recentSettlements.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No settlements found. Settlements will appear here when an
                    admin approves bank tax payments.
                  </td>
                </tr>
              ) : (
                stats.recentSettlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {settlement.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₦{settlement.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {settlement.referenceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {settlement.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
