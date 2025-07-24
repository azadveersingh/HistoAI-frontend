import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { fetchProcessingBooks, completeOcrProcess } from "../../services/bookServices";

interface ProcessingBook {
  _id: string;
  bookName: string;
  progress: number;
  ocrStatus: "pending" | "processing" | "failed";
}

export default function ProcessingBooks() {
  const [processingBooks, setProcessingBooks] = useState<ProcessingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchProcessingBooksData = async () => {
      try {
        setLoading(true);
        const books = await fetchProcessingBooks();
        setProcessingBooks(books);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load processing books");
        console.error("Error fetching processing books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessingBooksData();
  }, []);

  const handleCompleteOcr = async (bookId: string) => {
    if (role !== "book_manager") {
      setError("Only book managers can mark OCR as complete.");
      return;
    }

    try {
      await completeOcrProcess(bookId);
      setProcessingBooks((prev) => prev.filter((book) => book._id !== bookId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to complete OCR process");
      console.error("Error completing OCR process:", err);
    }
  };

  if (loading) return <div>Loading processing books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="Processing Books">
      <div className="flex flex-col gap-4">
        {processingBooks.length === 0 ? (
          <Alert
            variant="info"
            title="No Books Processing"
            message="There are no books currently being uploaded or processed."
          />
        ) : (
          <Table className="border-collapse">
            <TableHeader className="bg-gray-100 dark:bg-gray-800">
              <TableRow>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Book Name
                </TableCell>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Progress
                </TableCell>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Status
                </TableCell>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processingBooks.map((book) => (
                <TableRow
                  key={book._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="p-4">{book.bookName}</TableCell>
                  <TableCell className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{book.progress}%</span>
                  </TableCell>
                  <TableCell className="p-4 capitalize">{book.ocrStatus}</TableCell>
                  <TableCell className="p-4">
                    {book.ocrStatus === "pending" && (
                      <Button
                        variant="primary"
                        onClick={() => handleCompleteOcr(book._id)}
                        className="px-4 py-1 text-white bg-green-500 hover:bg-green-600"
                        disabled={role !== "book_manager"}
                      >
                        Done
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </ComponentCard>
  );
}