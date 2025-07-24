import React, { useEffect, useState } from "react";
import {
    fetchVisibleCollections,
    deleteCollection,
    fetchCollectionById,
    updateCollection,
} from "../../services/collectionServices";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { fetchAllBooks } from "../../services/bookServices";
import { fetchMyProjects, fetchProjectById } from "../../services/projectService";
import { fetchAllUsers } from "../../services/adminService";



const CollectionManager: React.FC = () => {
    const [collections, setCollections] = useState<any[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [viewMode, setViewMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [bookOptions, setBookOptions] = useState<any[]>([]);
    const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);



    // Fetch collections on load
    useEffect(() => {
        loadCollections();
        loadBooks();
        loadProjectsAndUsers();
    }, []);

    const loadBooks = async () => {
        try {
            const books = await fetchAllBooks();
            setBookOptions(books);
        } catch (err) {
            setError("Failed to load books");
        }
    };
    const loadCollections = async () => {
        try {
            const data = await fetchVisibleCollections();
            setCollections(data);
        } catch (err) {
            setError("Failed to load collections");
        }
    };

    const loadProjectsAndUsers = async () => {
        try {
            const [projectsData, usersData] = await Promise.all([
                fetchMyProjects(), // or fetch all if you're admin
                fetchAllUsers()
            ]);
            setProjects(projectsData);
            setUsers(usersData.users || usersData); // in case of different shape
        } catch (err) {
            setError("Failed to load project/user info");
        }
    };

    const handleView = async (id: string) => {
        setLoading(true);
        const data = await fetchCollectionById(id);
        setSelectedCollection(data.collection);
        setViewMode(true);
        setEditMode(false);
        setLoading(false);
    };

    const handleEdit = async (id: string) => {
        setLoading(true);
        const data = await fetchCollectionById(id);
        setSelectedCollection(data.collection);
        setSelectedBooks(data.collection.bookIds || []);
        setName(data.collection.name);
        setViewMode(false);
        setEditMode(true);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this collection?")) {
            try {
                await deleteCollection(id);
                alert("Deleted successfully");
                await loadCollections();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const handleUpdate = async () => {
        if (!name.trim()) return alert("Name is required");
        try {
            setLoading(true);
            await updateCollection(selectedCollection._id, {
                name,
                bookIds: selectedBooks,
            });
            setEditMode(false);
            setSelectedCollection(null);
            loadCollections();
        } catch (err) {
            alert("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const closeModes = () => {
        setViewMode(false);
        setEditMode(false);
        setSelectedCollection(null);
        setName("");
    };
    const getProjectName = (projectId: string) => {
        const project = projects.find(p => p._id === projectId);
        return project ? project.name : "Unknown Project";
    };
    
    const getUserName = (userId: string) => {
        const user = users.find(u => u._id === userId);
        return user ? user.fullName || user.name || user.email : "Unknown User";
    };
    
    return (
        <ComponentCard title="Collection Manager">
            {error && <p className="text-red-600">{error}</p>}

            {/* Collection List */}
            <div className="space-y-2 mb-6">
                {collections.map((col) => (
                    <div
                        key={col._id}
                        className="flex justify-between items-center border-b pb-2"
                    >
                        <span className="font-medium">{col.name}</span>
                        <div className="flex space-x-3 text-sm">
                            <button onClick={() => handleView(col._id)} className="text-blue-600 hover:underline">
                                View
                            </button>
                            <button onClick={() => handleEdit(col._id)} className="text-green-600 hover:underline">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(col._id)} className="text-red-600 hover:underline">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Mode */}
            {viewMode && selectedCollection && (
                <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">Collection Details</h3>
                    <p><strong>Name:</strong> {selectedCollection.name}</p>

                    <div className="mt-2">
                        <p className="font-medium mb-1">Books in Collection:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedCollection.bookIds.map((id: string) => {
                                const book = bookOptions.find((b) => b._id === id);
                                return (
                                    <li key={id}>
                                        {book ? (
                                            <>
                                                <span className="font-medium">{book.bookName}</span> by {book.author}
                                            </>
                                        ) : (
                                            <span className="text-gray-500 italic">Unknown Book (ID: {id})</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <p className="mt-2"><strong>Project:</strong> {getProjectName(selectedCollection.projectId)}</p>
<p><strong>Created By:</strong> {getUserName(selectedCollection.createdBy)}</p>


                    <button
                        className="mt-4 text-sm text-blue-500 hover:underline"
                        onClick={closeModes}
                    >
                        Close
                    </button>
                </div>
            )}


            {/* Edit Mode */}
            {editMode && selectedCollection && (
                <div className="p-4 border rounded-md bg-gray-50 mt-4">
                    <h3 className="font-semibold text-lg mb-2">Edit Collection</h3>

                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter collection name"
                    />

                    <div className="mt-4">
                        <label className="block font-medium mb-1">Select Books</label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                            {bookOptions.map((book) => (
                                <label key={book._id} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedBooks.includes(book._id)}
                                        onChange={() => {
                                            if (selectedBooks.includes(book._id)) {
                                                setSelectedBooks(selectedBooks.filter((id) => id !== book._id));
                                            } else {
                                                setSelectedBooks([...selectedBooks, book._id]);
                                            }
                                        }}
                                    />
                                    <span>{book.bookName} ({book.author})</span>
                                </label>
                            ))}
                        </div>


                    </div>

                    <div className="mt-3 flex space-x-2">
                        <Button onClick={handleUpdate} disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="outline" onClick={closeModes}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

        </ComponentCard>
    );
};

export default CollectionManager;
