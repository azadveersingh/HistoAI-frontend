import axios from "axios";
import { api as API_BASE } from "../api/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

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

export const downloadBookStructuredExcel = async (bookId: string): Promise<string> => {
  try {
    console.log(`downloadBookStructuredExcel: Downloading structured Excel for book: ${bookId}`);
    const response = await axios.get(`${API_BASE}/api/structured/book/${bookId}/export-excel`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
const blobUrl = URL.createObjectURL(blob);

    console.log(`downloadBookStructuredExcel: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "downloadBookStructuredExcel error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to download structured Excel file");
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

export const downloadProjectStructuredExcel = async (
  projectId: string,
  collectionIds: string[] = [],
  bookIds: string[] = []
): Promise<string> => {
  try {
    console.log(`downloadProjectStructuredExcel: Downloading structured Excel for project: ${projectId}`, {
      collectionIds,
      bookIds,
    });
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
    const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
const blobUrl = URL.createObjectURL(blob);

    console.log(`downloadProjectStructuredExcel: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "downloadProjectStructuredExcel error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to download project structured Excel");
  }
};