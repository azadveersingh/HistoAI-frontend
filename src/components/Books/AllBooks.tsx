import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchAllBooks } from "../../services/bookServices";
import Checkbox from "../../components/form/input/Checkbox";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import { api as API_BASE } from "../../api/api";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
  createdAt?: string;
  projectId?: string;
}

export default function AllBooks() {
  const { id: projectId } = useParams<{ id: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchAllBooks();
        console.log("Fetched books:", data);
        const validBooks = data.filter(
          (book: Book) => book && book._id && typeof book._id === "string"
        );
        if (data.length !== validBooks.length) {
          console.warn("Filtered out invalid books:", data.filter((book: Book) => !validBooks.includes(book)));
        }
        setBooks(validBooks);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load books";
        setError(errorMessage);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setCheckedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    );
  };

  const handleAddToProject = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ bookIds: checkedBooks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add books");
      }

      alert("Books added to project successfully.");
      setCheckedBooks([]);
    } catch (err: any) {
      console.error("Error adding books to project:", err);
      alert(err.message || "Error adding books to project.");
    }
  };

  const sortedBooks = [...books].sort((a, b) => {
    const aChecked = checkedBooks.includes(a._id);
    const bChecked = checkedBooks.includes(b._id);
    if (aChecked && !bChecked) return -1;
    if (!aChecked && bChecked) return 1;
    const aBookName = a.bookName || "Untitled";
    const bBookName = b.bookName || "Untitled";
    return aBookName.localeCompare(bBookName);
  });

  // Format createdAt date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) return <div>Loading books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="All Books">
      <div className="flex flex-col gap-4">
        <Table className="border-collapse">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Select
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Book Name
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Author
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Edition
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Created At
              </TableCell>
              {/* <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Book Icon
              </TableCell> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBooks.map((book) => (
              <TableRow
                key={book._id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <TableCell className="p-4">
                  <Checkbox
                    id={`book-${book._id}`}
                    checked={checkedBooks.includes(book._id)}
                    onChange={(checked) => handleCheckboxChange(book._id, checked)}
                    label=""
                  />
                </TableCell>
                <TableCell className="p-4">
                  <a
                    href={book.previewUrl || `${API_BASE}/uploads/${book.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {book.bookName || "Untitled"}
                  </a>
                </TableCell>
                <TableCell className="p-4">{book.author || "Unknown Author"}</TableCell>
                <TableCell className="p-4">{book.edition || "N/A"}</TableCell>
                <TableCell className="p-4">{formatDate(book.createdAt)}</TableCell>
                {/* <TableCell className="p-4">
                  {book.frontPageImagePath ? (
                    <img
                      src={`${API_BASE}/uploads/${book.frontPageImagePath}`}
                      alt={book.bookName || "Book Icon"}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/48"; // Fallback image
                      }}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/48"
                      alt="No Icon"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {books.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No books available
          </div>
        )}
        <div className="mt-4 self-end">
          <Button
            onClick={handleAddToProject}
            disabled={checkedBooks.length === 0}
            variant="primary"
          >
            Add Selected to Project
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}