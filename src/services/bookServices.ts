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
    throw error;
  }
};

// ------------------ 2. Get All Books (Admin/BM/PM/USER) ------------------
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
      author2: book.author2 || "", // Default to empty string if not present
    }));
  } catch (error) {
    console.error("fetchAllBooks error:", error);
    throw error;
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
      author2: book.author2 || "", // Default to empty string if not present
    }));
  } catch (error) {
    console.error("fetchProcessingBooks error:", error);
    throw error;
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
    throw error;
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
    throw error;
  }
};

// ------------------ 6. Complete OCR Process ------------------
export const completeOcrProcess = async (bookId: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/books/${bookId}/ocr/complete`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    console.log("completeOcrProcess: Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("completeOcrProcess: Error:", error.response?.data || error.message);
    throw error;
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
  } catch (error) {
    console.error("addBooksToProject error:", error);
    throw error;
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
  } catch (error) {
    console.error("removeBooksFromProject error:", error);
    throw error;
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
      author2: book.author2 || "", // Default to empty string if not present
    }));
  } catch (error) {
    console.error("fetchProjectBooks error:", error);
    throw error;
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
  } catch (error) {
    console.error("fetchProjectsForBook error:", error);
    throw error;
  }
};


// ------------------ 2. Update Book Details ------------------
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
    throw error;
  }
};