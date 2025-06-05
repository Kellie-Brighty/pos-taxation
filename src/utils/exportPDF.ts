import jsPDF from "jspdf";
import "jspdf-autotable";
import { autoTable } from "jspdf-autotable";

interface TableColumn {
  header: string;
  dataKey: string;
}

export interface ExportToPDFOptions {
  title?: string;
  fileName?: string;
  orientation?: "portrait" | "landscape";
  pageSize?: string;
  includeDate?: boolean;
}

/**
 * Exports data to a PDF file
 * @param columns Column definitions with header text and data key
 * @param data Array of data objects to be exported
 * @param options Configuration options for the PDF
 */
export const exportToPDF = (
  columns: TableColumn[],
  data: Record<string, any>[],
  options: ExportToPDFOptions = {}
): void => {
  // Set default options
  const {
    title = "Data Export",
    fileName = "table-export.pdf",
    orientation = "portrait",
    pageSize = "a4",
    includeDate = true,
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: pageSize,
  });

  // Add title
  doc.setFontSize(16);
  doc.setTextColor(64, 0, 184); // #4400B8 in RGB
  doc.text(title, 14, 22);

  // Add date if required
  if (includeDate) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString();
    doc.text(`Generated: ${today}`, 14, 30);
  }

  // Extract headers and keys for table
  const headers = columns.map((col) => col.header);
  const dataKeys = columns.map((col) => col.dataKey);

  // Format data for autoTable
  const tableData = data.map((item) =>
    dataKeys.map((key) => (item[key] !== undefined ? item[key] : ""))
  );

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: includeDate ? 35 : 30,
    headStyles: {
      fillColor: [68, 0, 184], // #4400B8
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { top: 10 },
  });

  // Save the PDF
  doc.save(fileName);
};

/**
 * A simpler version that takes a table element and exports its content
 * @param tableElement HTML table element to export
 * @param options Configuration options for the PDF
 */
export const exportTableToPDF = (
  tableElement: HTMLTableElement,
  options: ExportToPDFOptions = {}
): void => {
  if (!tableElement) {
    console.error("No table element provided");
    return;
  }

  // Set default options
  const {
    title = "Table Export",
    fileName = "table-export.pdf",
    orientation = "portrait",
    pageSize = "a4",
    includeDate = true,
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: pageSize,
  });

  // Add title
  doc.setFontSize(16);
  doc.setTextColor(64, 0, 184); // #4400B8
  doc.text(title, 14, 22);

  // Add date if required
  if (includeDate) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString();
    doc.text(`Generated: ${today}`, 14, 30);
  }

  // Use autoTable to create the table from the HTML element
  autoTable(doc, { html: tableElement, startY: includeDate ? 35 : 30 });

  // Save the PDF
  doc.save(fileName);
};

export default {
  exportToPDF,
  exportTableToPDF,
};
