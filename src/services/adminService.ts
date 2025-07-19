import axios from "axios";
import { api as API_BASE}  from "../api/api";

export const fetchAllUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}/api/admin/users`,{
    headers: {
        Authorization:`Bearer ${token}`,
    },
  });
  console.log("All Users :",response.data)
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

  export const changeUserRole = async (userId: string, newRole: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(
        `${API_BASE}/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      console.log("Role update response:", response.data);
      return response.data;
    } catch (err: any) {
      console.error("API error in changeUserRole:", err?.response || err?.message);
      throw err; 
    }
  };
  
  