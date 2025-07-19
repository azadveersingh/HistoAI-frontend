import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchAllBooks } from "../../services/bookServices";
import { createCollection } from "../../services/collectionServices";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import ComponentCard from "../common/ComponentCard";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import AllCollections from "./AllCollections";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
}

const CollectionCreate: React.FC = () => {
  const { id: projectIdFromParams } = useParams<{ id: string }>();
  const location = useLocation();
  const { projectId: projectIdFromState } = location.state || {};
  const projectId = projectIdFromState || projectIdFromParams;

  const [name, setName] = useState("");
  const [bookOptions, setBookOptions] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshCollections, setRefreshCollections] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksData = await fetchAllBooks();
        setBookOptions(booksData);
      } catch (err) {
        setError("Failed to load books");
      }
    };
    fetchData();
  }, []);

  const handleCheckboxChange = (
    id: string,
    selectedList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!name.trim()) {
      setError("Collection name is required");
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
        projectId,
      };
      await createCollection(payload);
      setName("");
      setSelectedBooks([]);
      setRefreshCollections((prev) => prev + 1);
      alert("Collection created successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !bookOptions.length) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <ComponentCard title="Create Collection">
      <div className="flex flex-col gap-6">
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

          <div>
            <Label>Select Books</Label>
            <div className="grid grid-cols-2 gap-2">
              {bookOptions.map((book) => (
                <Checkbox
                  key={book._id}
                  label={`${book.bookName} (${book.author || "Unknown"})`}
                  checked={selectedBooks.includes(book._id)}
                  onChange={() =>
                    handleCheckboxChange(book._id, selectedBooks, setSelectedBooks)
                  }
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-30 h-11 rounded-lg bg-brand-500 text-white font-medium text-sm transition-colors hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Collection"}
          </button>
        </form>

        <AllCollections key={refreshCollections} hideCreateButton={true} />
      </div>
    </ComponentCard>
  );
};

export default CollectionCreate;