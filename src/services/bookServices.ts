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
  const response = await axios.post(`${API_BASE}/api/books/upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
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
