import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
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

export default function ToolsWelcomePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [bookIds, setBookIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const collectionsParam = params.get("collections");
    const booksParam = params.get("books");
    setCollectionIds(collectionsParam ? collectionsParam.split(",") : []);
    setBookIds(booksParam ? booksParam.split(",") : []);
  }, [location.search]);

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
        console.error("Error in ToolsWelcomePage:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedCollections = collections.filter((col) => collectionIds.includes(col._id));
  const selectedBooks = books.filter((book) => bookIds.includes(book._id));

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Project Tools</h1>
      <p className="mb-2 text-gray-600">Project ID: {projectId}</p>

      <div className="mt-4">
        <h2 className="font-semibold">Selected Collections:</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {selectedCollections.length > 0 ? (
            selectedCollections.map((col) => (
              <li key={col._id}>{col.name || "Untitled Collection"}</li>
            ))
          ) : (
            <li className="italic text-gray-500">None selected</li>
          )}
        </ul>

        <h2 className="font-semibold mt-4">Selected Books:</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {selectedBooks.length > 0 ? (
            selectedBooks.map((book) => (
              <li key={book._id}>{book.bookName || "Untitled Book"}</li>
            ))
          ) : (
            <li className="italic text-gray-500">None selected</li>
          )}
        </ul>
      </div>
    </div>
  );
}