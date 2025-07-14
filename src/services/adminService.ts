import axios from "axios";
import { api as API_BASE}  from "../api/api";

export const fetchAllUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}/api/admin/users`,{
    headers: {
        Authorization:`Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${API_BASE}/api/admin/users/${userId}`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }