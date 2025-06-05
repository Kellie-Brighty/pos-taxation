import React, { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdminDashboard } from "../../context/AdminDashboardContext";
import ExportButton from "../common/ExportButton";

const BankSubmissionsManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { taxReports, isLoading } = useAdminDashboard();
  const tableRef = useRef<HTMLTableElement>(null);

  // Convert tax reports to bank submissions format
  const submissions = useMemo(() => {
    return taxReports.map((report) => ({
      id: report.id,
      dateSubmitted: report.submittedAt
        ? new Date(report.submittedAt.toDate()).toLocaleDateString()
        : "Unknown",
      bankName: report.bankName,
      posAgents: Math.floor(Math.random() * 5000) + 1000, // Placeholder - in real app we'd get actual counts
      totalIncome: report.transactionVolume,
      status:
        report.status === "approved"
          ? "Approved"
          : report.status === "rejected"
          ? "Rejected"
          : "Pending",
      bankId: report.bankId,
      rawDate: report.submittedAt ? report.submittedAt.toDate() : new Date(),
    }));
  }, [taxReports]);

  // Filter submissions based on selected filters
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      // Filter by status
      if (selectedStatus && selectedStatus !== "") {
        const statusMatch =
          selectedStatus === "approved"
            ? submission.status === "Approved"
            : selectedStatus === "pending"
            ? submission.status === "Pending"
            : selectedStatus === "rejected"
            ? submission.status === "Rejected"
            : true;
        if (!statusMatch) return false;
      }

      // Filter by date
      if (selectedDate && selectedDate !== "") {
        const submissionDate = new Date(submission.rawDate);
        const today = new Date();

        // Reset hours to compare just the dates
        today.setHours(0, 0, 0, 0);

        const isToday = submissionDate.toDateString() === today.toDateString();

        // Calculate start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // Calculate start of month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Calculate start of year
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        if (selectedDate === "today" && !isToday) return false;
        if (selectedDate === "week" && submissionDate < startOfWeek)
          return false;
        if (selectedDate === "month" && submissionDate < startOfMonth)
          return false;
        if (selectedDate === "year" && submissionDate < startOfYear)
          return false;
      }

      return true;
    });
  }, [submissions, selectedDate, selectedStatus]);

  const handleReset = () => {
    setSelectedDate("");
    setSelectedStatus("");
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bank Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review transaction volumes and tax reports submitted by banks.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter By Dropdown */}
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-600">Filter By</span>
          </div>

          {/* Date Filter */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] text-sm"
              disabled={isLoading}
            >
              <option value="">Date (All)</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4400B8]/20 focus:border-[#4400B8] text-sm"
              disabled={isLoading}
            >
              <option value="">Status (All)</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-[#4400B8] hover:bg-[#4400B8]/5 rounded-lg flex items-center gap-2"
            disabled={isLoading || (!selectedDate && !selectedStatus)}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Reset Filter
          </button>
        </div>
      </div>

      {/* Bank Submissions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Bank Submissions
          </h2>
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
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
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
            disabled={isLoading || filteredSubmissions.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default BankSubmissionsManagement;
