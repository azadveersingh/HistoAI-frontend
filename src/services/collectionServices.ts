import axios from "axios";
import { api as API_BASE } from "../api/api";

// Get JWT auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ---------- 1. GET: All visible collections (createdBy or shared via project) ----------
export const fetchVisibleCollections = async () => {
  const response = await axios.get(`${API_BASE}/api/collections`, {
    headers: getAuthHeaders(),
  });
  console.log("Fetched collections : ", response.data);
  return response.data.collections; // assuming response = { collections: [...] }
};

// ---------- 2. GET: Single collection by ID ----------
export const fetchCollectionById = async (collectionId: string) => {
  const response = await axios.get(`${API_BASE}/api/collections/${collectionId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ---------- 3. POST: Create a new collection ----------
export const createCollection = async (data: {
  name: string;
  bookIds: string[];
  projectId?: string;
  memberIds?: string[];
}) => {
  const response = await axios.post(`${API_BASE}/api/collections`, data, {
    headers: getAuthHeaders(),
  });
  return response.data; // should contain { message, collectionId }
};

// ---------- 4. PATCH: Update a collection (own collections only) ----------
export const updateCollection = async (
  collectionId: string,
  data: {
    name?: string;
    bookIds?: string[];        // full replace
    addBookIds?: string[];     // add only
    removeBookIds?: string[];  // remove only
  }
) => {
  const response = await axios.patch(
    `${API_BASE}/api/collections/${collectionId}`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// ---------- 5. DELETE: Delete a collection (own collections only) ----------
export const deleteCollection = async (collectionId: string) => {
  const response = await axios.delete(`${API_BASE}/api/collections/${collectionId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchProjectCollections = async (projectId: string) => {
  try {
    const response = await axios.get(`${API_BASE}/api/collections/projects/${projectId}/collections`, {
      headers: getAuthHeaders(),
    });
    console.log("fetchProjectCollections response:", response.data);
    const collections = response.data.collections || [];
    if (!Array.isArray(collections)) {
      console.error("fetchProjectCollections: Expected an array, got:", response.data.collections);
      return [];
    }
    return collections;
  } catch (error) {
    console.error("fetchProjectCollections error:", error);
    throw error;
  }
};

export const addCollectionsToProject = async (projectId: string, collectionIds: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/collections/${projectId}/add`,
      { collectionIds },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("addCollectionsToProject error:", error);
    throw error;
  }
};

export const removeCollectionsFromProject = async (projectId: string, collectionIds: string[]) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/collections/${projectId}/remove`,
      { collectionIds },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("removeCollectionsFromProject error:", error);
    throw error;
  }
};