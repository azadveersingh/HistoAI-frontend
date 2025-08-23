import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchAllBooks, fetchProjectBooks, addBooksToProject, deleteBooks, updateBookVisibility, fetchProjectsForBook, updateBookDetails, fetchBookPreviewImage, fetchBookFile, fetchOcrZip } from "../../services/bookServices";
import { fetchCollectionById, updateCollection } from "../../services/collectionServices";
import Checkbox from "../../components/form/input/Checkbox";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
import ConfirmDialogWithInput from "../../components/ui/confirmation/ConfirmDialogWithInput";
import { Modal } from "../../components/ui/modal/index";
import EditBookDetailsModal from "./EditBookDetailsModal";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  author2?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
  previewUrl?: string;
  previewImageUrl?: string;
  pdfUrl?: string;
  createdAt?: string;
  pages?: number;
  visibility?: "public" | "private";
}

interface Project {
  _id: string;
  name: string;
}

interface AllBooksProps {
  searchQuery?: string;
  isCentralRepository?: boolean;
  collectionId?: string;
  onBooksAdded?: (bookIds: string[]) => void;
}

export default function AllBooks({
  searchQuery = "",
  isCentralRepository = false,
  collectionId,
  onBooksAdded,
}: AllBooksProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [projectBookIds, setProjectBookIds] = useState<string[]>([]);
  const [collectionBookIds, setCollectionBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [showProjectListModal, setShowProjectListModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [visibilityBookId, setVisibilityBookId] = useState<string | null>(null);
  const [visibilityTarget, setVisibilityTarget] = useState<"public" | "private" | null>(null);
  const [associatedProjects, setAssociatedProjects] = useState<Project[]>([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const promises = [
          fetchAllBooks(isCentralRepository ? "all" : "public"), // All books in central repo, public elsewhere
          projectId && !isCentralRepository && !collectionId ? fetchProjectBooks(projectId) : Promise.resolve([]),
        ];

        if (collectionId) {
          promises.push(fetchCollectionById(collectionId));
        } else {
          promises.push(Promise.resolve(null));
        }

        const [allBooks, projectBooks, collectionData] = await Promise.all(promises);

        const validBooks = allBooks.filter(
          (book: Book) => book && book._id && typeof book._id === "string"
        );
        if (allBooks.length !== validBooks.length) {
          console.warn("Filtered out invalid books:", allBooks.filter((book: Book) => !validBooks.includes(book)));
        }

        // Fetch preview images and PDF blob URLs
        const booksWithPreviewsAndPdfs = await Promise.all(
          validBooks.map(async (book) => {
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
        setProjectBookIds(projectBooks.map((book: Book) => book._id));
        if (collectionData && Array.isArray(collectionData.bookIds)) {
          setCollectionBookIds(collectionData.bookIds);
        } else {
          setCollectionBookIds([]);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load books";
        setError(errorMessage);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [projectId, isCentralRepository, collectionId, location.state]);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setCheckedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    );
  };

  const handleAddToProjectOrCollection = async () => {
    if (collectionId) {
      if (checkedBooks.length === 0) {
        setAlert({
          variant: "info",
          title: "No Books Selected",
          message: "Please select at least one public book to add to the collection.",
        });
        return;
      }

      setShowConfirmDialog(true);
    } else if (projectId) {
      if (checkedBooks.length === 0) {
        setAlert({
          variant: "info",
          title: "No Books Selected",
          message: "Please select at least one public book to add to the project.",
        });
        return;
      }

      setShowConfirmDialog(true);
    } else {
      setAlert({
        variant: "error",
        title: "No Target Selected",
        message: "Please select a project or collection to add books to.",
      });
    }
  };

  const handleConfirmAdd = async () => {
    try {
      if (collectionId) {
        await updateCollection(collectionId, { addBookIds: checkedBooks });
        setCollectionBookIds((prev) => [...prev, ...checkedBooks]);
        if (onBooksAdded) {
          onBooksAdded(checkedBooks);
        }
      } else if (projectId) {
        await addBooksToProject(projectId, checkedBooks);
        setProjectBookIds((prev) => [...prev, ...checkedBooks]);
      }
      setCheckedBooks([]);
      setAlert({
        variant: "success",
        title: "Books Added",
        message: `${checkedBooks.length} public book(s) added successfully.`,
      });
    } catch (err: any) {
      console.error("Error adding books:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while adding books.",
      });
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleDeleteBooks = async () => {
    if (role !== "book_manager") {
      setAlert({
        variant: "error",
        title: "Unauthorized",
        message: "Only book managers can delete books.",
      });
      return;
    }

    if (checkedBooks.length === 0) {
      setAlert({
        variant: "info",
        title: "No Books Selected",
        message: "Please select at least one book to delete.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    setShowInputDialog(true);
  };

  const handleConfirmInput = async (input: string) => {
    if (input.toLowerCase() !== "delete") {
      setAlert({
        variant: "error",
        title: "Invalid Input",
        message: "Please type 'Delete' to confirm deletion.",
      });
      return;
    }

    try {
      const response = await deleteBooks(checkedBooks);
      setBooks((prev) => prev.filter((book) => !checkedBooks.includes(book._id)));
      setCheckedBooks([]);
      setAlert({
        variant: "success",
        title: "Books Deleted",
        message: response.message || `${checkedBooks.length} book(s) deleted successfully.`,
      });
    } catch (err: any) {
      console.error("Error deleting books:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while deleting books.",
      });
    } finally {
      setShowInputDialog(false);
    }
  };

  const handleEditBook = (book: Book) => {
    if (role !== "book_manager") {
      setAlert({
        variant: "error",
        title: "Unauthorized",
        message: "Only book managers can edit book details.",
      });
      return;
    }
    if (checkedBooks.length !== 1) {
      setAlert({
        variant: "info",
        title: "Invalid Selection",
        message: "Please select exactly one book to edit.",
      });
      return;
    }
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleUpdateBook = async (updatedBook: Book) => {
    try {
      await updateBookDetails(updatedBook._id, {
        bookName: updatedBook.bookName,
        author: updatedBook.author || "",
        author2: updatedBook.author2 || "",
        edition: updatedBook.edition || "",
      });
      setBooks((prev) =>
        prev.map((book) =>
          book._id === updatedBook._id ? { ...book, ...updatedBook } : book
        )
      );
      setAlert({
        variant: "success",
        title: "Book Updated",
        message: "Book details updated successfully.",
      });
      setCheckedBooks([]);
    } catch (err: any) {
      console.error("Error updating book:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while updating book details.",
      });
    } finally {
      setShowEditModal(false);
      setSelectedBook(null);
    }
  };

  const handleToggleVisibility = async (bookId: string, currentVisibility: "public" | "private") => {
    if (role !== "book_manager") {
      setAlert({
        variant: "error",
        title: "Unauthorized",
        message: "Only book managers can change book visibility.",
      });
      return;
    }

    const newVisibility = currentVisibility === "public" ? "private" : "public";

    if (newVisibility === "private") {
      try {
        const projects = await fetchProjectsForBook(bookId);
        setAssociatedProjects(projects);
        setVisibilityBookId(bookId);
        setVisibilityTarget(newVisibility);
        setShowVisibilityDialog(true);
      } catch (err: any) {
        console.error("Error fetching projects for book:", err);
        setAlert({
          variant: "error",
          title: "Error",
          message: err.response?.data?.error || "Failed to fetch associated projects.",
        });
      }
    } else {
      try {
        await updateBookVisibility(bookId, newVisibility);
        setBooks((prev) =>
          prev.map((book) =>
            book._id === bookId ? { ...book, visibility: newVisibility } : book
          )
        );
        setAlert({
          variant: "success",
          title: "Visibility Updated",
          message: `Book visibility changed to ${newVisibility}.`,
        });
      } catch (err: any) {
        console.error("Error updating book visibility:", err);
        setAlert({
          variant: "error",
          title: "Error",
          message: err.response?.data?.error || "An error occurred while updating book visibility.",
        });
      }
    }
  };

  const handleDownloadOcrZip = async (bookId: string, bookName: string) => {
    try {
      const blobUrl = await fetchOcrZip(bookId);
      const safeBookName = bookName.replace(/[^a-zA-Z0-9-_]/g, '_') || "Untitled";
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeBookName}_OCR_output.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setAlert({
        variant: "success",
        title: "OCR ZIP Downloaded",
        message: `OCR ZIP file for "${bookName || "Untitled"}" downloaded successfully.`,
      });
    } catch (err: any) {
      console.error("Error downloading OCR ZIP:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.message || "Failed to download OCR ZIP file.",
      });
    }
  };

  const handleConfirmVisibilityChange = async () => {
    if (!visibilityBookId || !visibilityTarget) return;

    try {
      await updateBookVisibility(visibilityBookId, visibilityTarget);
      setBooks((prev) =>
        prev.map((book) =>
          book._id === visibilityBookId ? { ...book, visibility: visibilityTarget } : book
        )
      );
      setAlert({
        variant: "success",
        title: "Visibility Updated",
        message: `Book visibility changed to ${visibilityTarget}.`,
      });
    } catch (err: any) {
      console.error("Error updating book visibility:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while updating book visibility.",
      });
    } finally {
      setShowVisibilityDialog(false);
      setVisibilityBookId(null);
      setVisibilityTarget(null);
      setAssociatedProjects([]);
    }
  };

  const getVisibilityDialogMessage = () => {
    const projectCount = associatedProjects.length;
    const collectionCount = 0; // Assuming no collection data is fetched here
    if (projectCount === 0 && collectionCount === 0) {
      return (
        <span>Making this book private will make it not visible to anyone.</span>
      );
    }
    const projectText = projectCount === 1 ? "1 project" : `${projectCount} projects`;
    const collectionText = collectionCount === 1 ? "1 collection" : `${projectCount} collections`;
    const parts = [];
    if (projectCount > 0) parts.push(projectText);
    if (collectionCount > 0) parts.push(collectionText);
    const associationText = parts.join(" and ");
    return (
      <div className="flex flex-col gap-2 text-sm sm:text-base text-gray-800 dark:text-gray-100">
        <span>
          This book is associated with {associationText}. Making it private will make it unavailable to these projects. Are you sure you want to proceed?
        </span>
        {projectCount > 0 && (
          <button
            onClick={() => setShowProjectListModal(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-left text-sm sm:text-base"
          >
            Click here to see projects ({projectText})
          </button>
        )}
      </div>
    );
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

  const getAuthorDisplay = (book: Book) => {
    const primaryAuthor = book.author || "Unknown Author";
    const secondaryAuthor = book.author2?.trim();
    return secondaryAuthor ? `${primaryAuthor}, ${secondaryAuthor}` : primaryAuthor;
  };

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const aChecked = checkedBooks.includes(a._id);
      const bChecked = checkedBooks.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;

      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : Number.MIN_SAFE_INTEGER;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : Number.MIN_SAFE_INTEGER;
      return bDate - aDate;
    });
  }, [books, checkedBooks]);

  const filteredBooks = useMemo(
    () =>
      sortedBooks.filter((book) =>
        [
          book.bookName || "",
          book.author || "",
          book.author2 || "",
          book.edition || "",
          formatDate(book.createdAt),
          book.pages?.toString() || "",
          book.visibility || "",
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [sortedBooks, searchQuery]
  );

  if (loading) return (
    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-100">
      Loading {isCentralRepository ? "books" : "All books"}...
    </div>
  );
  if (error) return (
    <div className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</div>
  );

  return (
    <ComponentCard
      title={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2 sm:gap-4">
          <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
            {isCentralRepository ? "Central Repository" : "All Books"}
          </span>
          <div className="flex flex-wrap gap-2">
            {isCentralRepository && role === "book_manager" && (
              <Button
                onClick={() => handleEditBook(books.find((book) => book._id === checkedBooks[0])!)}
                disabled={checkedBooks.length !== 1}
                variant="primary"
                className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-md"
              >
                Edit
              </Button>
            )}
            <Button
              onClick={isCentralRepository ? handleDeleteBooks : handleAddToProjectOrCollection}
              disabled={checkedBooks.length === 0 || (isCentralRepository && role !== "book_manager")}
              variant="primary"
              className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md"
            >
              {isCentralRepository ? "Delete" : collectionId ? "Add Selected to Collection" : "Add Selected to Project"}
            </Button>
          </div>
        </div>
      }
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            className="text-sm sm:text-base"
          />
        )}
        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto w-full">
          <Table className="table-fixed min-w-full border-collapse text-sm sm:text-base">
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className="w-16 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Select
                </TableCell>
                <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Preview
                </TableCell>
                <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Book Name
                </TableCell>
                <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Authors
                </TableCell>
                <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Edition
                </TableCell>
                <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Created At
                </TableCell>
                {isCentralRepository && (
                  <>
                    <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                      Pages
                    </TableCell>
                    <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                      Visibility
                    </TableCell>
                    <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                      OCR Text
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCentralRepository ? 9 : 6} className="p-2 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    {isCentralRepository ? "No books found" : "No books found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow
                    key={book._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className="w-16 p-2 sm:p-4">
                      {isCentralRepository ? (
                        <Checkbox
                          id={`book-${book._id}`}
                          checked={checkedBooks.includes(book._id)}
                          onChange={(checked) => handleCheckboxChange(book._id, checked)}
                          disabled={role !== "book_manager"}
                          label=""
                          className="text-gray-700 dark:text-gray-200 scale-100"
                          aria-label={`Select book ${book.bookName || "Untitled Book"}`}
                        />
                      ) : collectionId && collectionBookIds.includes(book._id) ? (
                        <div title="Already added to this collection" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`book-${book._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => { }}
                            label=""
                            className="text-gray-700 dark:text-gray-200 scale-100"
                            aria-label={`Book ${book.bookName || "Untitled Book"} already in collection`}
                          />
                        </div>
                      ) : projectId && !collectionId && projectBookIds.includes(book._id) ? (
                        <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`book-${book._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => { }}
                            label=""
                            className="text-gray-700 dark:text-gray-200 scale-100"
                            aria-label={`Book ${book.bookName || "Untitled Book"} already in project`}
                          />
                        </div>
                      ) : (
                        <Checkbox
                          id={`book-${book._id}`}
                          checked={checkedBooks.includes(book._id)}
                          onChange={(checked) => handleCheckboxChange(book._id, checked)}
                          label=""
                          className="text-gray-700 dark:text-gray-200 scale-100"
                          aria-label={`Select book ${book.bookName || "Untitled Book"}`}
                        />
                      )}
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
                    <TableCell className="w-1/4 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">{getAuthorDisplay(book)}</TableCell>
                    <TableCell className="w-1/6 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">{book.edition || "N/A"}</TableCell>
                    <TableCell className="w-1/6 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">{formatDate(book.createdAt)}</TableCell>
                    {isCentralRepository && (
                      <>
                        <TableCell className="w-1/6 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">{book.pages || "N/A"}</TableCell>
                        <TableCell className="w-1/6 p-2 sm:p-4">
                          {role === "book_manager" ? (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={book.visibility === "public"}
                                onChange={() => handleToggleVisibility(book._id, book.visibility || "private")}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-700"></div>
                              <span className="ml-3 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {book.visibility || "Private"}
                              </span>
                            </label>
                          ) : (
                            <span className="text-sm sm:text-base capitalize text-gray-800 dark:text-gray-100">{book.visibility || "Private"}</span>
                          )}
                        </TableCell>
                        <TableCell className="w-1/6 p-2 sm:p-4">
                          <Button
                            variant="primary"
                            onClick={() => handleDownloadOcrZip(book._id, book.bookName)}
                            className="text-[10px] py-0.5 px-1.5 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded"
                          >
                            Download Zip
                          </Button>

                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={
            isCentralRepository
              ? `Are you sure you want to delete ${checkedBooks.length} book(s)? This action cannot be undone.`
              : `Are you sure you want to add ${checkedBooks.length} public book(s) to the ${collectionId ? "collection" : "project"}?`
          }
          onConfirm={isCentralRepository ? handleConfirmDelete : handleConfirmAdd}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText={isCentralRepository ? "OK" : "Add"}
          isDestructive={isCentralRepository}
          className="text-sm sm:text-base"
        />
        <ConfirmDialogWithInput
          isOpen={showInputDialog}
          message={`To confirm deletion of ${checkedBooks.length} book(s), please type "Delete" below:`}
          onConfirm={handleConfirmInput}
          onCancel={() => setShowInputDialog(false)}
          confirmText="OK"
          isDestructive={true}
          className="text-sm sm:text-base"
        />
        <ConfirmDialog
          isOpen={showVisibilityDialog}
          message={getVisibilityDialogMessage()}
          onConfirm={handleConfirmVisibilityChange}
          onCancel={() => {
            setShowVisibilityDialog(false);
            setVisibilityBookId(null);
            setVisibilityTarget(null);
            setAssociatedProjects([]);
          }}
          confirmText="OK"
          isDestructive={true}
          className="text-sm sm:text-base"
        />
        <Modal
          isOpen={showProjectListModal}
          onClose={() => setShowProjectListModal(false)}
          isFullscreen={false}
          showCloseButton={true}
          className="text-sm sm:text-base"
        >
          <div
            className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-list-title"
          >
            <h2 id="project-list-title" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
              Associated Projects
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              This book is associated with the following projects:
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
              {associatedProjects.length === 0 ? (
                <li>No projects found.</li>
              ) : (
                associatedProjects.map((project) => (
                  <li key={project._id} className="mb-2">
                    {project.name || "Unnamed Project"}
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowProjectListModal(false)}
                className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
        <EditBookDetailsModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBook(null);
          }}
          book={selectedBook}
          onUpdate={handleUpdateBook}
        />
      </div>
    </ComponentCard>
  );
}