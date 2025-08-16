import axios from "axios";
import { api as API_BASE } from "../api/api";

// ------------------ Auth Header Utility ------------------
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ------------------ 1. Upload Books ------------------
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

// ------------------ 2. Get All Books (Central Repository) ------------------
export const fetchAllBooks = async () => {
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
    return books.map((book: any) => ({
      ...book,
      author2: book.author2 || "",
      fileUrl: book.fileUrl ? `${API_BASE}/Uploads/book/${book.fileUrl}` : "", // Ensure correct path
      previewUrl: book.previewUrl ? `${API_BASE}/Uploads/book/${book.previewUrl}` : "",
    }));
  } catch (error: any) {
    console.error("fetchAllBooks error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch books");
  }
};

// ------------------ 3. Get Processing Books ------------------
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
    return books.map((book: any) => ({
      ...book,
      totalPages: book.totalPages || 0,
      currentPage: book.currentPage || 0,
      ocrStatus: book.ocrStatus || "pending",
      structuredDataStatus: book.structuredDataStatus || "pending",
      structuredDataProgress: book.structuredDataProgress || 0,
      errorMessage: book.errorMessage || book.structuredDataErrorMessage || undefined,
    }));
  } catch (error: any) {
    console.error("fetchProcessingBooks error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch processing books");
  }
};

// ------------------ 4. Delete Books ------------------
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

// ------------------ 5. Update Book Visibility ------------------
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

// ------------------ 6. Complete OCR Process ------------------
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

// ------------------ 7. Add Books to Project ------------------
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

// ------------------ 8. Remove Books from Project ------------------
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

// ------------------ 9. Fetch Project Books ------------------
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
    return books.map((book: any) => ({
      ...book,
      author2: book.author2 || "",
      fileUrl: book.fileUrl ? `${API_BASE}/Uploads/book/${book.fileUrl}` : "",
      previewUrl: book.previewUrl ? `${API_BASE}/Uploads/book/${book.previewUrl}` : "",
    }));
  } catch (error: any) {
    console.error("fetchProjectBooks error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch project books");
  }
};

// ------------------ 10. Fetch Projects for Book ------------------
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

// ------------------ 11. Update Book Details ------------------
export const updateBookDetails = async (
  bookId: string,
  bookData: {
    bookName?: string;
    author: string; // Mandatory
    author2?: string; // Optional
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

// ------------------ Fetch Book File (PDF) ------------------
export const fetchBookFile = async (filePath: string): Promise<string> => {
  try {
    console.log(`fetchBookFile: Fetching book file: ${filePath}`);
    const response = await axios.get(`${API_BASE}/Uploads/book/${filePath}`, {
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

// ------------------ Fetch Book Preview Image ------------------
export const fetchBookPreviewImage = async (frontPageImagePath: string): Promise<string> => {
  try {
    console.log(`fetchBookPreviewImage: Fetching preview image: ${frontPageImagePath}`);
    const response = await axios.get(`${API_BASE}/Uploads/book/${frontPageImagePath}`, {
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

// ------------------ Fetch OCR Text File ------------------
export const fetchOcrText = async (bookId: string): Promise<string> => {
  try {
    console.log(`fetchOcrText: Fetching OCR text for book: ${bookId}`);
    const response = await axios.get(`${API_BASE}/api/books/${bookId}/ocr/text`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    console.log(`fetchOcrText: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "fetchOcrText: Error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch OCR text file");
  }
};

// ------------------ Fetch Structured Data File ------------------
export const fetchStructuredData = async (bookId: string): Promise<string> => {
  try {
    console.log(`fetchStructuredData: Fetching structured data for book: ${bookId}`);
    const response = await axios.get(`${API_BASE}/api/books/${bookId}/structured-data`, {
      headers: getAuthHeaders(),
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    console.log(`fetchStructuredData: Blob URL created: ${blobUrl}`);
    return blobUrl;
  } catch (error: any) {
    console.error(
      "fetchStructuredData: Error:",
      error.response ? { status: error.response.status, data: error.response.data } : error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch structured data file");
  }
};