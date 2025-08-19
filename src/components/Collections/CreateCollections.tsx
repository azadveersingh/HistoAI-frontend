import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { fetchAllBooks } from "../../services/bookServices";
import { createCollection } from "../../services/collectionServices";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import ComponentCard from "../common/ComponentCard";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  createdAt?: string;
  pages?: number;
  visibility?: "public" | "private";
}

const CollectionCreate: React.FC = () => {
  const { id: projectIdFromParams } = useParams<{ id: string }>();
  const location = useLocation();
  const { projectId: projectIdFromState } = location.state || {};
  const projectId = projectIdFromState || projectIdFromParams;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bookOptions, setBookOptions] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const booksData = await fetchAllBooks("public"); // Fetch only public books
        const validBooks = booksData.filter(
          (book: Book) => book && book._id && typeof book._id === "string" && book.visibility === "public"
        );
        if (booksData.length !== validBooks.length) {
          console.warn("Filtered out invalid or non-public books:", booksData.filter((book: Book) => !validBooks.includes(book)));
        }
        setBookOptions(validBooks);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load public books");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setSelectedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Collection name is required");
      return;
    }
    if (selectedBooks.length === 0) {
      setError("Please select at least one public book");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        name,
        bookIds: selectedBooks,
        projectId,
      };
      await createCollection(payload);
      setName("");
      setSelectedBooks([]);
      setSearchQuery("");
      setShowSuccessAlert(true);
      if (!createAnother) {
        navigate("/dashboard/collections", {
          state: { projectId },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create collection");
    } finally {
      setIsSubmitting(false);
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

  const sortedBooks = useMemo(() => {
    return [...bookOptions].sort((a, b) => {
      const aChecked = selectedBooks.includes(a._id);
      const bChecked = selectedBooks.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      const aBookName = a.bookName || "Untitled";
      const bBookName = b.bookName || "Untitled";
      return aBookName.localeCompare(bBookName);
    });
  }, [bookOptions, selectedBooks]);

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

  const isCreateButtonDisabled = !name.trim() || selectedBooks.length === 0 || isSubmitting;

  if (loading) return (
    <div className="text-gray-600 dark:text-gray-400 text-center p-4">
      Loading public books...
    </div>
  );
  if (error && !bookOptions.length) {
    return (
      <Alert
        variant="error"
        title="Error"
        message={error}
      />
    );
  }

  return (
    <ComponentCard title="Create New Collection">
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {(showSuccessAlert || error) && (
          <Alert
            variant={showSuccessAlert ? "success" : "error"}
            title={showSuccessAlert ? "Collection Created" : "Error"}
            message={
              showSuccessAlert ? "Your collection has been created successfully." : error
            }
          />
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="w-full sm:max-w-md space-y-4">
              <div>
                <Label htmlFor="collection-name" className="text-gray-700 dark:text-gray-200">
                  Collection Name
                </Label>
                <Input
                  id="collection-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter collection name"
                  className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:focus:ring-brand-400"
                />
              </div>
              <Checkbox
                id="create-another"
                checked={createAnother}
                onChange={(checked) => setCreateAnother(checked)}
                label="Create another collection after this one"
                className="text-gray-900 dark:text-gray-100"
              />
            </div>
            <Button
              type="submit"
              disabled={isCreateButtonDisabled}
              variant="primary"
              className="w-full sm:w-40 h-11 rounded-lg bg-brand-500 text-white font-medium text-sm transition-colors hover:bg-brand-600 dark:hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Select Public Books
              </h3>
              <div className="w-full sm:w-64">
                <Label htmlFor="search-books" className="text-gray-700 dark:text-gray-200">
                  Search Books
                </Label>
                <Input
                  id="search-books"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search public books..."
                  className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:focus:ring-brand-400"
                />
              </div>
            </div>

            <div className="relative overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
              <Table className="border-collapse w-full min-w-[600px]">
                <TableHeader className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                  <TableRow>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 w-16">
                      Select
                    </TableCell>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                      Book Name
                    </TableCell>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[120px]">
                      Author
                    </TableCell>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[80px]">
                      Edition
                    </TableCell>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[100px]">
                      Created At
                    </TableCell>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[80px]">
                      Pages
                    </TableCell>
                    <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[80px]">
                      Visibility
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400">
                        No public books found matching your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((book) => (
                      <TableRow
                        key={book._id}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <TableCell className="p-3 sm:p-4">
                          <Checkbox
                            id={`book-${book._id}`}
                            checked={selectedBooks.includes(book._id)}
                            onChange={(checked) => handleCheckboxChange(book._id, checked)}
                            label=""
                            className="text-gray-900 dark:text-gray-100"
                          />
                        </TableCell>
                        <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                          {book.bookName || "Untitled"}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                          {book.author || "Unknown Author"}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100">
                          {book.edition || "N/A"}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100">
                          {formatDate(book.createdAt)}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100">
                          {book.pages || "N/A"}
                        </TableCell>
                        <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 capitalize">
                          {book.visibility || "Public"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </form>
      </div>
    </ComponentCard>
  );
};

export default CollectionCreate;