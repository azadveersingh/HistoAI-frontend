import axios from "axios";
import { api as API_BASE } from "../api/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const uploadBooks = async (formData: FormData) => {
  console.log("uploadBooks: Sending FormData with entries:");
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key} = ${value instanceof File ? value.name : value}`);
  }

  try {
    const response = await axios.post(`${API_BASE}/api/books/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("uploadBooks: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("uploadBooks: Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to upload books");
  }
};

export const fetchAllBooks = async (visibilityFilter: "public" | "all" = "public") => {
  try {
    const response = await axios.get(`${API_BASE}/api/books/`, {
      headers: getAuthHeaders(),
    });
    console.log("fetchAllBooks response:", response.data);
    const books = response.data.books || [];
    if (!Array.isArray(books)) {
      console.error("fetchAllBooks: Expected an array, got:", response.data.books);
      return [];
    }
    const filteredBooks = books.filter((book: any) => {
      if (!book || !book._id || typeof book._id !== "string") {
        console.warn("Invalid book object filtered out:", book);
        return false;
      }
      return visibilityFilter === "all" || book.visibility === "public";
    });
    return filteredBooks.map((book: any) => {
      const cleanPreviewUrl = book.previewUrl ? book.previewUrl.replace(/^\/+/, "") : "";
      const cleanFrontPageImagePath = book.frontPageImagePath ? book.frontPageImagePath.replace(/^\/+/, "") : "";
      return {
        ...book,
        author2: book.author2 || "",
        previewUrl: cleanPreviewUrl ? `${API_BASE}/Uploads/book/${cleanPreviewUrl}` : "",
        frontPageImagePath: cleanFrontPageImagePath ? `${API_BASE}/Uploads/book/${cleanFrontPageImagePath}` : "",
      };
    });
  } catch (error: any) {
    console.error("fetchAllBooks error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch books");
  }
};

export const fetchProcessingBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/books/processing`, {
      headers: getAuthHeaders(),
    });
    console.log("fetchProcessingBooks response:", response.data);
    const books = response.data.books || [];
    if (!Array.isArray(books)) {
      console.error("fetchProcessingBooks: Expected an array, got:", response.data.books);
      return [];
    }
    return books.map((book: any) => {
      const cleanPreviewUrl = book.previewUrl ? book.previewUrl.replace(/^\/+/, "") : "";
      const cleanFrontPageImagePath = book.frontPageImagePath ? book.frontPageImagePath.replace(/^\/+/, "") : "";
      return {
        ...book,
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage || 0,
        ocrStatus: book.ocrStatus || "pending",
        structuredDataStatus: book.structuredDataStatus || "pending",
        structuredDataProgress: book.structuredDataProgress || 0,
        errorMessage: book.errorMessage || book.structuredDataErrorMessage || undefined,
        previewUrl: cleanPreviewUrl ? `${API_BASE}/Uploads/book/${cleanPreviewUrl}` : "",
        frontPageImagePath: cleanFrontPageImagePath ? `${API_BASE}/Uploads/book/${cleanFrontPageImagePath}` : "",
      };
    });
  } catch (error: any) {
    console.error("fetchProcessingBooks error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch processing books");
  }
};

export const deleteBooks = async (bookIds: string[]) => {
  try {
    console.log("deleteBooks: Sending request to delete books:", bookIds);
    const response = await axios.post(`${API_BASE}/api/books/delete`, { bookIds }, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    console.log("deleteBooks: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("deleteBooks: Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to delete books");
  }
};

export const updateBookVisibility = async (
  bookId: string,
  visibility: "private" | "public"
) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/api/books/${bookId}/visibility`,
      { visibility },
      {
        headers: getAuthHeaders(),
      }
    );
    console.log("updateBookVisibility: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("updateBookVisibility: Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to update book visibility");
  }
};

export const completeOcrProcess = async (bookId: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/books/${bookId}/ocr/complete`,
      {},
      { headers: getAuthHeaders() }
    );
    console.log("completeOcrProcess response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("completeOcrProcess error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to complete OCR process");
  }
};

export const addBooksToProject = async (projectId: string, bookIds: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/books/${projectId}/add`,
      { bookIds },
      { headers: getAuthHeaders() }
    );
    console.log("addBooksToProject: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("addBooksToProject error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to add books to project");
  }
};

