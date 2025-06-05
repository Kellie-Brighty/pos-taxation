import React, { useState, useEffect, useRef, useMemo } from "react";
import ResponsiveTable from "../common/ResponsiveTable";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import ExportButton from "../common/ExportButton";

interface TaxDeduction {
  id: string;
  date: string;
  totalPOSEarnings: number;
  taxDeducted: number;
  taxRemitted: number;
  status: "Paid" | "Pending" | "Overdue";
  createdAt: Timestamp;
  bankId: string;
}

const TaxDeductions: React.FC = () => {
  const { currentUser } = useAuth();
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deductions, setDeductions] = useState<TaxDeduction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const tableRef = useRef<HTMLTableElement>(null);

  // Fetch real-time data
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    let unsubscribeListener = () => {};

    try {
      // Create query for tax deductions for the current bank
      const taxDeductionsQuery = query(
        collection(db, "taxDeductions"),
        where("bankId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      // Set up real-time listener
      unsubscribeListener = onSnapshot(
        taxDeductionsQuery,
        (snapshot) => {
          const deductionsData: TaxDeduction[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            deductionsData.push({
              id: doc.id,
              date: data.createdAt
                ? new Date(data.createdAt.toDate()).toLocaleDateString()
                : "Unknown",
              totalPOSEarnings: data.totalPOSEarnings || 0,
              taxDeducted: data.taxDeducted || 0,
              taxRemitted: data.taxRemitted || 0,
              status: data.status || "Pending",
              createdAt: data.createdAt,
              bankId: data.bankId,
            });
          });

          setDeductions(deductionsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching tax deductions:", error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up tax deductions listener:", err);
      setLoading(false);
    }

    // Clean up listener on unmount
    return () => {
      try {
        if (unsubscribeListener) {
          unsubscribeListener();
        }
      } catch (err) {
        console.error("Error unsubscribing from tax deductions listener:", err);
      }
    };
  }, [currentUser]);

  // Filter deductions based on selected filters
  const filteredDeductions = useMemo(() => {
    return deductions.filter((deduction) => {
      // Filter by date
      if (dateFilter !== "all" && deduction.createdAt) {
        const deductionDate = deduction.createdAt.toDate();
        const today = new Date();

        if (dateFilter === "today") {
          // Check if the date is today
          if (
            deductionDate.getDate() !== today.getDate() ||
            deductionDate.getMonth() !== today.getMonth() ||
            deductionDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === "week") {
          // Check if the date is within the last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (deductionDate < weekAgo) {
            return false;
          }
        } else if (dateFilter === "month") {
          // Check if the date is within the last 30 days
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          if (deductionDate < monthAgo) {
            return false;
          }
        }
      }

      // Filter by status
      if (statusFilter !== "all") {
        if (deduction.status.toLowerCase() !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [deductions, dateFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-600";
      case "Pending":
        return "bg-amber-100 text-amber-600";
      case "Overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₦ ${amount.toLocaleString("en-NG")}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Tax Deductions & Remittance
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor how tax deductions are processed and sent to the government.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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

        <div className="flex flex-wrap gap-2 sm:gap-4">
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
            <option value="all">Status</option>
            <option value="paid">Paid</option>
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
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total POS Earnings
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tax Deducted
                </th>
                <th
                  scope="col"
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Tax Remitted
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
                      Loading tax deductions...
                    </p>
                  </td>
                </tr>
              ) : filteredDeductions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 md:px-6 py-4 text-center text-gray-500"
                  >
                    {deductions.length === 0
                      ? "No tax deductions found."
                      : "No tax deductions match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredDeductions.map((deduction) => (
                  <tr key={deduction.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deduction.date}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(deduction.totalPOSEarnings)}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(deduction.taxDeducted)}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                      {formatCurrency(deduction.taxRemitted)}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          deduction.status
                        )}`}
                      >
                        {deduction.status}
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
            title: "Tax Deductions Report",
            fileName: "tax-deductions-report.pdf",
            includeDate: true,
          }}
          disabled={loading || deductions.length === 0}
        />
      </div>
    </div>
  );
};

export default TaxDeductions;
