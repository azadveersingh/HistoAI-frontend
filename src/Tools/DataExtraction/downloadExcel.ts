import { downloadBookStructuredExcel, downloadProjectStructuredExcel } from "../../services/structuredDataServices";

export const downloadExcel = async (
  bookId?: string,
  projectId?: string,
  selectedBooks: string[] = [],
  selectedCollections: string[] = [],
  filename: string = "data.xlsx"
) => {
  try {
    let blobUrl: string;
    if (bookId) {
      blobUrl = await downloadBookStructuredExcel(bookId);
    } else if (projectId) {
      blobUrl = await downloadProjectStructuredExcel(projectId, selectedCollections, selectedBooks);
    } else {
      throw new Error("Either bookId or projectId must be provided");
    }

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading Excel:", error);
  }
};