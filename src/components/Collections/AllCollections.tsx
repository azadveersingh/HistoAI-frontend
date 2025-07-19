import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVisibleCollections } from "../../services/collectionServices";
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
}

export default function AllCollections({ hideCreateButton = false }: AllCollectionsProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedCollections, setCheckedCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBookList, setSelectedBookList] = useState<Book[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
  
        const [collectionsData, allBooks] = await Promise.all([
          fetchVisibleCollections(),
          fetchAllBooks(),
        ]);
  
        setCollections(collectionsData);
        setBooks(allBooks);
  
        if (projectId) {
          const projectBookIds = new Set(
            allBooks
              .filter((book) => book.projectId === projectId)
              .map((book) => book._id)
          );
  
          const collectionsWithProjectBooks = collectionsData
            .filter((collection: Collection) =>
              collection.bookIds.some((bookId) => projectBookIds.has(bookId))
            )
            .map((collection: Collection) => collection._id);

          setCheckedCollections(collectionsWithProjectBooks);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load collections or books");
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [projectId]);

  const handleCheckboxChange = (collectionId: string, checked: boolean) => {
    setCheckedCollections((prev) =>
      checked
        ? [...prev, collectionId]
        : prev.filter((id) => id !== collectionId)
    );
  };

  const handleAddToProject = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    try {
      const response = await fetch(`/api/collections/${projectId}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ collectionIds: checkedCollections }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add collections");
      }

      alert("Collections added to project successfully.");
      setCheckedCollections([]);
    } catch (err) {
      console.error(err);
      alert(err.message || "Error adding collections to project.");
    }
  };

  const handleCreateCollection = () => {
    navigate(`/collections/create/${projectId || ''}`, { state: { projectId } });
  };

  const sortedCollections = [...collections].sort((a, b) => {
    const aChecked = checkedCollections.includes(a._id);
    const bChecked = checkedCollections.includes(b._id);
    if (aChecked && !bChecked) return -1;
    if (!aChecked && bChecked) return 1;
    return a.name.localeCompare(b.name);
  });

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

  if (loading) return <div>Loading collections...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ComponentCard
      title={
        hideCreateButton ? (
          <span>All Collections</span>
        ) : (
          <div className="flex justify-between items-center">
            <span>All Collections</span>
            <Button
              onClick={handleCreateCollection}
              variant="primary"
              className="text-sm py-1 px-3"
            >
              Create Collection
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <Table className="border-collapse">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Select</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Collection Name</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">No. of Books</TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">Created At</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCollections.map((collection) => (
              <TableRow key={collection._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
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
                <TableCell className="p-4">{formatDate(collection.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {collections.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No collections available
          </div>
        )}

        <div className="mt-4 self-end">
          <Button
            onClick={handleAddToProject}
            disabled={checkedCollections.length === 0}
            variant="primary"
          >
            Add Selected to Project
          </Button>
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