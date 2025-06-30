/**
 * Government Settlements Dashboard
 *
 * This component displays real-time settlement data for the government dashboard:
 * - Live settlement tracking from Terra Switching
 * - Bank-wise settlement breakdown
 * - Settlement status monitoring
 * - Export functionality for government records
 *
 * @author Your Development Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { useTerraswitch, Settlement } from "../../context/TerraswitchContext";
import ExportButton from "../common/ExportButton";
import ResponsiveTable from "../common/ResponsiveTable";

/**
 * Settlement Dashboard Statistics Interface
 */
interface SettlementStats {
  totalSettlements: number;
  totalAmount: number;
  successfulSettlements: number;
  pendingSettlements: number;
  failedSettlements: number;
  averageSettlementAmount: number;
  uniqueBanks: number;
}

/**
 * Enhanced Settlement Interface for Display
 */
interface SettlementDisplay extends Settlement {
  formattedAmount: string;
  formattedDate: string;
  statusColor: string;
  statusIcon: React.ReactNode;
}

const GovernmentSettlements: React.FC = () => {
  const { settlements, isLoading, error, refreshSettlements } =
    useTerraswitch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "success" | "failed"
  >("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">(
    "30d"
  );

  /**
   * Calculate settlement statistics
   */
  const stats = useMemo((): SettlementStats => {
    const totalSettlements = settlements.length;
    const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
    const successfulSettlements = settlements.filter(
      (s) => s.status === "success"
    ).length;
    const pendingSettlements = settlements.filter(
      (s) => s.status === "pending"
    ).length;
    const failedSettlements = settlements.filter(
      (s) => s.status === "failed"
    ).length;
    const averageSettlementAmount =
      totalSettlements > 0 ? totalAmount / totalSettlements : 0;
    const uniqueBanks = new Set(settlements.map((s) => s.bankId)).size;

    return {
      totalSettlements,
      totalAmount,
      successfulSettlements,
      pendingSettlements,
      failedSettlements,
      averageSettlementAmount,
      uniqueBanks,
    };
  }, [settlements]);

  /**
   * Filter settlements based on search, status, and date range
   */
  const filteredSettlements = useMemo((): SettlementDisplay[] => {
    let filtered = settlements;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (settlement) =>
          settlement.bankName.toLowerCase().includes(term) ||
          settlement.invoiceId.toLowerCase().includes(term) ||
          settlement.settlementRef.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (settlement) => settlement.status === statusFilter
      );
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((settlement) => {
        const settlementDate =
          settlement.createdAt?.toDate?.() || new Date(settlement.createdAt);
        return settlementDate >= cutoffDate;
      });
    }

    // Transform for display
    return filtered.map((settlement): SettlementDisplay => {
      const createdAt =
        settlement.createdAt?.toDate?.() || new Date(settlement.createdAt);

      return {
        ...settlement,
        formattedAmount: `₦${settlement.amount.toLocaleString()}`,
        formattedDate: createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        statusColor:
          settlement.status === "success"
            ? "text-green-600 bg-green-100"
            : settlement.status === "pending"
            ? "text-yellow-600 bg-yellow-100"
            : "text-red-600 bg-red-100",
        statusIcon:
          settlement.status === "success" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : settlement.status === "pending" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
      };
    });
  }, [settlements, searchTerm, statusFilter, dateRange]);

  /**
   * Handle refresh action
   */
  const handleRefresh = async () => {
    try {
      await refreshSettlements();
    } catch (error) {
      console.error("Failed to refresh settlements:", error);
    }
  };

  /**
   * Prepare data for export
   */
  const exportData = useMemo(() => {
    return filteredSettlements.map((settlement) => ({
      "Settlement Reference": settlement.settlementRef,
      "Bank Name": settlement.bankName,
      "Invoice ID": settlement.invoiceId,
      Amount: settlement.amount,
      Status: settlement.status,
      Date: settlement.formattedDate,
      "Payment Reference": settlement.originalPaymentRef,
      "Terra Transfer ID": settlement.terraTransferId || "N/A",
    }));
  }, [filteredSettlements]);

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4400B8]"></div>
          <p className="mt-2 text-sm text-gray-600">
            Loading settlement data...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Error loading settlement data
              </p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Settlements</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time tracking of tax payments from banks via Terra Switching
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4400B8]"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <ExportButton
            data={exportData}
            columns={[
              {
                header: "Settlement Reference",
                dataKey: "Settlement Reference",
              },
              { header: "Bank Name", dataKey: "Bank Name" },
              { header: "Invoice ID", dataKey: "Invoice ID" },
              { header: "Amount", dataKey: "Amount" },
              { header: "Status", dataKey: "Status" },
              { header: "Date", dataKey: "Date" },
              { header: "Payment Reference", dataKey: "Payment Reference" },
              { header: "Terra Transfer ID", dataKey: "Terra Transfer ID" },
            ]}
            options={{
              title: "Tax Settlements Export",
              fileName: `tax-settlements-${
                new Date().toISOString().split("T")[0]
              }.pdf`,
              includeDate: true,
            }}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Amount
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₦{stats.totalAmount.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Successful
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    {stats.successfulSettlements}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {stats.pendingSettlements}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Banks
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.uniqueBanks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Settlement Records
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by bank name, invoice ID, or reference..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label
                htmlFor="dateRange"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date Range
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4400B8] focus:border-[#4400B8] sm:text-sm"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Settlements Table */}
          <ResponsiveTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Settlement Reference
                  </th>
                  <th
                    scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bank
                  </th>
                  <th
                    scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No settlements found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {settlement.settlementRef}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {settlement.bankName}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {settlement.formattedAmount}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${settlement.statusColor}`}
                        >
                          {settlement.statusIcon}
                          <span className="ml-1 capitalize">
                            {settlement.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {settlement.formattedDate}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            console.log(
                              "View settlement details:",
                              settlement.id
                            );
                          }}
                          className="text-[#4400B8] hover:text-[#4400B8]/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ResponsiveTable>

          {/* Summary */}
          {filteredSettlements.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredSettlements.length} of {settlements.length}{" "}
              settlements
              {filteredSettlements.length > 0 && (
                <span className="ml-2">
                  • Total: ₦
                  {filteredSettlements
                    .reduce((sum, s) => sum + s.amount, 0)
                    .toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernmentSettlements;
