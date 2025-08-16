import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import Button from "../components/ui/button/Button";
import BookDetailsModal from "./BookDetailsModal";
import PageBreadcrumb from "./common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketProvider";

const BookUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [failedUploads, setFailedUploads] = useState<
    Array<{ fileName: string; error: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ [key: string]: { ocr: number; structuredData: number; message: string } }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { subscribeToBookProgress, unsubscribeFromBookProgress } = useSocket();

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    let totalSize = 0;
    const validFiles: File[] = [];

    for (const file of acceptedFiles) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "pdf" && ext !== "docx") continue;

      totalSize += file.size;
      if (totalSize <= 150 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        break;
      }
    }

    if (validFiles.length !== acceptedFiles.length) {
      setError("Some files were not added. Ensure they are PDF/DOCX and total size ≤ 150MB.");
    } else {
      setError("");
    }

    console.log("handleDrop: Valid files:", validFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })));
    setFiles(validFiles);
    setFailedUploads([]);
  }, []);

  const handleModalOpen = () => {
    if (files.length === 0) {
      setError("No files selected. Please add files before proceeding.");
      return;
    }
    console.log("Opening modal with files:", files.map((f) => ({ name: f.name, size: f.size, type: f.type })));
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    console.log("Modal closed, current files:", files.map((f) => ({ name: f.name, size: f.size, type: f.type })));
    // Navigate to "Book Upload and Processing" tab
    navigate("/books/manage", { state: { tab: "tab2", refresh: true } });
  };

  const handleUploadSuccess = (response: any) => {
    setSuccess(true);
    setFiles([]);
    setFailedUploads(response.failed || []);
    response.files?.forEach((file: any) => {
      setProgress((prev) => ({
        ...prev,
        [file.bookId]: { ocr: 0, structuredData: 0, message: "Waiting for processing" },
      }));
    });
  };

  // Handle WebSocket progress updates
  useEffect(() => {
    const handleProgressUpdate = (data: any) => {
      const { book_id, status, message, progress, total_pages } = data;

      const toastConfig = {
        position: "top-right" as const,
        autoClose: 3000,
        theme: "colored" as const,
        toastId: `${book_id}-${status}`,
      };

      let toastMessage = message;
      if (status === "error") {
        if (message.includes("No valid chunks processed")) {
          toastMessage = "Structured data processing failed. Check LLM server response.";
        }
        toast.error(toastMessage, toastConfig);
      } else {
        toast.success(toastMessage, toastConfig);
      }

      setProgress((prev) => {
        const current = prev[book_id] || { ocr: 0, structuredData: 0, message: "Waiting for processing" };
        const isOcrStatus = ["start_ocr_processing", "ocr_done", "total_pages"].includes(status);
        const isStructuredDataStatus = ["start_data_extraction", "data_extraction_done"].includes(status);

        return {
          ...prev,
          [book_id]: {
            ocr: isOcrStatus ? (progress || current.ocr) : current.ocr,
            structuredData: isStructuredDataStatus ? (progress || current.structuredData) : current.structuredData,
            message: toastMessage,
          },
        };
      });

      if (status === "data_extraction_done") {
        setSuccess(true);
        navigate("/books/manage", { state: { tab: "tab1", refresh: true } });
      }
    };

    subscribeToBookProgress(handleProgressUpdate);
    return () => unsubscribeFromBookProgress(handleProgressUpdate);
  }, [subscribeToBookProgress, unsubscribeFromBookProgress, navigate]);

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <PageBreadcrumb pageTitle="Book Upload" />
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Upload Your Book
          </h2>

          <DropzoneComponent onDrop={handleDrop} />

          {files.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Selected Files:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1 text-gray-800 dark:text-gray-100">
                {files.map((file, index) => (
                  <li key={index}>
                    <span>{file.name}</span>{" "}
                    <span className="text-blue-500">
                      ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          {failedUploads.length > 0 && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm font-medium text-red-600 dark:text-red-200">
                Some uploads failed:
              </p>
              <ul className="list-disc pl-6 text-sm text-red-600 dark:text-red-200">
                {failedUploads.map((failed, index) => (
                  <li key={index}>
                    {failed.fileName}: {failed.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {success && !failedUploads.length && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg text-center">
              <p className="text-sm text-green-700 dark:text-green-200 font-medium">
                Book uploaded successfully! Check the Book Upload and Processing tab.
              </p>
            </div>
          )}

          {Object.keys(progress).length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Processing Status:
              </p>
              {Object.entries(progress).map(([bookId, status]) => (
                <div key={bookId} className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Book ID: {bookId}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${status.ocr}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    OCR Progress: {(status.ocr ?? 0).toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${status.structuredData}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Structured Data Progress: {(status.structuredData ?? 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {status.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button
              variant="primary"
              onClick={handleModalOpen}
              disabled={files.length === 0 || isSubmitting}
              className="px-6 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md"
            >
              {isSubmitting ? "Processing..." : "Proceed"}
            </Button>
          </div>
        </div>

        <BookDetailsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          files={files}
          setFiles={setFiles}
          setSuccess={handleUploadSuccess}
          setError={setError}
          setIsSubmitting={setIsSubmitting}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  );
};

export default BookUpload;