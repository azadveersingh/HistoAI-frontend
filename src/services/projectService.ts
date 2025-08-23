import axios from "axios";
import { api as API_BASE } from "../api/api";
import axiosWithAuth from "../utils/axiosWithAuth";
const axiosInstance = axiosWithAuth();

// Get JWT auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ------------------ GET: My Projects ------------------
export const fetchMyProjects = async () => {
  const response = await axiosInstance.get(`${API_BASE}/api/projects/my`, {
    headers: getAuthHeaders(),
  });
  return response.data.projects;
};

// ------------------ GET: Specific My Project ------------------
export const fetchMyProjectById = async (projectId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE}/api/projects/my/${projectId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// ------------------ GET: Any Project by ID (admin/debug only) ------------------
export const fetchProjectById = async (projectId: string) => {
  const response = await axiosInstance.get(`${API_BASE}/api/projects/${projectId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ------------------ POST: Create Project ------------------
export const createProject = async (projectData: {
  name: string;
  // memberIds?: string[];
  collectionIds?: string[];
  bookIds?: string[];
  chatHistoryId?: string;
}) => {
  const response = await axiosInstance.post(`${API_BASE}/api/projects`, projectData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ------------------ PATCH: Update Project ------------------
export const updateProject = async (
  projectId: string,
  updateData: Partial<{
    name: string;
    // memberIds: string[];
    collectionIds: string[];
    bookIds: string[];
    chatHistoryId: string;
  }>
) => {
  const response = await axiosInstance.patch(
    `${API_BASE}/api/projects/${projectId}`,
    updateData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// ------------------ DELETE: Delete Project ------------------
export const deleteProject = async (projectId: string) => {
  const response = await axiosInstance.delete(`${API_BASE}/api/projects/${projectId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
