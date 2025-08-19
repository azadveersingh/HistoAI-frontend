// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
// import ComponentCard from "../../components/common/ComponentCard";
// import Alert from "../../components/ui/alert/Alert";
// import Button from "../../components/ui/button/Button";
// import { fetchProcessingBooks, completeOcrProcess } from "../../services/bookServices";
// import { useSocket } from "../../context/SocketProvider";

// interface ProcessingBook {
//   _id: string;
//   bookName: string;
//   progress: number;
//   totalPages: number;
//   currentPage: number;
//   ocrStatus: "pending" | "processing" | "failed" | "completed";
//   structuredDataStatus: "pending" | "processing" | "failed" | "completed";
//   structuredDataProgress: number;
//   statusMessage: string;
//   errorMessage?: string;
// }

// interface ProcessingBooksProps {
//   refreshTrigger?: number;
// }

// export default function ProcessingBooks({ refreshTrigger = 0 }: ProcessingBooksProps) {
//   const [processingBooks, setProcessingBooks] = useState<ProcessingBook[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const role = localStorage.getItem("role");
//   const { subscribeToBookProgress, unsubscribeFromBookProgress } = useSocket();

//   // Fetch initial processing books
//   const fetchProcessingBooksData = async () => {
//     try {
//       setLoading(true);
//       const books = await fetchProcessingBooks();
//       console.log("Fetched processing books:", books);
//       setProcessingBooks(books.map((book: any) => ({
//         ...book,
//         statusMessage: book.statusMessage || "Waiting for processing",
//         totalPages: book.totalPages || 0,
//         currentPage: book.currentPage || 0,
//         structuredDataStatus: book.structuredDataStatus || "pending",
//         structuredDataProgress: book.structuredDataProgress || 0,
//       })));
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Failed to load processing books");
//       console.error("Error fetching processing books:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle WebSocket progress updates
//   const handleProgressUpdate = (data: any) => {
//     const { book_id, status, message, progress, total_pages } = data;

//     // Map status to toast type and message
//     const toastConfig = {
//       position: "top-right" as const,
//       autoClose: 3000,
//       theme: "colored" as const,
//       toastId: `${book_id}-${status}`,
//     };

//     let toastMessage = message;
//     if (status === "error") {
//       if (message.includes("MKL_THREADING_LAYER")) {
//         toastMessage = "OCR failed due to a threading library conflict. Contact support.";
//       } else if (message.includes("No such option")) {
//         toastMessage = "OCR failed due to an invalid command option. Contact support.";
//       } else if (message.includes("No valid chunks processed")) {
//         toastMessage = "Structured data processing failed. Check LLM server response.";
//       }
//       toast.error(toastMessage, toastConfig);
//     } else {
//       toast.success(toastMessage, toastConfig);
//     }

//     setProcessingBooks((prev) => {
//       const existingBook = prev.find((book) => book._id === book_id);
//       let updatedBooks = [...prev];

//       if (status === "error") {
//         const errorMessage = toastMessage;
//         if (existingBook) {
//           updatedBooks = prev.map((book) =>
//             book._id === book_id
//               ? {
//                   ...book,
//                   ocrStatus: message.includes("OCR") ? "failed" : book.ocrStatus,
//                   structuredDataStatus: message.includes("Structured data") ? "failed" : book.structuredDataStatus,
//                   errorMessage,
//                   statusMessage: errorMessage,
//                 }
//               : book
//           );
//         } else {
//           updatedBooks.push({
//             _id: book_id,
//             bookName: message.split("'")[1] || "Unknown",
//             progress: 0,
//             totalPages: 0,
//             currentPage: 0,
//             ocrStatus: message.includes("OCR") ? "failed" : "pending",
//             structuredDataStatus: message.includes("Structured data") ? "failed" : "pending",
//             structuredDataProgress: 0,
//             statusMessage: errorMessage,
//             errorMessage,
//           });
//         }
//       } else {
//         const currentPage = status === "processing" && message.includes("Processing page")
//           ? parseInt(message.match(/page (\d+)/)?.[1] || "0")
//           : existingBook?.currentPage || 0;

//         const isOcrStatus = ["start_ocr_processing", "ocr_done", "total_pages"].includes(status);
//         const isStructuredDataStatus = ["start_data_extraction", "data_extraction_done"].includes(status);

