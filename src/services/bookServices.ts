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
  const response = await axios.get(`${API_BASE}/api/books/`, {
    headers: getAuthHeaders(),
  });
  return response.data.books;
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
