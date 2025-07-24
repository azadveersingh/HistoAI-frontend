import { useState, useEffect, useMemo } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { fetchProjectBooks, removeBooksFromProject } from "../../services/bookServices";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Checkbox from "../../components/form/input/Checkbox";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import { api as API_BASE } from "../../api/api";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
  createdAt?: string;
  pages?: number;
}

interface ProjectBooksProps {
  projectId: string;
  searchQuery: string;
}

export default function ProjectBooks({ projectId, searchQuery }: ProjectBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [initialCheckedBooks, setInitialCheckedBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  console.log("Search query in the project Book page:", searchQuery);
  console.log("Received projectId:", projectId);

  useEffect(() => {
    const loadProjectBooks = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectBooks = await fetchProjectBooks(projectId);
        console.log("Project books:", projectBooks);
        if (projectBooks.length === 0) {
          console.warn(`No books found for projectId: ${projectId}`);
        }
        const ids = projectBooks.map((book: Book) => book._id);
        setBooks(projectBooks);
        setCheckedBooks(ids);
        setInitialCheckedBooks(ids);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load project books";
        setError(errorMessage);
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

    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    const removed = initialCheckedBooks.filter((id) => !checkedBooks.includes(id));
    try {
      await removeBooksFromProject(projectId, removed);
      setBooks((prev) => prev.filter((book) => !removed.includes(book._id)));
      setInitialCheckedBooks((prev) => prev.filter((id) => !removed.includes(id)));
      setCheckedBooks((prev) => prev.filter((id) => !removed.includes(id)));
      setAlert({
        variant: "success",
        title: "Books Removed",
        message: `${removed.length} book(s) removed from the project.`,
      });
    } catch (err: any) {
      console.error("Error removing books:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while removing books.",
      });
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const openBookModal = (book: Book) => {
    setSelectedBook(book);
    setShowModal(true);
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

  const filteredBooks = useMemo(() => {
    const result = books.filter((book) =>
      [
        book.bookName || "",
        book.author || "",
        book.edition || "",
      ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    console.log("Filtered books:", result);
    return result;
  }, [books, searchQuery]);

  const hasChanges =
    checkedBooks.length !== initialCheckedBooks.length ||
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
                Pages
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Created At
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No books found for this project{searchQuery ? " matching your search" : ""}.
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow
                  key={book._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
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
                  <TableCell className="p-4">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => openBookModal(book)}
                    >
                      {book.pages || "N/A"}
                    </button>
                  </TableCell>
                  <TableCell className="p-4">{formatDate(book.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Details for "${selectedBook?.bookName || "Book"}"`}
        >
          <div className="space-y-2 p-4">
            {selectedBook ? (
              <div className="text-gray-800 dark:text-gray-100">
                <p><strong>Name:</strong> {selectedBook.bookName || "Untitled"}</p>
                <p><strong>Author:</strong> {selectedBook.author || "Unknown"}</p>
                <p><strong>Edition:</strong> {selectedBook.edition || "N/A"}</p>
                <p><strong>Pages:</strong> {selectedBook.pages || "N/A"}</p>
                <p><strong>Created At:</strong> {formatDate(selectedBook.createdAt)}</p>
                {selectedBook.frontPageImagePath && (
                  <img
                    src={`${API_BASE}/Uploads/${selectedBook.frontPageImagePath}`}
                    alt={selectedBook.bookName || "Book Icon"}
                    className="w-24 h-24 object-cover rounded mt-2"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/96";
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">No book details available.</div>
            )}
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={`Are you sure you want to remove ${initialCheckedBooks.filter((id) => !checkedBooks.includes(id)).length} book(s) from the project?`}
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText="Confirm"
          isDestructive={true}
        />
      </div>
    </ComponentCard>
  );
}