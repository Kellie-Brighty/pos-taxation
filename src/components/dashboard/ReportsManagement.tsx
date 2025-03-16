import React, { useState } from "react";

interface Report {
  id: string;
  reportName: string;
  month: string;
  status: "Ready";
}

const ReportsManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Sample data - replace with actual data from your backend
  const reports: Report[] = [
    {
      id: "1",
      reportName: "Monthly Tax Summary",
      month: "Jan 2025",
      status: "Ready",
    },
    {
      id: "2",
      reportName: "Bank Compliance Report",
      month: "Jan 2025",
      status: "Ready",
    },
    {
      id: "3",
      reportName: "Monthly Tax Summary",
      month: "Dec 2024",
      status: "Ready",
    },
    {
      id: "4",
      reportName: "Monthly Tax Summary",
      month: "Nov 2024",
      status: "Ready",
    },
    {
      id: "5",
      reportName: "Monthly Tax Summary",
      month: "Oct 2024",
      status: "Ready",
    },
    {
      id: "6",
      reportName: "Monthly Tax Summary",
      month: "Sep 2024",
      status: "Ready",
    },
    {
      id: "7",
      reportName: "Monthly Tax Summary",
      month: "Aug 2024",
      status: "Ready",
    },
  ];

  const handleReset = () => {
    setSelectedDate("");
    setSelectedStatus("");
  };

  const handleDownload = (reportId: string) => {
    // Implement download functionality
    console.log(`Downloading report ${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Manage Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate and download reports for internal tracking and audits.
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
            >
              <option value="">Order Status (All)</option>
              <option value="ready">Ready</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-[#4400B8] hover:bg-[#4400B8]/5 rounded-lg flex items-center gap-2"
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

      {/* Reports Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
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
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reportName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="text-[#4400B8] hover:text-[#4400B8]/80 flex items-center gap-1"
                    >
                      Download PDF
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
