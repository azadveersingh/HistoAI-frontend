import axios from "axios";
import { api as API_BASE } from "../api/api";

export const fetchAllUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // console.log("All Users:", response.data);
  return response.data;
};

export const fetchProjectMembers = async (projectId: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE}/api/admin/projects/${projectId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Project Members:", response.data);
    const members = response.data.members || [];
    if (!Array.isArray(members)) {
      console.error("fetchProjectMembers: Expected an array, got:", response.data.members);
      return [];
    }
    return members;
  } catch (error) {
    console.error("fetchProjectMembers error:", error);
    throw error;
  }
};

export const addMembersToProject = async (projectId: string, memberIds: string[]) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE}/api/admin/projects/${projectId}/members`,
      { memberIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Add members response:", response.data);
    return response.data;
  } catch (error) {
    console.error("addMembersToProject error:", error);
    throw error;
  }
};

export const removeMembersFromProject = async (projectId: string, memberIds: string[]) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE}/api/admin/projects/${projectId}/members/remove`,
      { memberIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Remove members response:", response.data);
    return response.data;
  } catch (error) {
    console.error("removeMembersFromProject error:", error);
    throw error;
  }
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
};

export const changeUserRole = async (userId: string, newRole: string) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.patch(
      `${API_BASE}/api/admin/users/${userId}/role`,
      { role: newRole },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Role update response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("API error in changeUserRole:", err?.response || err?.message);
    throw err;
  }
};