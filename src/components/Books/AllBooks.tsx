import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchAllBooks, fetchProjectBooks, addBooksToProject, deleteBooks, updateBookVisibility, fetchProjectsForBook } from "../../services/bookServices";
import Checkbox from "../../components/form/input/Checkbox";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { api as API_BASE } from "../../api/api";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
import ConfirmDialogWithInput from "../../components/ui/confirmation/ConfirmDialogWithInput";
import { Modal } from "../../components/ui/modal/index";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
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
}

export default function AllBooks({ searchQuery = "", isCentralRepository = false }: AllBooksProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [projectBookIds, setProjectBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [showProjectListModal, setShowProjectListModal] = useState(false);
  const [visibilityBookId, setVisibilityBookId] = useState<string | null>(null);
  const [visibilityTarget, setVisibilityTarget] = useState<"public" | "private" | null>(null);
  const [associatedProjects, setAssociatedProjects] = useState<Project[]>([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const [allBooks, projectBooks] = await Promise.all([
          fetchAllBooks(), // Only returns books with completed OCR
          projectId && !isCentralRepository ? fetchProjectBooks(projectId) : Promise.resolve([]),
        ]);

        console.log("Fetched all books:", allBooks);
        console.log("Fetched project books:", projectBooks);

        const validBooks = allBooks.filter(
          (book: Book) => book && book._id && typeof book._id === "string"
        );
        if (allBooks.length !== validBooks.length) {
          console.warn("Filtered out invalid books:", allBooks.filter((book: Book) => !validBooks.includes(book)));
        }
        setBooks(validBooks);
        setProjectBookIds(projectBooks.map((book: Book) => book._id));
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load books";
        setError(errorMessage);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [projectId, isCentralRepository]);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setCheckedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    );
  };

  const handleAddToProject = async () => {
    if (!projectId) {
      setAlert({
        variant: "error",
        title: "No Project Selected",
        message: "Please select a project to add books to.",
      });
      return;
    }

    if (checkedBooks.length === 0) {
      setAlert({
        variant: "info",
        title: "No Books Selected",
        message: "Please select at least one book to add to the project.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmAdd = async () => {
    try {
      await addBooksToProject(projectId!, checkedBooks);
      setProjectBookIds((prev) => [...prev, ...checkedBooks]);
      setCheckedBooks([]);
      setAlert({
        variant: "success",
        title: "Books Added",
        message: `${checkedBooks.length} book(s) added to the project successfully.`,
      });
    } catch (err: any) {
      console.error("Error adding books to project:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while adding books to the project.",
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
    const collectionCount = 0;
    if (projectCount === 0 && collectionCount === 0) {
      return (
        <span>Making this book private will make it not visible to anyone.</span>
      );
    }
    const projectText = projectCount === 1 ? "1 project" : `${projectCount} projects`;
    const collectionText = collectionCount === 1 ? "1 collection" : `${collectionCount} collections`;
    const parts = [];
    if (projectCount > 0) parts.push(projectText);
    if (collectionCount > 0) parts.push(collectionText);
    const associationText = parts.join(" and ");
    return (
      <div className="flex flex-col gap-2">
        <span>
          This book is associated with {associationText}. Making it private will make it unavailable to these projects. Are you sure you want to proceed?
        </span>
        {projectCount > 0 && (
          <button
            onClick={() => setShowProjectListModal(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-left"
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

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const aChecked = checkedBooks.includes(a._id);
      const bChecked = checkedBooks.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      const aBookName = a.bookName || "Untitled";
      const bBookName = b.bookName || "Untitled";
      return aBookName.localeCompare(bBookName);
    });
  }, [books, checkedBooks]);

  const filteredBooks = useMemo(
    () =>
      sortedBooks.filter((book) =>
        [
          book.bookName || "",
          book.author || "",
          book.edition || "",
          formatDate(book.createdAt),
          book.pages?.toString() || "",
          book.visibility || "",
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [sortedBooks, searchQuery]
  );

  if (loading) return <div>Loading books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard
      title={
        <div className="flex justify-between items-center">
          <span>All Books</span>
          <Button
            onClick={isCentralRepository ? handleDeleteBooks : handleAddToProject}
            disabled={checkedBooks.length === 0 || (isCentralRepository && role !== "book_manager")}
            variant="primary"
            className="text-sm py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isCentralRepository ? "Delete" : "Add Selected to Project"}
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
              {isCentralRepository && (
                <>
                  <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Pages
                  </TableCell>
                  <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Visibility
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isCentralRepository ? 7 : 5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No books found matching your search
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow
                  key={book._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="p-4">
                    <td className="p-3">
                      {isCentralRepository ? (
                        <Checkbox
                          id={`book-${book._id}`}
                          checked={checkedBooks.includes(book._id)}
                          onChange={(checked) => handleCheckboxChange(book._id, checked)}
                          disabled={role !== "book_manager"}
                          label=""
                        />
                      ) : projectBookIds.includes(book._id) ? (
                        <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`book-${book._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => {}}
                            label=""
                          />
                        </div>
                      ) : (
                        <Checkbox
                          id={`book-${book._id}`}
                          checked={checkedBooks.includes(book._id)}
                          onChange={(checked) => handleCheckboxChange(book._id, checked)}
                          label=""
                        />
                      )}
                    </td>
                  </TableCell>
                  <TableCell className="p-4">
                    <a
                      href={book.previewUrl || `${API_BASE}/Uploads/${book.fileName}`}
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
                  {isCentralRepository && (
                    <>
                      <TableCell className="p-4">{book.pages || "N/A"}</TableCell>
                      <TableCell className="p-4">
                        {role === "book_manager" ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={book.visibility === "public"}
                              onChange={() => handleToggleVisibility(book._id, book.visibility || "private")}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {book.visibility || "Private"}
                            </span>
                          </label>
                        ) : (
                          <span className="text-sm capitalize">{book.visibility || "Private"}</span>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={
            isCentralRepository
              ? `Are you sure you want to delete ${checkedBooks.length} book(s)? This action cannot be undone.`
              : `Are you sure you want to add ${checkedBooks.length} book(s) to the project?`
          }
          onConfirm={isCentralRepository ? handleConfirmDelete : handleConfirmAdd}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText={isCentralRepository ? "OK" : "Add"}
          isDestructive={isCentralRepository}
        />
        <ConfirmDialogWithInput
          isOpen={showInputDialog}
          message={`To confirm deletion of ${checkedBooks.length} book(s), please type "Delete" below:`}
          onConfirm={handleConfirmInput}
          onCancel={() => setShowInputDialog(false)}
          confirmText="OK"
          isDestructive={true}
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
        />
        <Modal
          isOpen={showProjectListModal}
          onClose={() => setShowProjectListModal(false)}
          isFullscreen={true}
          showCloseButton={false}
        >
          <div
            className="relative top-1 z-50 mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300 ease-out transform scale-100 opacity-100 data-[state=closed]:scale-90 data-[state=closed]:opacity-0"
            data-state={showProjectListModal ? "open" : "closed"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-list-title"
          >
            <h2 id="project-list-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
              Associated Projects
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              This book is associated with the following projects:
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-900 dark:text-gray-100">
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
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowProjectListModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ComponentCard>
  );
}