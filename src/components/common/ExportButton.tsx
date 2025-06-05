import React from "react";
import {
  exportTableToPDF,
  exportToPDF,
  ExportToPDFOptions,
} from "../../utils/exportPDF";

interface ExportButtonProps {
  tableRef?: React.RefObject<HTMLTableElement | null>;
  data?: Record<string, any>[];
  columns?: { header: string; dataKey: string }[];
  options?: ExportToPDFOptions;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
}

/**
 * A reusable button component for exporting data to PDF
 * Can work with either a table reference or data/columns for direct export
 */
const ExportButton: React.FC<ExportButtonProps> = ({
  tableRef,
  data,
  columns,
  options = {},
  disabled = false,
  className = "text-[#4400B8] text-sm font-medium hover:text-[#4400B8]/90 flex items-center gap-2",
  buttonText = "Export as PDF",
}) => {
  const handleExport = () => {
    if (tableRef && tableRef.current) {
      // If table reference is provided, use that
      exportTableToPDF(tableRef.current, options);
    } else if (data && columns) {
      // If data and columns are provided, use those
      exportToPDF(columns, data, options);
    } else {
      console.error("ExportButton requires either a tableRef or data/columns");
    }
  };

  return (
    <button className={className} onClick={handleExport} disabled={disabled}>
      {buttonText}
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
    </button>
  );
};

export default ExportButton;
