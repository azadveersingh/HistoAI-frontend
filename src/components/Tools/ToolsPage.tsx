import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import ComponentCard from "../../components/common/ComponentCard";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { fetchAllBooks } from "../../services/bookServices";
import { fetchVisibleCollections } from "../../services/collectionServices";

interface Book {
  _id: string;
  bookName: string;
}

interface Collection {
  _id: string;
  name: string;
}

interface ToolsPageProps {
  projectId: string;
}

export default function ToolsPage({ projectId }: ToolsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [collectionsData, booksData] = await Promise.all([
          fetchVisibleCollections(),
          fetchAllBooks(),
        ]);
        setCollections(collectionsData);
        setBooks(booksData);
      } catch (err: any) {
        setError(err.message || "Failed to load collections or books");
        console.error("Error in ToolsPage:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleCollection = (id: string, checked: boolean) => {
    setSelectedCollections((prev) =>
      checked ? [...prev, id] : prev.filter((cid) => cid !== id)
    );
  };

  const toggleBook = (id: string, checked: boolean) => {
    setSelectedBooks((prev) =>
      checked ? [...prev, id] : prev.filter((bid) => bid !== id)
    );
  };

  const handleProceed = () => {
    setIsModalOpen(false);
    // Construct URL with query parameters
    const url = `/project/${projectId}/tools/welcome?collections=${encodeURIComponent(
      selectedCollections.join(",")
    )}&books=${encodeURIComponent(selectedBooks.join(","))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div>Loading collections and books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="Project Tools">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Select Project Items</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Collections</h3>
          {collections.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No collections available</p>
          ) : (
            <div className="flex flex-col gap-2">
              {collections.map((col) => (
                <Checkbox
                  key={col._id}
                  id={`collection-${col._id}`}
                  label={col.name || "Untitled Collection"}
                  checked={selectedCollections.includes(col._id)}
                  onChange={(checked) => toggleCollection(col._id, checked)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Books</h3>
          {books.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No books available</p>
          ) : (
            <div className="flex flex-col gap-2">
              {books.map((book) => (
                <Checkbox
                  key={book._id}
                  id={`book-${book._id}`}
                  label={book.bookName || "Untitled Book"}
                  checked={selectedBooks.includes(book._id)}
                  onChange={(checked) => toggleBook(book._id, checked)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleProceed}
            disabled={selectedBooks.length === 0 && selectedCollections.length === 0}
            variant="primary"
          >
            Proceed
          </Button>
        </div>
      </Modal>
    </ComponentCard>
  );
}