//         if (existingBook) {
//           updatedBooks = prev.map((book) =>
//             book._id === book_id
//               ? {
//                   ...book,
//                   progress: isOcrStatus ? (progress || book.progress) : book.progress,
//                   totalPages: total_pages || book.totalPages,
//                   currentPage,
//                   ocrStatus: isOcrStatus
//                     ? status === "ocr_done"
//                       ? "completed"
//                       : status === "start_ocr_processing"
//                       ? "processing"
//                       : book.ocrStatus
//                     : book.ocrStatus,
//                   structuredDataStatus: isStructuredDataStatus
//                     ? status === "data_extraction_done"
//                       ? "completed"
//                       : "processing"
//                     : book.structuredDataStatus,
//                   structuredDataProgress: isStructuredDataStatus
//                     ? (progress || book.structuredDataProgress)
//                     : book.structuredDataProgress,
//                   statusMessage: message,
//                 }
//               : book
//           );
//         } else {
//           updatedBooks.push({
//             _id: book_id,
//             bookName: message.split("'")[1] || "Unknown",
//             progress: isOcrStatus ? (progress || 0) : 0,
//             totalPages: total_pages || 0,
//             currentPage,
//             ocrStatus: isOcrStatus ? (status === "ocr_done" ? "completed" : "processing") : "pending",
//             structuredDataStatus: isStructuredDataStatus ? (status === "data_extraction_done" ? "completed" : "processing") : "pending",
//             structuredDataProgress: isStructuredDataStatus ? (progress || 0) : 0,
//             statusMessage: message,
//           });
//         }
//       }

//       // Keep books until both OCR and structured data are completed
//       return updatedBooks.filter(
//         (book) => !(book.ocrStatus === "completed" && book.structuredDataStatus === "completed")
//       );
//     });
//   };

//   useEffect(() => {
//     // Subscribe to book_progress events
//     subscribeToBookProgress(handleProgressUpdate);

//     // Fetch initial data
//     fetchProcessingBooksData();

//     // Cleanup on unmount
//     return () => {
//       unsubscribeFromBookProgress(handleProgressUpdate);
//     };
//   }, [refreshTrigger, subscribeToBookProgress, unsubscribeFromBookProgress]);

//   const handleCompleteOcr = async (bookId: string) => {
//     if (role !== "book_manager") {
//       setError("Only book managers can mark OCR as complete.");
//       toast.error("Only book managers can mark OCR as complete.", {
//         position: "top-right",
//         autoClose: 3000,
//         theme: "colored",
//       });
//       return;
//     }

//     try {
//       await completeOcrProcess(bookId);
//       setProcessingBooks((prev) =>
//         prev.map((book) =>
//           book._id === bookId
//             ? { ...book, ocrStatus: "completed", statusMessage: "OCR process marked as complete" }
//             : book
//         )
//       );
//       setError(null);
//       toast.success("OCR process marked as complete!", {
//         position: "top-right",
//         autoClose: 3000,
//         theme: "colored",
//       });
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.error || "Failed to complete OCR process";
//       setError(errorMessage);
//       toast.error(errorMessage, {
//         position: "top-right",
//         autoClose: 3000,
//         theme: "colored",
//       });
//       console.error("Error completing OCR process:", err);
//     }
//   };

//   if (loading) return <div>Loading processing books...</div>;
//   if (error) return (
//     <div className="text-red-600 dark:text-red-400">
//       {error}
//     </div>
//   );

//   return (
//     <ComponentCard title="Processing Books">
//       <div className="flex flex-col gap-4">
//         {processingBooks.length === 0 ? (
//           <Alert
//             variant="info"
//             title="No Books Processing"
//             message="There are no books currently being uploaded or processed."
//           />
//         ) : (
//           <Table className="border-collapse">
//             <TableHeader className="bg-gray-100 dark:bg-gray-800">
//               <TableRow>
//                 <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                   Book Name
//                 </TableCell>
//                 <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                   OCR Progress
//                 </TableCell>
//                 <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                   Structured Data Progress
//                 </TableCell>
//                 <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                   Status
//                 </TableCell>
//                 <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                   Error Message
//                 </TableCell>
//                 <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                   Action
//                 </TableCell>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {processingBooks.map((book) => (
//                 <TableRow
//                   key={book._id}
//                   className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
//                 >
//                   <TableCell className="p-4">{book.bookName}</TableCell>
//                   <TableCell className="p-4">
//                     <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//                       <div
//                         className="bg-blue-600 h-2.5 rounded-full"
//                         style={{ width: `${book.progress}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-sm text-gray-600 dark:text-gray-300">
//                       {book.currentPage}/{book.totalPages} pages ({(book.progress ?? 0).toFixed(1)}%)
//                     </span>
//                   </TableCell>
//                   <TableCell className="p-4">
//                     <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//                       <div
//                         className="bg-green-600 h-2.5 rounded-full"
//                         style={{ width: `${book.structuredDataProgress}%` }}
//                       ></div>
//                     </div>
//                     <span className="text-sm text-gray-600 dark:text-gray-300">
//                       {(book.structuredDataProgress ?? 0).toFixed(1)}%
//                     </span>
//                     <div className="text-sm text-gray-500 dark:text-gray-400">
//                       {book.statusMessage}
//                     </div>
//                   </TableCell>
//                   <TableCell className="p-4 capitalize">
//                     {book.ocrStatus} / {book.structuredDataStatus}
//                   </TableCell>
//                   <TableCell className="p-4">{book.errorMessage || "N/A"}</TableCell>
//                   <TableCell className="p-4">
//                     {book.ocrStatus === "pending" && (
//                       <Button
//                         variant="primary"
//                         onClick={() => handleCompleteOcr(book._id)}
//                         className="px-4 py-1 text-white bg-green-500 hover:bg-green-600"
//                         disabled={role !== "book_manager"}
//                       >
//                         Complete OCR
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </div>
//     </ComponentCard>
//   );
// }




