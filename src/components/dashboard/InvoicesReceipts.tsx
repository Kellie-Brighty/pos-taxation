import React, { useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveTable from "../common/ResponsiveTable";

interface Invoice {
  id: string;
  date: string;
  invoiceNumber: string;
  taxAmount: string;
  status: "Paid" | "Pending";
}

const InvoicesReceipts: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const invoices: Invoice[] = [
    {
      id: "1",
      date: "Jan 10",
      invoiceNumber: "INV-12345",
      taxAmount: "₦5,000,000",
      status: "Paid",
    },
    {
      id: "2",
      date: "Jan 20",
      invoiceNumber: "INV-28475",
      taxAmount: "₦1,000,000",
      status: "Pending",
    },
    {
      id: "3",
      date: "Jan 30",
      invoiceNumber: "INV-09137",
      taxAmount: "₦2,000,000",
      status: "Paid",
    },
    {
      id: "4",
      date: "Feb 10",
      invoiceNumber: "INV-72346",
      taxAmount: "₦3,000,000",
      status: "Paid",
    },
    {
      id: "5",
      date: "Feb 20",
      invoiceNumber: "INV-53462",
      taxAmount: "₦5,000,000",
      status: "Pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-600";
      case "Pending":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Invoices & Payment Receipts
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Stores records of tax payments made to the government.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
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
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Invoice Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tax Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.taxAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={`/bank/dashboard/invoices/${invoice.id}`}
                    className="text-[#4400B8] font-medium hover:text-[#4400B8]/80 flex items-center gap-2"
                  >
                    View details
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

export default InvoicesReceipts;
