
import axios from "axios";
import { api as API_BASE } from "../api/api";

interface User {
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar: string | null;
}

interface UpdateProfileData {
  fullName?: string;
  avatar?: string;
}

export const getProfile = async (): Promise<User> => {
  try {
    const response = await axios.get(`${API_BASE}/user/api/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const msg = error?.response?.data?.error || "Failed to fetch profile. Please try again.";
    throw new Error(msg);
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    const response = await axios.put(`${API_BASE}/user/api/profile`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.user;
  } catch (error: any) {
    const msg = error?.response?.data?.error || "Failed to update profile. Please try again.";
    throw new Error(msg);
  }
};

export const updateProfileWithImage = async (fullName: string, file: File | null): Promise<User> => {
  try {
    const formData = new FormData();
    if (fullName) formData.append("fullName", fullName);
    if (file) formData.append("avatar", file);
    
    const response = await axios.put(`${API_BASE}/user/api/profile`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.user;
  } catch (error: any) {
    const msg = error?.response?.data?.error || "Failed to update profile. Please try again.";
    throw new Error(msg);
  }
};