import { useState, useEffect, useMemo } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import { fetchProjectBooks, removeBooksFromProject, fetchBookFile, fetchBookPreviewImage } from "../../services/bookServices";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Checkbox from "../../components/form/input/Checkbox";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
  previewUrl?: string; 
  pdfUrl?: string;
  previewImageUrl?: string;
  createdAt?: string;
  pages?: number;
}

interface ProjectBooksProps {
  projectId: string;
  searchQuery?: string;
  isToolsPage?: boolean;
  selectedBooks?: string[];
  onBookSelectionChange?: (bookId: string, checked: boolean) => void;
}

export default function ProjectBooks({
  projectId,
  searchQuery = "",
  isToolsPage = false,
  selectedBooks,
  onBookSelectionChange
}: ProjectBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [initialCheckedBooks, setInitialCheckedBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

        // Fetch preview images and PDF blob URLs
        const booksWithPreviewsAndPdfs = await Promise.all(
          projectBooks.map(async (book: Book) => {
            let previewImageUrl, pdfUrl;
            if (book.frontPageImagePath) {
              try {
                previewImageUrl = await fetchBookPreviewImage(book.frontPageImagePath);
              } catch (err) {
                console.error(`Failed to fetch preview for book ${book._id}:`, err);
              }
            }
            if (book.previewUrl) {
              try {
                pdfUrl = await fetchBookFile(book.previewUrl);
              } catch (err) {
                console.error(`Failed to fetch PDF for book ${book._id}:`, err);
              }
            }
            return { ...book, previewImageUrl, pdfUrl };
          })
        );

        setBooks(booksWithPreviewsAndPdfs);
        if (!isToolsPage) {
          const ids = booksWithPreviewsAndPdfs.map((book: Book) => book._id);
          setCheckedBooks(ids);
          setInitialCheckedBooks(ids);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load project books";
        setError(errorMessage);
        console.error("Error fetching project books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProjectBooks();
  }, [projectId, isToolsPage]);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    if (isToolsPage && onBookSelectionChange) {
      onBookSelectionChange(bookId, checked);
    } else {
      setCheckedBooks((prev) =>
        checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
      );
    }
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    return books.filter((book) =>
      [
        book.bookName || "",
        book.author || "",
        book.edition || "",
      ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [books, searchQuery]);

  const hasChanges =
    !isToolsPage &&
    (checkedBooks.length !== initialCheckedBooks.length ||
      checkedBooks.some((id) => !initialCheckedBooks.includes(id)) ||
      initialCheckedBooks.some((id) => !checkedBooks.includes(id)));

  if (loading) return <div className={isToolsPage ? "text-xs sm:text-sm text-gray-800 dark:text-gray-100" : "text-sm sm:text-base text-gray-800 dark:text-gray-100"}>Loading project books...</div>;
  if (error) return <div className={isToolsPage ? "text-xs sm:text-sm text-red-600 dark:text-red-400" : "text-sm sm:text-base text-red-600 dark:text-red-400"}>{error}</div>;

  return (
    <ComponentCard
      title={
        <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
          {isToolsPage ? "Project Books" : "Project Books"}
        </span>
      }
      className={isToolsPage ? "bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-sm" : "bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow-sm"}
    >
      <div className={isToolsPage ? "flex flex-col gap-2 sm:gap-3" : "flex flex-col gap-3 sm:gap-4"}>
        {!isToolsPage && alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            className={isToolsPage ? "text-xs sm:text-sm" : "text-sm sm:text-base"}
          />
        )}

        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto w-full">
          <Table className={isToolsPage ? "table-fixed min-w-full border-collapse text-xs sm:text-sm" : "table-fixed min-w-full border-collapse text-sm sm:text-base"}>
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className={isToolsPage ? "w-12 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-16 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Select
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/6 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/6 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Preview
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/3 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/3 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Book Name
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/4 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/4 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Author
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/6 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/6 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Edition
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/6 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/6 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Pages
                </TableCell>
                {!isToolsPage && (
                  <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                    Created At
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isToolsPage ? 6 : 7} className={isToolsPage ? "p-1 sm:p-2 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400" : "p-2 sm:p-4 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400"}>
                    No books found{searchQuery ? " matching your search" : ""}.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow
                    key={book._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className={isToolsPage ? "w-12 p-1 sm:p-2" : "w-16 p-2 sm:p-4"}>
                      <Checkbox
                        id={`book-${book._id}`}
                        checked={isToolsPage ? selectedBooks?.includes(book._id) : checkedBooks.includes(book._id)}
                        onChange={(checked) => handleCheckboxChange(book._id, checked)}
                        label=""
                        className={isToolsPage ? "text-gray-700 dark:text-gray-200 scale-75 sm:scale-90" : "text-gray-700 dark:text-gray-200 scale-100"}
                        aria-label={`Select book ${book.bookName || "Untitled Book"}`}
                      />
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/6 p-1 sm:p-2" : "w-1/6 p-2 sm:p-4"}>
                      {book.previewImageUrl ? (
                        <img
                          src={book.previewImageUrl}
                          alt={`Preview of ${book.bookName || "Untitled"}`}
                          className={isToolsPage ? "w-12 h-12 sm:w-14 sm:h-14 object-cover rounded" : "w-16 h-16 object-cover rounded"}
                          onError={(e) => console.error(`Failed to load preview for ${book.bookName}:`, e)}
                        />
                      ) : (
                        <span className={isToolsPage ? "text-xs sm:text-sm text-gray-500 dark:text-gray-400" : "text-sm sm:text-base text-gray-500 dark:text-gray-400"}>No preview</span>
                      )}
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/3 p-1 sm:p-2" : "w-1/3 p-2 sm:p-4"}>
                      <div className="truncate" title={book.bookName || "Untitled"}>
                        {book.pdfUrl ? (
                          <a
                            href={book.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={isToolsPage ? "text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm" : "text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"}
                          >
                            {truncateText(book.bookName || "Untitled", isToolsPage ? 20 : 30)}
                          </a>
                        ) : (
                          <span
                            className={isToolsPage ? "text-xs sm:text-sm text-gray-500 dark:text-gray-400" : "text-sm sm:text-base text-gray-500 dark:text-gray-400"}
                            title="PDF not available"
                          >
                            {truncateText(book.bookName || "Untitled", isToolsPage ? 20 : 30)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/4 p-1 sm:p-2 truncate text-gray-800 dark:text-gray-100" : "w-1/4 p-2 sm:p-4 truncate text-gray-800 dark:text-gray-100"} title={book.author || "Unknown"}>
                      {truncateText(book.author || "Unknown", isToolsPage ? 15 : 20)}
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/6 p-1 sm:p-2 text-gray-800 dark:text-gray-100" : "w-1/6 p-2 sm:p-4 text-gray-800 dark:text-gray-100"}>
                      {book.edition || "N/A"}
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/6 p-1 sm:p-2" : "w-1/6 p-2 sm:p-4"}>
                      <button
                        className={isToolsPage ? "text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm" : "text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"}
                        onClick={() => openBookModal(book)}
                      >
                        {book.pages || "N/A"}
                      </button>
                    </TableCell>
                    {!isToolsPage && (
                      <TableCell className="w-1/6 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">{formatDate(book.createdAt)}</TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isToolsPage && (
          <div className={isToolsPage ? "mt-2 text-right" : "mt-3 sm:mt-4 text-right"}>
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className={isToolsPage
                ? `bg-blue-600 dark:bg-blue-700 text-white font-semibold py-1 px-2 sm:px-3 rounded-md transition text-xs sm:text-sm ${!hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-800"}`
                : `bg-blue-600 dark:bg-blue-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition text-sm sm:text-base ${!hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-800"}`
              }
            >
              Remove Books
            </button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Details for "${selectedBook?.bookName || "Book"}"`}
          isFullscreen={false}
          showCloseButton={true}
          className={isToolsPage ? "text-xs sm:text-sm" : "text-sm sm:text-base"}
        >
          <div className={isToolsPage ? "space-y-1 p-2 sm:p-3 text-gray-800 dark:text-gray-100" : "space-y-2 p-2 sm:p-4 text-gray-800 dark:text-gray-100"}>
            {selectedBook ? (
              <>
                <p><strong>Name:</strong> {selectedBook.bookName || "Untitled"}</p>
                <p><strong>Author:</strong> {selectedBook.author || "Unknown"}</p>
                <p><strong>Edition:</strong> {selectedBook.edition || "N/A"}</p>
                <p><strong>Pages:</strong> {selectedBook.pages || "N/A"}</p>
                <p><strong>Created At:</strong> {formatDate(selectedBook.createdAt)}</p>
                {selectedBook.previewImageUrl ? (
                  <img
                    src={selectedBook.previewImageUrl}
                    alt={`Preview of ${selectedBook.bookName || "Untitled"}`}
                    className={isToolsPage ? "w-20 h-20 object-cover rounded mt-1 sm:mt-1.5" : "w-24 h-24 object-cover rounded mt-1.5 sm:mt-2"}
                    onError={(e) => {
                      console.error(`Failed to load preview for ${selectedBook.bookName}:`, e);
                      e.currentTarget.src = isToolsPage ? "https://via.placeholder.com/80" : "https://via.placeholder.com/96";
                    }}
                  />
                ) : (
                  <p className={isToolsPage ? "text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5" : "text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2"}>No preview image available</p>
                )}
              </>
            ) : (
              <p className={isToolsPage ? "text-xs sm:text-sm text-gray-500 dark:text-gray-400" : "text-sm sm:text-base text-gray-500 dark:text-gray-400"}>No book details available.</p>
            )}
          </div>
        </Modal>

        {!isToolsPage && (
          <ConfirmDialog
            isOpen={showConfirmDialog}
            message={`Are you sure you want to remove ${initialCheckedBooks.filter((id) => !checkedBooks.includes(id)).length} book(s) from the project?`}
            onConfirm={handleConfirmRemove}
            onCancel={() => setShowConfirmDialog(false)}
            confirmText="Confirm"
            isDestructive={true}
            className={isToolsPage ? "text-xs sm:text-sm" : "text-sm sm:text-base"}
          />
        )}
      </div>
    </ComponentCard>
  );
}