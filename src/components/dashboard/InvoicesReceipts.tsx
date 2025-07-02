import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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

interface Invoice {
  id: string;
  date: string;
  invoiceNumber: string;
  taxAmount: number;
  status: "Paid" | "Pending";
  createdAt: Timestamp;
  bankId: string;
  bankName?: string;
}

interface AdminSettlement {
  id: string;
  amount: number;
  date: string;
  referenceNumber: string;
  description: string;
  bankName: string;
  createdAt: Timestamp;
}

const InvoicesReceipts: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const tableRef = useRef<HTMLTableElement>(null);

  // Check if user is from government
  const isGovernment = userData?.role === "government";

  // Fetch real-time data
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    let unsubscribeListener = () => {};

    try {
      if (isGovernment) {
        // For government users, fetch admin settlements
        const settlementsQuery = query(
          collection(db, "adminSettlements"),
          orderBy("createdAt", "desc")
        );

        unsubscribeListener = onSnapshot(
          settlementsQuery,
          (snapshot) => {
            const settlementsData: AdminSettlement[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              settlementsData.push({
                id: doc.id,
                amount: data.amount || 0,
                date:
                  data.createdAt?.toDate().toLocaleDateString() || "Unknown",
                referenceNumber: data.referenceNumber || "N/A",
                description: data.description || "Tax revenue settlement",
                bankName: data.bankName || "Unknown Bank",
                createdAt: data.createdAt,
              });
            });

            setSettlements(settlementsData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching settlements:", error);
            setLoading(false);
          }
        );
      } else {
        // For bank users, fetch invoices
        const invoicesQuery = query(
          collection(db, "invoices"),
          where("bankId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        // Set up real-time listener
        unsubscribeListener = onSnapshot(
          invoicesQuery,
          (snapshot) => {
            const invoicesData: Invoice[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              invoicesData.push({
                id: doc.id,
                date: data.createdAt
                  ? new Date(data.createdAt.toDate()).toLocaleDateString()
                  : "Unknown",
                invoiceNumber:
                  data.invoiceNumber ||
                  `INV-${Math.floor(100000 + Math.random() * 900000)}`,
                taxAmount: data.taxAmount || 0,
                status: data.status || "Pending",
                createdAt: data.createdAt,
                bankId: data.bankId,
                bankName: data.bankName,
              });
            });

            setInvoices(invoicesData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching invoices:", error);
            setLoading(false);
          }
        );
      }
    } catch (err) {
      console.error("Error setting up data listener:", err);
      setLoading(false);
    }

    // Clean up listener on unmount
    return () => {
      try {
        if (unsubscribeListener) {
          unsubscribeListener();
        }
      } catch (err) {
        console.error("Error unsubscribing from listener:", err);
      }
    };
  }, [currentUser, isGovernment]);

  // Filter invoices based on selected filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Filter by date
      if (dateFilter !== "all" && invoice.createdAt) {
        const invoiceDate = invoice.createdAt.toDate();
        const today = new Date();

        if (dateFilter === "today") {
          // Check if the date is today
          if (
            invoiceDate.getDate() !== today.getDate() ||
            invoiceDate.getMonth() !== today.getMonth() ||
            invoiceDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === "week") {
          // Check if the date is within the last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (invoiceDate < weekAgo) {
            return false;
          }
        } else if (dateFilter === "month") {
          // Check if the date is within the last 30 days
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          if (invoiceDate < monthAgo) {
            return false;
          }
        }
      }

      // Filter by status
      if (statusFilter !== "all") {
        if (invoice.status.toLowerCase() !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, dateFilter, statusFilter]);

  // Filter settlements based on selected filters
  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      // Filter by date
      if (dateFilter !== "all" && settlement.createdAt) {
        const settlementDate = settlement.createdAt.toDate();
        const today = new Date();

        if (dateFilter === "today") {
          // Check if the date is today
          if (
            settlementDate.getDate() !== today.getDate() ||
            settlementDate.getMonth() !== today.getMonth() ||
            settlementDate.getFullYear() !== today.getFullYear()
          ) {
            return false;
          }
        } else if (dateFilter === "week") {
          // Check if the date is within the last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (settlementDate < weekAgo) {
            return false;
          }
        } else if (dateFilter === "month") {
          // Check if the date is within the last 30 days
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          if (settlementDate < monthAgo) {
            return false;
          }
        }
      }

      return true;
    });
  }, [settlements, dateFilter]);

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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₦ ${amount.toLocaleString("en-NG")}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          {isGovernment ? "Admin Settlements" : "Invoices & Payment Receipts"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isGovernment
            ? "Records of tax settlements processed and approved by the admin."
            : "Stores records of tax payments made to the government."}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
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

          {!isGovernment && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:ring-[#4400B8] focus:border-[#4400B8]"
          >
              <option value="all">Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          )}

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
              {isGovernment ? (
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
                    Reference Number
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
                    Description
                  </th>
                </tr>
              ) : (
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
                Invoice Number
              </th>
              <th
                scope="col"
                    className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tax Amount
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
                Actions
              </th>
            </tr>
              )}
          </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 md:px-6 py-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#4400B8]"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading {isGovernment ? "settlements" : "invoices"}...
                    </p>
                  </td>
                </tr>
              ) : isGovernment ? (
                // Government Settlements Table
                filteredSettlements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 md:px-6 py-4 text-center text-gray-500"
                    >
                      {settlements.length === 0
                        ? "No settlements found."
                        : "No settlements match the selected filters."}
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {settlement.date}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {settlement.referenceNumber}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {settlement.bankName}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(settlement.amount)}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {settlement.description}
                      </td>
                    </tr>
                  ))
                )
              ) : // Bank Invoices Table
              filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 md:px-6 py-4 text-center text-gray-500"
                  >
                    {invoices.length === 0
                      ? "No invoices found."
                      : "No invoices match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.date}
                </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.taxAmount)}
                </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
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
            title: isGovernment
              ? "Admin Settlements Report"
              : "Invoices & Receipts Report",
            fileName: isGovernment
              ? "settlements-report.pdf"
              : "invoices-report.pdf",
            includeDate: true,
          }}
          disabled={
            loading ||
            (isGovernment
              ? filteredSettlements.length === 0
              : filteredInvoices.length === 0)
          }
        />
      </div>
    </div>
  );
};

export default InvoicesReceipts;