export const removeBooksFromProject = async (projectId: string, bookIds: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/books/${projectId}/remove`,
      { bookIds },
      { headers: getAuthHeaders() }
    );
    console.log("removeBooksFromProject: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("removeBooksFromProject error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to remove books from project");
  }
};

export const fetchProjectBooks = async (projectId: string) => {
  try {
    const response = await axios.get(`${API_BASE}/api/books/projects/${projectId}/books`, {
      headers: getAuthHeaders(),
    });
    console.log("fetchProjectBooks response:", response.data);
    const books = response.data.books || [];
    if (!Array.isArray(books)) {
      console.error("fetchProjectBooks: Expected an array, got:", response.data.books);
      return [];
    }
    const filteredBooks = books.filter((book: any) => {
      if (!book || !book._id || typeof book._id !== "string") {
        console.warn("Invalid book object filtered out:", book);
        return false;
      }
      return book.visibility === "public"; // Only public books for projects
    });
    return filteredBooks.map((book: any) => {
      const cleanPreviewUrl = book.previewUrl ? book.previewUrl.replace(/^\/+/, "") : "";
      const cleanFrontPageImagePath = book.frontPageImagePath ? book.frontPageImagePath.replace(/^\/+/, "") : "";
      return {
        ...book,
        author2: book.author2 || "",
        previewUrl: cleanPreviewUrl ? `${API_BASE}/Uploads/book/${cleanPreviewUrl}` : "",
        frontPageImagePath: cleanFrontPageImagePath ? `${API_BASE}/Uploads/book/${cleanFrontPageImagePath}` : "",
      };
    });
  } catch (error: any) {
    console.error("fetchProjectBooks error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch project books");
  }
};

export const fetchProjectsForBook = async (bookId: string) => {
  try {
    const response = await axios.get(`${API_BASE}/api/books/${bookId}/projects`, {
      headers: getAuthHeaders(),
    });
    console.log("fetchProjectsForBook response:", response.data);
    const projects = response.data.projects || [];
    if (!Array.isArray(projects)) {
      console.error("fetchProjectsForBook: Expected an array, got:", response.data.projects);
      return [];
    }
    return projects;
  } catch (error: any) {
    console.error("fetchProjectsForBook error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch projects for book");
  }
};

export const updateBookDetails = async (
  bookId: string,
  bookData: {
    bookName?: string;
    author: string;
    author2?: string;
    edition?: string;
  }
) => {
  try {
    console.log("updateBookDetails: Sending request to update book:", bookId, bookData);
    const response = await axios.patch(
      `${API_BASE}/api/books/${bookId}/update`,
      bookData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    console.log("updateBookDetails: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("updateBookDetails: Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to update book details");
  }
};

export const fetchBookFile = async (previewUrl: string): Promise<string> => {
  try {
    console.log(`fetchBookFile: Fetching book file: ${previewUrl}`);
    const cleanPath = previewUrl.replace(`${API_BASE}/Uploads/book/`, "").replace(/^\/+/, "");
    console.log(`fetchBookFile: Cleaned path: ${cleanPath}`);
    const response = await axios.get(`${API_BASE}/Uploads/book/${cleanPath}`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    console.log(`fetchBookFile: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "fetchBookFile: Error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch book file");
  }
};

export const fetchBookPreviewImage = async (frontPageImagePath: string): Promise<string> => {
  try {
    console.log(`fetchBookPreviewImage: Fetching preview image: ${frontPageImagePath}`);
    const cleanPath = frontPageImagePath.replace(`${API_BASE}/Uploads/book/`, "").replace(/^\/+/, "");
    console.log(`fetchBookPreviewImage: Cleaned path: ${cleanPath}`);
    const response = await axios.get(`${API_BASE}/Uploads/book/${cleanPath}`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    console.log(`fetchBookPreviewImage: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "fetchBookPreviewImage: Error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch preview image");
  }
};

export const fetchOcrText = async (bookId: string): Promise<string> => {
  try {
    console.log(`fetchOcrText: Fetching OCR text for book: ${bookId}`);
    const response = await axios.get(`${API_BASE}/api/books/${bookId}/ocr/text`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    console.log(`fetchOcrText: Blob URL created: ${blobUrl}`);
    // Trigger automatic download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${bookId}_OCR.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "fetchOcrText: Error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch OCR text file");
  }
};

export const fetchOcrZip = async (bookId: string): Promise<string> => {
  try {
    console.log(`fetchOcrZip: Fetching OCR ZIP for book: ${bookId}`);
    const response = await axios.get(`${API_BASE}/api/books/${bookId}/ocr/zip`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    console.log(`fetchOcrZip: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "fetchOcrZip: Error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch OCR ZIP file");
  }
};