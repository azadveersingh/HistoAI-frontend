import { useEffect, useState } from "react";
import { fetchVisibleCollections, removeCollectionsFromProject } from "../../services/collectionServices";
import { fetchAllBooks } from "../../services/bookServices";
import ComponentCard from "../../components/common/ComponentCard";
import Checkbox from "../../components/form/input/Checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal/index";
import Alert from "../../components/ui/alert/Alert";

interface Collection {
  _id: string;
  name: string;
  bookIds: string[];
  projectId?: string;
  createdAt?: string;
}

interface Book {
  _id: string;
  bookName: string;
  projectId?: string;
}

interface ProjectCollectionsProps {
  projectId: string;
  searchQuery: string;
}

export default function ProjectCollections({ projectId, searchQuery }: ProjectCollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedCollections, setCheckedCollections] = useState<string[]>([]);
  const [initialCheckedCollections, setInitialCheckedCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookList, setSelectedBookList] = useState<Book[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  console.log("search query at project collections ", searchQuery);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [collectionsData, allBooks] = await Promise.all([
          fetchVisibleCollections(),
          fetchAllBooks(),
        ]);

        const filteredCollections = collectionsData.filter(
          (collection) => collection.projectId === projectId
        );

        const ids = filteredCollections.map((c) => c._id);
        setCollections(filteredCollections);
        setBooks(allBooks);
        setCheckedCollections(ids);
        setInitialCheckedCollections(ids);
      } catch (err) {
        console.error(err);
        setError("Failed to load project collections");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleCheckboxChange = (collectionId: string, checked: boolean) => {
    setCheckedCollections((prev) =>
      checked ? [...prev, collectionId] : prev.filter((id) => id !== collectionId)
    );
  };

  const handleSaveChanges = async () => {
    const removed = initialCheckedCollections.filter(
      (id) => !checkedCollections.includes(id)
    );

    if (removed.length === 0) {
      setAlert({
        variant: "info",
        title: "No Changes",
        message: "No collections were removed.",
      });
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to remove ${removed.length} collection(s) from the project?`
    );

    if (!confirm) return;

    try {
      await removeCollectionsFromProject(projectId, removed);

      setCollections((prev) => prev.filter((col) => !removed.includes(col._id)));
      setInitialCheckedCollections((prev) => prev.filter((id) => !removed.includes(id)));
      setCheckedCollections((prev) => prev.filter((id) => !removed.includes(id)));

      setAlert({
        variant: "success",
        title: "Collections Removed",
        message: `${removed.length} collection(s) removed from the project.`,
      });
    } catch (err: any) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while removing collections.",
      });
    }
  };

  const openBookModal = (collection: Collection) => {
    const bookList = books.filter((book) => collection.bookIds.includes(book._id));
    setSelectedBookList(bookList);
    setModalTitle(collection.name);
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

  // Filter collections based on searchQuery
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if there are any changes by comparing checkedCollections with initialCheckedCollections
  const hasChanges =
    checkedCollections.length !== initialCheckedCollections.length ||
    checkedCollections.some((id) => !initialCheckedCollections.includes(id)) ||
    initialCheckedCollections.some((id) => !checkedCollections.includes(id));

  if (loading) return <div>Loading project collections...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ComponentCard title="Project Collections">
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
                Collection Name
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                No. of Books
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Created At
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollections.map((collection) => (
              <TableRow
                key={collection._id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <TableCell className="p-4">
                  <Checkbox
                    id={`collection-${collection._id}`}
                    checked={checkedCollections.includes(collection._id)}
                    onChange={(checked) => handleCheckboxChange(collection._id, checked)}
                    label=""
                  />
                </TableCell>
                <TableCell className="p-4">{collection.name}</TableCell>
                <TableCell className="p-4">
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => openBookModal(collection)}
                  >
                    {collection.bookIds.length}
                  </button>
                </TableCell>
                <TableCell className="p-4">{formatDate(collection.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredCollections.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No collections found matching your search
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Books in "${modalTitle}"`}>
        <div className="space-y-2 p-4">
          {selectedBookList.length > 0 ? (
            selectedBookList.map((book) => (
              <div key={book._id} className="text-gray-800 dark:text-gray-100">
                {book.bookName || "Untitled"}
              </div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400">No books found.</div>
          )}
        </div>
      </Modal>
    </ComponentCard>
  );
}