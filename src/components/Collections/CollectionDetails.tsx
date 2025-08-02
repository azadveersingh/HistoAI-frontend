import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCollectionById, updateCollection, deleteCollection } from "../../services/collectionServices";
import { fetchAllBooks } from "../../services/bookServices";
import { fetchAllUsers } from "../../services/adminService";
import { fetchMyProjects } from "../../services/projectService";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
import ConfirmDialogWithInput from "../../components/ui/confirmation/ConfirmDialogWithInput";
import { Edit2 } from 'lucide-react';
import AllBooks from "../Books/AllBooks";
import CollectionBooks from "../Books/CollectionBooks";

interface Collection {
  _id: string;
  name: string;
  bookIds: string[];
  projectIds?: string[];
  projectNames?: string[];
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

interface Book {
  _id: string;
  bookName: string;
}

interface User {
  _id: string;
  fullName: string;
}

interface Project {
  _id: string;
  name: string;
}

export default function CollectionDetails() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [createdByName, setCreatedByName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"collectionBooks" | "allBooks">("collectionBooks");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Collection ID from useParams:", collectionId);
        if (!collectionId) throw new Error("No collection ID provided");

        const [collectionData, allBooks, users, projects] = await Promise.all([
          fetchCollectionById(collectionId),
          fetchAllBooks(),
          fetchAllUsers(),
          fetchMyProjects(),
        ]);

        // console.log("Fetched collection data:", collectionData);
        // console.log("Fetched all books:", allBooks);
        // console.log("Fetched all users:", users);
        // console.log("Fetched all projects:", projects);

        const userMap = new Map(users.map((u: User) => [u._id, u.fullName]));
        const projectMap = new Map(projects.map((p: Project) => [p._id, p.name]));

        const normalizedCollection: Collection = {
          _id: collectionData._id || collectionData.id,
          name: collectionData.name || "Unnamed Collection",
          bookIds: Array.isArray(collectionData.bookIds) ? collectionData.bookIds : [],
          projectIds: Array.isArray(collectionData.projectIds) ? collectionData.projectIds : [],
          projectNames: [],
          createdBy: collectionData.createdBy || collectionData.created_by,
          createdByName: collectionData.createdByName || undefined,
          createdAt: collectionData.createdAt || collectionData.created_at,
          updatedAt: collectionData.updatedAt || collectionData.updated_at,
        };

        const finalProjectNames = normalizedCollection.projectIds.length > 0
          ? normalizedCollection.projectIds.map((pid: string) => projectMap.get(pid) || "Unknown Project")
          : [];
        const finalCreatedByName = normalizedCollection.createdByName || userMap.get(normalizedCollection.createdBy) || "Unknown";

        setCollection(normalizedCollection);
        setProjectNames(finalProjectNames);
        setCreatedByName(finalCreatedByName);
        setBooks(allBooks);
        setCheckedBooks(normalizedCollection.bookIds);
        setNewName(normalizedCollection.name);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load collection details";
        setError(errorMessage);
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionId]);

  const handleRenameCollection = async () => {
    if (!collectionId || !newName.trim() || newName === collection?.name) {
      setAlert({
        variant: "info",
        title: "No Changes",
        message: "Please provide a different name for the collection.",
      });
      setShowRenameConfirm(false);
      return;
    }
    try {
      await updateCollection(collectionId, { name: newName.trim() });
      setCollection((prev) => prev ? { ...prev, name: newName.trim() } : null);
      setAlert({
        variant: "success",
        title: "Collection Renamed",
        message: "Collection name updated successfully.",
      });
    } catch (err: any) {
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "Failed to rename collection.",
      });
    } finally {
      setShowRenameConfirm(false);
      setIsEditing(false);
    }
  };

  const handleDeleteCollection = async (input: string) => {
    if (input.toLowerCase() !== "delete") {
      setAlert({
        variant: "error",
        title: "Invalid Input",
        message: "Please type 'Delete' to confirm deletion.",
      });
      return;
    }

    if (!collectionId) return;

    try {
      await deleteCollection(collectionId);
      setAlert({
        variant: "success",
        title: "Collection Deleted",
        message: "Collection deleted successfully.",
      });
      setTimeout(() => navigate("/dashboard/collections"), 1500);
    } catch (err: any) {
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "Failed to delete collection.",
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newName.trim() && collectionId && newName !== collection?.name) {
      setShowRenameConfirm(true);
    } else if (e.key === 'Escape') {
      setNewName(collection?.name || '');
      setIsEditing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) return (
    <div className="text-gray-600 dark:text-gray-400 animate-pulse">
      Loading collection details...
    </div>
  );
  if (error || !collection) return (
    <div className="flex items-center text-red-600 dark:text-red-400">
      <span>{error || "Collection not found"}</span>
      <button
        className="ml-4 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900"
        onClick={() => navigate("/dashboard/collections")}
      >
        Back to Collections
      </button>
    </div>
  );

  return (
    <ComponentCard
      title={
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-center items-center">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                className="text-2xl font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-center"
                autoFocus
                aria-label="Edit collection name"
              />
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 tracking-tight">
                  {collection.name}
                </h1>
                <button
                  onClick={handleEditClick}
                  className="ml-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                  aria-label={`Edit collection ${collection.name}`}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="primary"
              className="text-sm py-1 px-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Collection
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Projects</label>
            <ul className="mt-1 text-sm text-gray-900 dark:text-gray-100 list-disc pl-5">
              {projectNames.length > 0 ? (
                projectNames.map((name, index) => (
                  <li key={index} className="mb-1">
                    {name}
                  </li>
                ))
              ) : (
                <li>Not assigned to any projects</li>
              )}
            </ul>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Created By</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{createdByName}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Created</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(collection.createdAt)}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Updated</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(collection.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("collectionBooks")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "collectionBooks"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              Collection Books
            </button>
            <button
              onClick={() => setActiveTab("allBooks")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "allBooks"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              All Books
            </button>
          </div>
        </div>

        <div className="min-h-[calc(100vh-220px)]">
          {activeTab === "collectionBooks" ? (
            <CollectionBooks
              collectionId={collectionId!}
              searchQuery={searchQuery}
              onBooksRemoved={(removedBookIds: string[]) => {
                setCheckedBooks((prev) => prev.filter((id) => !removedBookIds.includes(id)));
                setCollection((prev) =>
                  prev ? { ...prev, bookIds: prev.bookIds.filter((id) => !removedBookIds.includes(id)) } : prev
                );
              }}
            />
          ) : (
            <AllBooks
              searchQuery={searchQuery}
              isCentralRepository={false}
              collectionId={collectionId}
              onBooksAdded={(newBookIds: string[]) => {
                setCheckedBooks((prev) => [...prev, ...newBookIds]);
                setCollection((prev) =>
                  prev ? { ...prev, bookIds: [...prev.bookIds, ...newBookIds] } : prev
                );
              }}
            />
          )}
        </div>

        <ConfirmDialog
          isOpen={showRenameConfirm}
          message="Are you sure you want to rename the collection?"
          onConfirm={handleRenameCollection}
          onCancel={() => {
            setNewName(collection?.name || '');
            setShowRenameConfirm(false);
            setIsEditing(false);
          }}
          confirmText="OK"
          isDestructive={false}
        />

        <ConfirmDialogWithInput
          isOpen={showDeleteConfirm}
          message='To confirm deleting the collection, please type "Delete" below:'
          onConfirm={handleDeleteCollection}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Delete"
          isDestructive={true}
        />
      </div>
    </ComponentCard>
  );
}