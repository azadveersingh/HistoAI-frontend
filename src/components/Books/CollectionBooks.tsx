import { useEffect, useState, useMemo } from "react";
import { fetchCollectionById, updateCollection } from "../../services/collectionServices";
import { fetchAllBooks, fetchBookFile, fetchBookPreviewImage } from "../../services/bookServices";
import ComponentCard from "../../components/common/ComponentCard";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal/index";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
import { api as API_BASE } from "../../api/api";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
  previewUrl?: string; // Added for PDF URL
  pdfUrl?: string; // Added for PDF blob URL
  previewImageUrl?: string; // Added for preview image blob URL
  createdAt?: string;
  pages?: number;
}

interface Collection {
  _id: string;
  name: string;
  bookIds: string[];
}

interface CollectionBooksProps {
  collectionId: string;
  searchQuery: string;
  onBooksRemoved?: (removedBookIds: string[]) => void;
}

export default function CollectionBooks({ collectionId, searchQuery, onBooksRemoved }: CollectionBooksProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
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
    const loadData = async () => {
      try {
        setLoading(true);
        const [collectionData, allBooks] = await Promise.all([
          fetchCollectionById(collectionId),
          fetchAllBooks(),
        ]);

        console.log("Collection data:", collectionData);
        console.log("All books:", allBooks);

        const normalizedCollection: Collection = {
          _id: collectionData._id || collectionData.id,
          name: collectionData.name || "Unnamed Collection",
          bookIds: Array.isArray(collectionData.bookIds) ? collectionData.bookIds : [],
        };

        // Fetch preview images and PDF blob URLs
        const booksWithPreviewsAndPdfs = await Promise.all(
          allBooks.map(async (book: Book) => {
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

        setCollection(normalizedCollection);
        setBooks(booksWithPreviewsAndPdfs);
        setCheckedBooks(normalizedCollection.bookIds);
        setInitialCheckedBooks(normalizedCollection.bookIds);
      } catch (err: any) {
        console.error("Error loading collection books:", err);
        setError("Failed to load collection books");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionId]);

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

    console.log("Books to remove:", removed);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    const removed = initialCheckedBooks.filter((id) => !checkedBooks.includes(id));
    try {
      console.log("Sending updateCollection request with removeBookIds:", removed);
      const response = await updateCollection(collectionId, { removeBookIds: removed });
      console.log("updateCollection response:", response);

      // Re-fetch collection to ensure backend state is consistent
      const updatedCollection = await fetchCollectionById(collectionId);
      console.log("Re-fetched collection:", updatedCollection);

      const normalizedCollection: Collection = {
        _id: updatedCollection._id || updatedCollection.id,
        name: updatedCollection.name || "Unnamed Collection",
        bookIds: Array.isArray(updatedCollection.bookIds) ? updatedCollection.bookIds : [],
      };

      setCollection(normalizedCollection);
      setBooks((prev) => prev.filter((book) => normalizedCollection.bookIds.includes(book._id)));
      setCheckedBooks(normalizedCollection.bookIds);
      setInitialCheckedBooks(normalizedCollection.bookIds);
      setAlert({
        variant: "success",
        title: "Books Removed",
        message: `${removed.length} book(s) removed from the collection.`,
      });
      if (onBooksRemoved) {
        onBooksRemoved(removed);
      }
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
    const result = books
      .filter((book) => initialCheckedBooks.includes(book._id))
      .filter((book) =>
        [
          book.bookName || "",
          book.author || "",
          book.edition || "",
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    console.log("Filtered books:", result);
    return result;
  }, [books, initialCheckedBooks, searchQuery]);

  const hasChanges =
    checkedBooks.length !== initialCheckedBooks.length ||
    checkedBooks.some((id) => !initialCheckedBooks.includes(id)) ||
    initialCheckedBooks.some((id) => !checkedBooks.includes(id));

  if (loading) return <div className="text-gray-600 dark:text-gray-400 animate-pulse">Loading collection books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard
      title={
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Collection Books</h2>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            variant="primary"
            className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded transition ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            Remove Books
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}

        <Table className="border-collapse table-fixed min-w-full">
          <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
            <TableRow>
              <TableCell isHeader className="w-16 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Select
              </TableCell>
              <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Preview
              </TableCell>
              <TableCell isHeader className="w-1/3 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Book Name
              </TableCell>
              <TableCell isHeader className="w-1/4 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Author
              </TableCell>
              <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Edition
              </TableCell>
              <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Pages
              </TableCell>
              <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Created At
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-2 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  No books found in this collection{searchQuery ? " matching your search" : ""}.
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow
                  key={book._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="w-16 p-2 sm:p-4">
                    <Checkbox
                      id={`book-${book._id}`}
                      checked={checkedBooks.includes(book._id)}
                      onChange={(checked) => handleCheckboxChange(book._id, checked)}
                      label=""
                      className="text-gray-700 dark:text-gray-200 scale-100"
                      aria-label={`Remove book ${book.bookName || "Untitled"} from collection`}
                    />
                  </TableCell>
                  <TableCell className="w-1/6 p-2 sm:p-4">
                    {book.previewImageUrl ? (
                      <img
                        src={book.previewImageUrl}
                        alt={`Preview of ${book.bookName || "Untitled"}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => console.error(`Failed to load preview for ${book.bookName}:`, e)}
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No preview</span>
                    )}
                  </TableCell>
                  <TableCell className="w-1/3 p-2 sm:p-4">
                    {book.pdfUrl ? (
                      <a
                        href={book.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
                      >
                        {book.bookName || "Untitled"}
                      </a>
                    ) : (
                      <span
                        className="text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                        title="PDF not available"
                      >
                        {book.bookName || "Untitled"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="w-1/4 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">
                    {book.author || "Unknown"}
                  </TableCell>
                  <TableCell className="w-1/6 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">
                    {book.edition || "N/A"}
                  </TableCell>
                  <TableCell className="w-1/6 p-2 sm:p-4">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
                      onClick={() => openBookModal(book)}
                    >
                      {book.pages || "N/A"}
                    </button>
                  </TableCell>
                  <TableCell className="w-1/6 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">
                    {formatDate(book.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Details for "${selectedBook?.bookName || "Book"}"`}
          isFullscreen={false}
          showCloseButton={true}
          className="text-sm sm:text-base"
        >
          <div className="space-y-2 p-4 sm:p-6 text-gray-800 dark:text-gray-100">
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
                    className="w-24 h-24 object-cover rounded mt-2"
                    onError={(e) => {
                      console.error(`Failed to load preview for ${selectedBook.bookName}:`, e);
                      e.currentTarget.src = "https://via.placeholder.com/96";
                    }}
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mt-2">No preview image available</p>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No book details available.</p>
            )}
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={`Are you sure you want to remove ${initialCheckedBooks.filter(
            (id) => !checkedBooks.includes(id)
          ).length} book(s) from the collection?`}
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText="Remove"
          isDestructive={true}
          className="text-sm sm:text-base"
        />
      </div>
    </ComponentCard>
  );
}