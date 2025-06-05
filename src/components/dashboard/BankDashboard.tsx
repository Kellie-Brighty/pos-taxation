import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ResponsiveTable from "../common/ResponsiveTable";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ExportButton from "../common/ExportButton";

interface AgentData {
  id: string;
  name: string;
  business: string;
  earnings: string;
  taxDeducted: string;
  status: string;
}

interface DashboardStats {
  totalTransactions: number;
  totalTaxDeducted: number;
  taxRemitted: number;
  projectedRemittance: number;
}

const BankDashboard: React.FC = () => {
  const { userData, currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState({
    transactions: true,
    taxDeducted: true,
    remittances: true,
  });
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalTaxDeducted: 0,
    taxRemitted: 0,
    projectedRemittance: 0,
  });
  const tableRef = useRef<HTMLTableElement>(null);

  // Fetch real-time data
  useEffect(() => {
    if (!currentUser || !userData) return;

    setLoading(true);
    const bankId = currentUser.uid;

    // Setup listeners for POS agents
    const agentsQuery = query(
      collection(db, "posAgents"),
      where("bankId", "==", bankId)
    );

    const unsubscribeAgents = onSnapshot(
      agentsQuery,
      (snapshot) => {
        const agentsData: AgentData[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          agentsData.push({
            id: doc.id,
            name: data.fullName || "Unknown",
            business: data.businessName || "Unknown",
            earnings: formatCurrency(data.totalEarnings || 0),
            taxDeducted: formatCurrency(data.taxDeducted || 0),
            status: data.complianceStatus || "Pending",
          });
        });

        setAgents(agentsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching agents:", error);
        setLoading(false);
      }
    );

    // Set up real-time listeners for dashboard stats

    // 1. Transactions listener
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("bankId", "==", bankId)
    );

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        let totalAmount = 0;
        let totalTax = 0;

        snapshot.forEach((doc) => {
          const txnData = doc.data();
          totalAmount += txnData.amount || 0;
          totalTax += txnData.taxAmount || 0;
        });

        // Update stats with transaction data
        setDashboardStats((prevStats) => ({
          ...prevStats,
          totalTransactions: totalAmount,
          totalTaxDeducted: totalTax,
          // Update projection based on current tax data
          projectedRemittance: totalTax * 2,
        }));

        // Mark transactions data as loaded
        setStatsLoading((prev) => ({
          ...prev,
          transactions: false,
          taxDeducted: false,
        }));
      },
      (error) => {
        console.error("Error in transactions listener:", error);
        // Even on error, mark as loaded to remove loading state
        setStatsLoading((prev) => ({
          ...prev,
          transactions: false,
          taxDeducted: false,
        }));
      }
    );

    // 2. Remittances listener
    const remittancesQuery = query(
      collection(db, "taxRemittances"),
      where("bankId", "==", bankId)
    );

    const unsubscribeRemittances = onSnapshot(
      remittancesQuery,
      (snapshot) => {
        let remittedAmount = 0;

        snapshot.forEach((doc) => {
          const remitData = doc.data();
          remittedAmount += remitData.amount || 0;
        });

        // Update stats with remittance data
        setDashboardStats((prevStats) => ({
          ...prevStats,
          taxRemitted: remittedAmount,
        }));

        // Mark remittances data as loaded
        setStatsLoading((prev) => ({
          ...prev,
          remittances: false,
        }));
      },
      (error) => {
        console.error("Error in remittances listener:", error);
        // Even on error, mark as loaded to remove loading state
        setStatsLoading((prev) => ({
          ...prev,
          remittances: false,
        }));
      }
    );

    // 3. Tax Deductions listener for additional data
    const taxDeductionsQuery = query(
      collection(db, "taxDeductions"),
      where("bankId", "==", bankId)
    );

    const unsubscribeTaxDeductions = onSnapshot(
      taxDeductionsQuery,
      (_snapshot) => {
        // This listener can be used to extract additional metrics
        // from taxDeductions collection if needed
      },
      (error) => {
        console.error("Error in tax deductions listener:", error);
      }
    );

    // Cleanup all listeners on unmount
    return () => {
      unsubscribeAgents();
      unsubscribeTransactions();
      unsubscribeRemittances();
      unsubscribeTaxDeductions();
    };
  }, [currentUser, userData]);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `₦ ${amount.toLocaleString("en-NG")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
        return "bg-emerald-100 text-emerald-600";
      case "pending":
        return "bg-amber-100 text-amber-600";
      case "overdue":
        return "bg-rose-100 text-rose-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Stats display data
  const stats = [
    {
      title: "Total POS Transactions",
      value: formatCurrency(dashboardStats.totalTransactions),
      subtitle: "This month",
      icon: (
        <svg
          className="w-6 h-6 text-[#4400B8]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Total Tax Deducted",
      value: formatCurrency(dashboardStats.totalTaxDeducted),
      subtitle: "5% deduction",
      icon: (
        <svg
          className="w-6 h-6 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Tax Remitted",
      value: formatCurrency(dashboardStats.taxRemitted),
      subtitle: "",
      icon: (
        <svg
          className="w-6 h-6 text-rose-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
        </svg>
      ),
    },
    {
      title: "Projected Remittance",
      value: formatCurrency(dashboardStats.projectedRemittance),
      subtitle: "",
      icon: (
        <svg
          className="w-6 h-6 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        {userData?.businessName && (
          <p className="text-md text-gray-600">
            Welcome, {userData.businessName}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          // Determine if this particular stat is still loading
          const isStatLoading =
            (index === 0 && statsLoading.transactions) ||
            (index === 1 && statsLoading.taxDeducted) ||
            (index === 2 && statsLoading.remittances) ||
            (index === 3 &&
              (statsLoading.transactions || statsLoading.taxDeducted));

          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{stat.title}</p>
                {isStatLoading ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-28"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                )}
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* POS Agents Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              POS Agents Management
            </h2>
            <p className="text-sm text-gray-600">
              Manage the list of registered POS agents under your bank.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/bank/dashboard/pos-agents/add"
              className="bg-[#4400B8] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#4400B8]/90 flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add POS Agent
            </Link>
            <Link
              to="/bank/dashboard/pos-agents"
              className="text-[#4400B8] text-sm font-medium hover:text-[#4400B8]/90 flex items-center gap-2"
            >
              Manage all POS Agents
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
          </div>
        </div>

        {/* Agents Table */}
        <ResponsiveTable>
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4400B8]"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading agents data...
              </p>
            </div>
          ) : (
            <table className="w-full" ref={tableRef}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Deducted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {agents.length > 0 ? (
                  agents.map((agent, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.business}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.earnings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.taxDeducted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {agent.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No agents found. Add POS agents to see them here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </ResponsiveTable>

        {/* Export Button */}
        <div className="p-6 border-t border-gray-100">
          <ExportButton
            tableRef={tableRef}
            options={{
              title: "POS Agents Report",
              fileName: "pos-agents-report.pdf",
              includeDate: true,
            }}
            disabled={loading || agents.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default BankDashboard;
