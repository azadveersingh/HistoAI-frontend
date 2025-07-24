import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCollectionById, updateCollection } from "../../services/collectionServices";
import Input from "../form/input/InputField";
import ComponentCard from "../common/ComponentCard";

const CollectionEdit: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [name, setName] = useState("");
  const [newBookId, setNewBookId] = useState("");
  const [bookIds, setBookIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const data = await fetchCollectionById(collectionId || "");
        setCollection(data.collection);
        setName(data.collection.name);
        setBookIds(data.collection.bookIds || []);
      } catch (err: any) {
        setError("Failed to load collection");
      }
    };
    if (collectionId) loadCollection();
  }, [collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Collection name is required");

    try {
      setIsSaving(true);
      await updateCollection(collectionId || "", {
        name,
        bookIds,
      });
      alert("Collection updated");
    } catch (err: any) {
      setError("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBookId = () => {
    const trimmed = newBookId.trim();
    if (trimmed && !bookIds.includes(trimmed)) {
      setBookIds([...bookIds, trimmed]);
      setNewBookId("");
    }
  };

  const handleRemoveBookId = (id: string) => {
    setBookIds(bookIds.filter((bid) => bid !== id));
  };

  if (!collection) return <p>Loading...</p>;

  return (
    <ComponentCard title="Edit Collection">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Collection Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Add Book ID</label>
          <div className="flex gap-2">
            <Input
              value={newBookId}
              onChange={(e) => setNewBookId(e.target.value)}
              placeholder="Enter Book ID"
            />
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleAddBookId}
            >
              Add
            </button>
          </div>
        </div>

        {bookIds.length > 0 && (
          <div className="space-y-1">
            <label className="block mb-1">Current Book IDs</label>
            <ul className="space-y-1">
              {bookIds.map((bid) => (
                <li key={bid} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{bid}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBookId(bid)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </ComponentCard>
  );
};

export default CollectionEdit;
