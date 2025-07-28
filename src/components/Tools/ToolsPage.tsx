import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { fetchAllBooks } from "../../services/bookServices";
import { fetchVisibleCollections } from "../../services/collectionServices";
// Import icons from react-icons
import { FiDatabase, FiMessageSquare, FiGitBranch } from "react-icons/fi";

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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
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

  const handleProceed = (tool: 'data-extraction' | 'chatbot' | 'knowledge-graph') => {
    const url = `/project/${projectId}/tools/welcome?collections=${encodeURIComponent(
      selectedCollections.join(",")
    )}&books=${encodeURIComponent(selectedBooks.join(","))}&tool=${encodeURIComponent(tool)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filter collections and books based on search terms
  const filteredCollections = collections.filter((col) =>
    (col.name || "Untitled Collection").toLowerCase().includes(collectionSearch.toLowerCase())
  );

  const filteredBooks = books.filter((book) =>
    (book.bookName || "Untitled Book").toLowerCase().includes(bookSearch.toLowerCase())
  );

  if (loading) return <div className="text-center text-gray-600 dark:text-gray-400">Loading collections and books...</div>;
  if (error) return <div className="text-center text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="Project Tools" className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Project Items</h2>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Collections List */}
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Collections</h3>
          <input
            type="text"
            placeholder="Search collections..."
            value={collectionSearch}
            onChange={(e) => setCollectionSearch(e.target.value)}
            className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filteredCollections.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No collections found</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {filteredCollections.map((col) => (
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

        {/* Books List */}
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Books</h3>
          <input
            type="text"
            placeholder="Search books..."
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filteredBooks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No books found</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {filteredBooks.map((book) => (
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
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={() => handleProceed('data-extraction')}
          disabled={selectedBooks.length === 0 && selectedCollections.length === 0}
          variant="primary"
          className="flex items-center gap-2 transition-all duration-200 hover:shadow-md px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
        >
          <FiDatabase className="text-lg" />
          <span>Data Extraction</span>
        </Button>
        <Button
          onClick={() => handleProceed('chatbot')}
          disabled={selectedBooks.length === 0 && selectedCollections.length === 0}
          variant="primary"
          className="flex items-center gap-2 transition-all duration-200 hover:shadow-md px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
        >
          <FiMessageSquare className="text-lg" />
          <span>Chatbot</span>
        </Button>
        <Button
          onClick={() => handleProceed('knowledge-graph')}
          disabled={selectedBooks.length === 0 && selectedCollections.length === 0}
          variant="primary"
          className="flex items-center gap-2 transition-all duration-200 hover:shadow-md px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
        >
          <FiGitBranch className="text-lg" />
          <span>Knowledge Graph</span>
        </Button>
      </div>
    </ComponentCard>
  );
}