import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { fetchProcessingBooks, completeOcrProcess } from "../../services/bookServices";
import { useSocket } from "../../context/SocketProvider";

interface ProcessingBook {
  _id: string;
  bookName: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  totalChunks: number; // Added for chunk-based progress
  processedChunks: number; // Added for chunk-based progress
  ocrStatus: "pending" | "processing" | "failed" | "completed";
  structuredDataStatus: "pending" | "processing" | "failed" | "completed";
  structuredDataProgress: number;
  statusMessage: string;
  errorMessage?: string;
}

interface ProcessingBooksProps {
  refreshTrigger?: number;
}

export default function ProcessingBooks({ refreshTrigger = 0 }: ProcessingBooksProps) {
  const [processingBooks, setProcessingBooks] = useState<ProcessingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = localStorage.getItem("role");
  const { subscribeToBookProgress, unsubscribeFromBookProgress } = useSocket();

  // Fetch initial processing books
  const fetchProcessingBooksData = async () => {
    try {
      setLoading(true);
      const books = await fetchProcessingBooks();
      console.log("Fetched processing books:", books);
      setProcessingBooks(books.map((book: any) => ({
        ...book,
        statusMessage: book.statusMessage || "Waiting for processing",
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage || 0,
        totalChunks: book.totalChunks || 0, // Initialize
        processedChunks: book.processedChunks || 0, // Initialize
        structuredDataStatus: book.structuredDataStatus || "pending",
        structuredDataProgress: book.structuredDataProgress || 0,
      })));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load processing books");
      console.error("Error fetching processing books:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle WebSocket progress updates
  const handleProgressUpdate = (data: any) => {
    const { book_id, status, message, progress, total_pages, total_chunks, processed_chunks, bookName } = data;

    // Map status to toast type and message
    const toastConfig = {
      position: "top-right" as const,
      autoClose: 3000,
      theme: "colored" as const,
      toastId: `${book_id}-${status}`,
    };

    let toastMessage = message;
    if (status === "error") {
      if (message.includes("MKL_THREADING_LAYER")) {
        toastMessage = "OCR failed due to a threading library conflict. Contact support.";
      } else if (message.includes("No such option")) {
        toastMessage = "OCR failed due to an invalid command option. Contact support.";
      } else if (message.includes("No valid chunks processed")) {
        toastMessage = "Structured data processing failed. Check LLM server response.";
      }
      toast.error(toastMessage, toastConfig);
    } else {
      toast.success(toastMessage, toastConfig);
    }

    setProcessingBooks((prev) => {
      const existingBook = prev.find((book) => book._id === book_id);
      let updatedBooks = [...prev];

      if (status === "error") {
        const errorMessage = toastMessage;
        if (existingBook) {
          updatedBooks = prev.map((book) =>
            book._id === book_id
              ? {
                  ...book,
                  ocrStatus: message.includes("OCR") ? "failed" : book.ocrStatus,
                  structuredDataStatus: message.includes("Structured data") ? "failed" : book.structuredDataStatus,
                  errorMessage,
                  statusMessage: message, // Use original message for status
                }
              : book
          );
        } else {
          updatedBooks.push({
            _id: book_id,
            bookName: bookName || message.split("'")[1] || "Unknown", // Prefer bookName from payload
            progress: 0,
            totalPages: 0,
            currentPage: 0,
            totalChunks: 0,
            processedChunks: 0,
            ocrStatus: message.includes("OCR") ? "failed" : "pending",
            structuredDataStatus: message.includes("Structured data") ? "failed" : "pending",
            structuredDataProgress: 0,
            statusMessage: message,
            errorMessage,
          });
        }
      } else {
        const currentPage = status === "processing" && message.includes("Processing page")
          ? parseInt(message.match(/page (\d+)/)?.[1] || "0")
          : existingBook?.currentPage || 0;

        const isOcrStatus = ["book_received", "total_pages", "start_ocr_processing", "ocr_done"].includes(status);
        const isStructuredDataStatus = ["start_data_extraction", "data_extraction_progress", "data_extraction_done"].includes(status);

        if (status === "book_processing_complete") {
          if (existingBook) {
            updatedBooks = prev.map((book) =>
              book._id === book_id
                ? {
                    ...book,
                    ocrStatus: "completed",
                    structuredDataStatus: "completed",
                    statusMessage: message,
                  }
                : book
            );
          } else {
            updatedBooks.push({
              _id: book_id,
              bookName: bookName || message.split("'")[1] || "Unknown",
              progress: 100,
              totalPages: total_pages || 0,
              currentPage: total_pages || 0,
              totalChunks: total_chunks || 0,
              processedChunks: processed_chunks || 0,
              ocrStatus: "completed",
              structuredDataStatus: "completed",
              structuredDataProgress: 100,
              statusMessage: message,
            });
          }
        } else if (existingBook) {
          updatedBooks = prev.map((book) =>
            book._id === book_id
              ? {
                  ...book,
                  progress: isOcrStatus ? (progress || book.progress) : book.progress,
                  totalPages: total_pages || book.totalPages,
                  currentPage,
                  totalChunks: total_chunks || book.totalChunks,
                  processedChunks: processed_chunks || book.processedChunks,
                  ocrStatus: isOcrStatus
                    ? status === "ocr_done"
                      ? "completed"
                      : status === "start_ocr_processing"
                      ? "processing"
                      : book.ocrStatus
                    : book.ocrStatus,
                  structuredDataStatus: isStructuredDataStatus
                    ? status === "data_extraction_done"
                      ? "completed"
                      : status === "start_data_extraction" || status === "data_extraction_progress"
                      ? "processing"
                      : book.structuredDataStatus
                    : book.structuredDataStatus,
                  structuredDataProgress: isStructuredDataStatus
                    ? (progress || book.structuredDataProgress)
                    : book.structuredDataProgress,
                  statusMessage: message,
                }
              : book
          );
        } else {
          updatedBooks.push({
            _id: book_id,
            bookName: bookName || message.split("'")[1] || "Unknown",
            progress: isOcrStatus ? (progress || 0) : 0,
            totalPages: total_pages || 0,
            currentPage,
            totalChunks: total_chunks || 0,
            processedChunks: processed_chunks || 0,
            ocrStatus: isOcrStatus ? (status === "ocr_done" ? "completed" : "processing") : "pending",
            structuredDataStatus: isStructuredDataStatus ? (status === "data_extraction_done" ? "completed" : "processing") : "pending",
            structuredDataProgress: isStructuredDataStatus ? (progress || 0) : 0,
            statusMessage: message,
          });
        }
      }

      // Keep books until both OCR and structured data are completed
      return updatedBooks.filter(
        (book) => !(book.ocrStatus === "completed" && book.structuredDataStatus === "completed")
      );
    });
  };

  useEffect(() => {
    // Subscribe to book_progress events
    subscribeToBookProgress(handleProgressUpdate);

    // Fetch initial data
    fetchProcessingBooksData();

    // Cleanup on unmount
    return () => {
      unsubscribeFromBookProgress(handleProgressUpdate);
    };
  }, [refreshTrigger, subscribeToBookProgress, unsubscribeFromBookProgress]);

  const handleCompleteOcr = async (bookId: string) => {
    if (role !== "book_manager") {
      setError("Only book managers can mark OCR as complete.");
      toast.error("Only book managers can mark OCR as complete.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      await completeOcrProcess(bookId);
      setProcessingBooks((prev) =>
        prev.map((book) =>
          book._id === bookId
            ? { ...book, ocrStatus: "completed", statusMessage: "OCR process marked as complete" }
            : book
        )
      );
      setError(null);
      toast.success("OCR process marked as complete!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to complete OCR process";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Error completing OCR process:", err);
    }
  };

  if (loading) return <div>Loading processing books...</div>;
  if (error) return (
    <div className="text-red-600 dark:text-red-400">
      {error}
    </div>
  );

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
                  OCR Progress
                </TableCell>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Structured Data Progress
                </TableCell>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Status
                </TableCell>
                <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Error Message
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
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {book.currentPage}/{book.totalPages} pages ({(book.progress ?? 0).toFixed(1)}%)
                    </span>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${book.structuredDataProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {book.processedChunks}/{book.totalChunks} chunks ({(book.structuredDataProgress ?? 0).toFixed(1)}%)
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {book.statusMessage}
                    </div>
                  </TableCell>
                  <TableCell className="p-4 capitalize">
                    {book.ocrStatus} / {book.structuredDataStatus}
                  </TableCell>
                  <TableCell className="p-4">{book.errorMessage || "N/A"}</TableCell>
                  <TableCell className="p-4">
                    {book.ocrStatus === "pending" && (
                      <Button
                        variant="primary"
                        onClick={() => handleCompleteOcr(book._id)}
                        className="px-4 py-1 text-white bg-green-500 hover:bg-green-600"
                        disabled={role !== "book_manager"}
                      >
                        Complete OCR
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