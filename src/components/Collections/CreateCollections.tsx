import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"
import { fetchAllBooks } from "../../services/bookServices";
import { fetchAllUsers } from "../../services/adminService";
import { createCollection } from "../../services/collectionServices";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import ComponentCard from "../common/ComponentCard";
import Checkbox from "../form/input/Checkbox";
import ProjectCard from "../Projects/ProjectCard";

const CollectionCreate: React.FC = () => {
  const location = useLocation();
  const { projectId, memberIds: preSelectedMembers } = location.state || {};
  const [name, setName] = useState("");
  const [bookOptions, setBookOptions] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(preSelectedMembers || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch books and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksData = await fetchAllBooks();
        const usersData = await fetchAllUsers();
        setBookOptions(booksData);
        setUserOptions(usersData?.users || usersData); // support both cases
      } catch (err) {
        setError("Failed to load books or users");
      }
    };
    fetchData();
  }, []);

  const handleCheckboxChange = (
    id: string,
    selectedList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedList.includes(id)) {
      setList(selectedList.filter((i) => i !== id));
    } else {
      setList([...selectedList, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Collection name is required");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      return;
    }
    if (selectedBooks.length === 0) {
      setError("Please select at least one book");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        bookIds: selectedBooks,
        memberIds: selectedMembers,
        projectId,
      };
      await createCollection(payload);
      setName("");
      setSelectedBooks([]);
      setSelectedMembers([]);
      alert("Collection created successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ComponentCard title="Create Collection">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>Collection Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter collection name"
          />
        </div>

        {/* Books Multi-select */}
        <div>
          <Label>Select Books</Label>
          <div className="grid grid-cols-2 gap-2">
            {bookOptions.map((book) => (
              <Checkbox
                key={book._id}
                label={`${book.bookName} (${book.author})`}
                checked={selectedBooks.includes(book._id)}
                onChange={() =>
                  handleCheckboxChange(book._id, selectedBooks, setSelectedBooks)
                }
              />
            ))}
          </div>
        </div>

        {/* Members Multi-select */}
        <div>
          <Label>Select Members</Label>
          <div className="grid grid-cols-2 gap-2">
            {userOptions.map((user) => (
              <Checkbox
                key={user._id}
                label={user.fullName || user.email}
                checked={selectedMembers.includes(user._id)}
                onChange={() =>
                  handleCheckboxChange(user._id, selectedMembers, setSelectedMembers)
                }
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-lg bg-brand-500 text-white font-medium text-sm transition-colors hover:bg-brand-600"
        >
          {isSubmitting ? "Creating..." : "Create Collection"}
        </button>
      </form>
    </ComponentCard>
  );
};

export default CollectionCreate;
