import axios from "axios";
import { api as API_BASE } from "../api/api";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};


// export const fetchStructuredData = async (bookId: string): Promise<string> => {
//   try {
//     console.log(`fetchStructuredData: Fetching structured data for book: ${bookId}`);
//     const response = await axios.get(`${API_BASE}/api/books/${bookId}/structured-data`, {
//       headers: getAuthHeaders(),
//       responseType: "blob",
//     });
//     const blobUrl = URL.createObjectURL(response.data);
//     console.log(`fetchStructuredData: Blob URL created: ${blobUrl}`);
//     // Trigger automatic download
//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = `${bookId}_structured.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(blobUrl);
//     return blobUrl;
//   } catch (error: any) {
//     console.error(
//       "fetchStructuredData: Error:",
//       error.response ? { status: error.response.status, data: error.response.data } : error.message
//     );
//     throw new Error(error.response?.data?.error || "Failed to fetch structured data file");
//   }
// };

export const fetchBookStructuredData = async (bookId: string): Promise<any> => {
  try {
    console.log(`fetchBookStructuredData: Fetching structured data for book: ${bookId}`);
    const response = await axios.get(`${API_BASE}/api/structured/book/${bookId}`, {
      headers: getAuthHeaders(),
    });
    console.log("fetchBookStructuredData response:", response.data);
    return response.data.data || [];
  } catch (error: any) {
    console.error(
      "fetchBookStructuredData error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch structured data for book");
  }
};

export const fetchProjectStructuredData = async (
  projectId: string,
  collectionIds: string[] = [],
  bookIds: string[] = []
): Promise<any> => {
  try {
    console.log(`fetchProjectStructuredData: Fetching structured data for project: ${projectId}`, {
      collectionIds,
      bookIds,
    });
    const response = await axios.post(
      `${API_BASE}/api/structured/project/${projectId}`,
      { collectionIds, bookIds },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    console.log("fetchProjectStructuredData response:", response.data);
    return response.data.data || [];
  } catch (error: any) {
    console.error(
      "fetchProjectStructuredData error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch project structured data");
  }
};


export const downloadBookStructuredExcel = async (bookId: string): Promise<{ blobUrl: string, filename: string }> => {
  try {
    const response = await axios.get(
      `${API_BASE}/api/structured/book/${bookId}/export-excel`,
      {
        headers: getAuthHeaders(),
        responseType: "blob",
      }
    );

    // Extract filename from Content-Disposition header
    let filename = "data.xlsx";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/"/g, "");
    }

    const blob = new Blob(
      [response.data],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, filename };
  } catch (error: any) {
    console.error("downloadBookStructuredExcel error:", error);
    throw new Error(error.response?.data?.error || "Failed to download structured Excel file");
  }
};

export const downloadProjectStructuredExcel = async (
  projectId: string,
  collectionIds: string[] = [],
  bookIds: string[] = []
): Promise<{ blobUrl: string; filename: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/structured/project/${projectId}/export-excel`,
      { collectionIds, bookIds },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    // ✅ Extract filename from Content-Disposition header
    let filename = "download.xlsx";
    const disposition = response.headers["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, filename };
  } catch (error: any) {
    console.error("downloadProjectStructuredExcel error:", error);
    throw new Error(error.response?.data?.error || "Failed to download project structured Excel");
  }
};