import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import Button from "../components/ui/button/Button";
import BookDetailsModal from "./BookDetailsModal";
import PageBreadcrumb from "./common/PageBreadCrumb";

const BookUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const location = useLocation();
  const setActiveTab = location.state?.setActiveTab; // Get setActiveTab from navigation state

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
    // Do not clear files here to prevent accidental loss
    console.log("Modal closed, current files:", files.map((f) => ({ name: f.name, size: f.size, type: f.type })));
  };

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

        {success && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 p-4 rounded-lg text-center">
            <p className="text-sm text-green-700 dark:text-green-200 font-medium">
              Book uploaded successfully!
            </p>
          </div>
        )}

        <BookDetailsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          files={files}
          setFiles={setFiles}
          setSuccess={setSuccess}
          setError={setError}
          setIsSubmitting={setIsSubmitting}
          isSubmitting={isSubmitting}
          error={error}
          setActiveTab={setActiveTab} // Pass setActiveTab to BookDetailsModal
        />
      </div>
    </div>
  );
};

export default BookUpload;