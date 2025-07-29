
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchVisibleCollections, fetchProjectCollections, addCollectionsToProject, deleteCollection } from "../../services/collectionServices";
import { fetchAllBooks } from "../../services/bookServices";
import Checkbox from "../../components/form/input/Checkbox";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal/index";
import Alert from "../../components/ui/alert/Alert";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
import ConfirmDialogWithInput from "../../components/ui/confirmation/ConfirmDialogWithInput";

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
}

interface AllCollectionsProps {
  hideCreateButton?: boolean;
  searchQuery?: string;
}

export default function AllCollections({ hideCreateButton = false, searchQuery = "" }: AllCollectionsProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedCollections, setCheckedCollections] = useState<string[]>([]);
  const [projectCollectionIds, setProjectCollectionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookList, setSelectedBookList] = useState<Book[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);

  const isDashboardCollections = location.pathname === "/dashboard/collections";

  console.log("search query on all collections:", searchQuery);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [collectionsData, allBooks, projectCollections] = await Promise.all([
          fetchVisibleCollections(),
          fetchAllBooks(),
          projectId ? fetchProjectCollections(projectId) : Promise.resolve([]),
        ]);

        console.log("Fetched visible collections:", collectionsData);
        console.log("Fetched project collections:", projectCollections);

        setCollections(collectionsData);
        setBooks(allBooks);
        setProjectCollectionIds(projectCollections.map((c: Collection) => c._id));
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load collections or books";
        setError(errorMessage);
        console.error("Error loading data:", err);
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

  const handleAddToProject = async () => {
    if (!projectId) {
      setAlert({
        variant: "error",
        title: "No Project Selected",
        message: "Please navigate to a project to add collections.",
      });
      return;
    }

    if (checkedCollections.length === 0) {
      setAlert({
        variant: "info",
        title: "No Collections Selected",
        message: "Please select at least one collection to add to the project.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmAdd = async () => {
    try {
      await addCollectionsToProject(projectId!, checkedCollections);
      setProjectCollectionIds((prev) => [...prev, ...checkedCollections]);
      setCheckedCollections([]);
      setAlert({
        variant: "success",
        title: "Collections Added",
        message: `${checkedCollections.length} collection(s) added to the project successfully.`,
      });
    } catch (err: any) {
      console.error("Error adding collections to project:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while adding collections to the project.",
      });
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleRemoveCollections = async () => {
    if (checkedCollections.length === 0) {
      setAlert({
        variant: "info",
        title: "No Collections Selected",
        message: "Please select at least one collection to remove.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = () => {
    setShowConfirmDialog(false);
    setShowInputDialog(true);
  };

  const handleConfirmInput = async () => {
    try {
      for (const collectionId of checkedCollections) {
        await deleteCollection(collectionId);
      }
      setCollections((prev) => prev.filter((c) => !checkedCollections.includes(c._id)));
      setCheckedCollections([]);
      setAlert({
        variant: "success",
        title: "Collections Removed",
        message: `${checkedCollections.length} collection(s) deleted successfully.`,
      });
    } catch (err: any) {
      console.error("Error removing collections:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while removing collections.",
      });
    } finally {
      setShowInputDialog(false);
    }
  };

  const handleCreateCollection = () => {
    navigate("/collections/create");
  };

  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      const aChecked = checkedCollections.includes(a._id);
      const bChecked = checkedCollections.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [collections, checkedCollections]);

  const filteredCollections = useMemo(
    () =>
      sortedCollections.filter((collection) =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sortedCollections, searchQuery]
  );

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

  if (loading) return <div className="text-gray-800 dark:text-gray-100">Loading collections...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard
      title={
        hideCreateButton ? (
          <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
            All Collections
          </span>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full gap-2">
            <div className="flex-1 text-center">
              <span className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-gray-100">
                All Collections
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDashboardCollections ? (
                <Button
                  onClick={handleRemoveCollections}
                  disabled={checkedCollections.length === 0}
                  variant="primary"
                  title={checkedCollections.length === 0 ? "Select at least one collection to remove" : ""}
                  className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                >
                  Remove Collection
                </Button>
              ) : (
                <Button
                  onClick={handleAddToProject}
                  disabled={checkedCollections.length === 0 || !projectId}
                  variant="primary"
                  title={checkedCollections.length === 0 ? "Select at least one collection to add" : ""}
                  className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                >
                  Add Selected to Project
                </Button>
              )}
              <Button
                onClick={handleCreateCollection}
                variant="primary"
                className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
              >
                Create Collection
              </Button>
            </div>
          </div>
        )
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
        <div className="max-h-[77vh] overflow-y-auto overflow-x-auto w-full">
          <Table className="border-collapse min-w-full">
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className="p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  Select
                </TableCell>
                <TableCell isHeader className="p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  Collection Name
                </TableCell>
                <TableCell isHeader className="p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  No. of Books
                </TableCell>
                <TableCell isHeader className="p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  Created At
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-2 sm:p-4 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    No collections found matching your search
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollections.map((collection) => (
                  <TableRow
                    key={collection._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className="p-2 sm:p-4">
                      {projectId && projectCollectionIds.includes(collection._id) ? (
                        <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`collection-${collection._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => {}}
                            label=""
                          />
                        </div>
                      ) : (
                        <Checkbox
                          id={`collection-${collection._id}`}
                          checked={checkedCollections.includes(collection._id)}
                          onChange={(checked) => handleCheckboxChange(collection._id, checked)}
                          label=""
                        />
                      )}
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
                        onClick={() => navigate(`/collections/${collection._id}`)}
                      >
                        {collection.name}
                      </button>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
                        onClick={() => {
                          const bookList = books.filter((book) => collection.bookIds.includes(book._id));
                          setSelectedBookList(bookList);
                          setModalTitle(collection.name);
                          setShowModal(true);
                        }}
                      >
                        {collection.bookIds.length}
                      </button>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">
                      {formatDate(collection.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Books in "${modalTitle}"`}>
          <div className="space-y-2 p-2 sm:p-4">
            {selectedBookList.length > 0 ? (
              selectedBookList.map((book) => (
                <div key={book._id} className="text-sm sm:text-base text-gray-800 dark:text-gray-100">
                  {book.bookName || "Untitled"}
                </div>
              ))
            ) : (
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No books found.</div>
            )}
          </div>
        </Modal>
        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={
            isDashboardCollections
              ? `Are you sure you want to delete ${checkedCollections.length} collection(s)? This action cannot be undone.`
              : `Are you sure you want to add ${checkedCollections.length} collection(s) to the project?`
          }
          onConfirm={isDashboardCollections ? handleConfirmRemove : handleConfirmAdd}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText={isDashboardCollections ? "OK" : "Add"}
          isDestructive={isDashboardCollections}
        />
        <ConfirmDialogWithInput
          isOpen={showInputDialog}
          message={`To confirm deletion of ${checkedCollections.length} collection(s), please type "Delete" below:`}
          onConfirm={handleConfirmInput}
          onCancel={() => setShowInputDialog(false)}
          confirmText="OK"
          isDestructive={true}
        />
      </div>
    </ComponentCard>
  );
}
