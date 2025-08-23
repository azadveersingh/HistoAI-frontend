import * as XLSX from "xlsx";
import { TableRow } from "./types";

export const downloadExcel = (
  rows: TableRow[],
  filename: string
) => {
  try {
    // Define headers to match the UI table
    const headers = [
      "Event Name",
      "Description",
      "Participants/People",
      "Location",
      "Place",
      "Start Date",
      "End Date",
      "Key Details",
      "Day",
      "Month",
      "Year",
      "General Comments",
      "SourceURL",
    ];

    // Filter headers to only include those present in rows
    const validHeaders = headers.filter(header => 
      rows.some(row => row[header] !== undefined)
    );

    // Convert rows to worksheet data
    const worksheetData = [
      validHeaders, // Header row
      ...rows.map(row => 
        validHeaders.map(header => row[header] || "N/A")
      )
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "data.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading Excel:", error);
    throw new Error("Failed to generate Excel file");
  }
};