import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";

// Mock interface and data for demonstration
interface ProcessingBook {
  _id: string;
  bookName: string;
  progress: number; // Percentage (0-100)
  status: "uploading" | "processing" | "failed";
}

export default function ProcessingBooks() {
  const [processingBooks, setProcessingBooks] = useState<ProcessingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data fetching (replace with actual API call)
  useEffect(() => {
    // Simulate fetching processing books from an API
    const fetchProcessingBooks = async () => {
      try {
        setLoading(true);
        // Replace this with your actual API call to fetch processing books
        const mockBooks: ProcessingBook[] = [
          { _id: "1", bookName: "Book One", progress: 75, status: "uploading" },
          { _id: "2", bookName: "Book Two", progress: 30, status: "processing" },
          { _id: "3", bookName: "Book Three", progress: 0, status: "failed" },
        ];
        setProcessingBooks(mockBooks);
      } catch (err: any) {
        setError("Failed to load processing books");
        console.error("Error fetching processing books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessingBooks();
  }, []);

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
                  <TableCell className="p-4 capitalize">{book.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </ComponentCard>
  );
}