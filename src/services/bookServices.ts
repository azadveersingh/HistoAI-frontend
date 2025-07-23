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
  // Debug: Log FormData content before sending
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
    console.log("fetchAllBooks response:", response.data); // Debug log
    const books = response.data.books || [];
    if (!Array.isArray(books)) {
      console.error("fetchAllBooks: Expected an array, got:", response.data.books);
      return [];
    }
    return books;
  } catch (error) {
    console.error("fetchAllBooks error:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

// ------------------ 3. Delete Book ------------------
export const deleteBook = async (bookId: string) => {
  const response = await axios.delete(`${API_BASE}/api/books/${bookId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ------------------ 4. Update Book Visibility ------------------
export const updateBookVisibility = async (
  bookId: string,
  visibility: "private" | "public"
) => {
  const response = await axios.patch(
    `${API_BASE}/api/books/${bookId}/visibility`,
    { visibility },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const addBooksToProject = async (projectId: string, bookIds: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/books/${projectId}/add`,
      { bookIds },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("addBooksToProject error:", error);
    throw error;
  }
};

export const removeBooksFromProject = async (projectId: string, bookIds: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/books/${projectId}/remove`,
      { bookIds },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("removeBooksFromProject error:", error);
    throw error;
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
    return books;
  } catch (error) {
    console.error("fetchProjectBooks error:", error);
    throw error;
  }
};