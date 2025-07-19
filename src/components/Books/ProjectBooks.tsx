import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { fetchAllBooks } from "../../services/bookServices";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Checkbox from "../../components/form/input/Checkbox";
import Alert from "../../components/ui/alert/Alert";
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

interface ProjectBooksProps {
  projectId: string;
}

export default function ProjectBooks({ projectId }: ProjectBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [initialCheckedBooks, setInitialCheckedBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: any; title: string; message: string } | null>(null);

  useEffect(() => {
    const loadProjectBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchAllBooks();
        const projectBooks = data.filter((book: Book) => book.projectId === projectId);
        const ids = projectBooks.map((book) => book._id);
        setBooks(projectBooks);
        setCheckedBooks(ids);
        setInitialCheckedBooks(ids); // Save initial for diff comparison
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load project books");
        console.error("Error fetching project books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProjectBooks();
  }, [projectId]);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setCheckedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    );
  };

  const handleSaveChanges = async () => {
    const removed = initialCheckedBooks.filter((id) => !checkedBooks.includes(id));

    if (removed.length === 0) {
      setAlert({
        variant: "info",
        title: "No Changes",
        message: "No books were removed.",
      });
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to remove ${removed.length} book(s) from the project?`
    );
    if (!confirm) return;

    try {
      for (const bookId of removed) {
        const response = await fetch(`/api/projects/${projectId}/books/${bookId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to remove book from project");
        }
      }

      setBooks((prev) => prev.filter((book) => !removed.includes(book._id)));
      setInitialCheckedBooks((prev) => prev.filter((id) => !removed.includes(id)));
      setCheckedBooks((prev) => prev.filter((id) => !removed.includes(id)));
      setAlert({
        variant: "success",
        title: "Books Removed",
        message: `${removed.length} book(s) removed from the project.`,
      });
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Error",
        message: "An error occurred while removing books.",
      });
    }
  };

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

  // Check if there are any changes by comparing checkedBooks with initialCheckedBooks
  const hasChanges = checkedBooks.length !== initialCheckedBooks.length ||
    checkedBooks.some((id) => !initialCheckedBooks.includes(id)) ||
    initialCheckedBooks.some((id) => !checkedBooks.includes(id));

  if (loading) return <div>Loading project books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="Project Books">
      <div className="flex flex-col gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}

        <Table className="border-collapse">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Select</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Book Name</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Author</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Edition</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Created At</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Book Icon</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
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
                    href={`${API_BASE}/Uploads/${book.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {book.bookName || "Untitled"}
                  </a>
                </TableCell>
                <TableCell className="p-4">{book.author || "Unknown"}</TableCell>
                <TableCell className="p-4">{book.edition || "N/A"}</TableCell>
                <TableCell className="p-4">{formatDate(book.createdAt)}</TableCell>
                <TableCell className="p-4">
                  {book.frontPageImagePath ? (
                    <img
                      src={`${API_BASE}/Uploads/${book.frontPageImagePath}`}
                      alt={book.bookName}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/48";
                      }}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/48"
                      alt="No Icon"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {books.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No books added to this project
          </div>
        )}

        <div className="mt-4 text-right">
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded transition ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}