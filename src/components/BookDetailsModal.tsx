import React, { useState, useEffect } from "react";
import { Modal } from "../components/ui/modal/index";
import Button from "../components/ui/button/Button";
// import { uploadBooks } from "../services/uploadBooks";

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  setFiles: (files: File[]) => void;
  setSuccess: (success: boolean) => void;
  setError: (error: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isSubmitting: boolean;
  error: string;
}

interface BookFormData {
  [key: string]: {
    bookName: string;
    author: string;
    edition: string;
  };
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  isOpen,
  onClose,
  files,
  setFiles,
  setSuccess,
  setError,
  setIsSubmitting,
  isSubmitting,
  error,
}) => {
  const [formData, setFormData] = useState<BookFormData>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    setFormData((prev) => {
      const newFormData: BookFormData = { ...prev };
      files.forEach((file) => {
        if (!newFormData[file.name]) {
          newFormData[file.name] = { bookName: "", author: "", edition: "" };
        }
      });
      return newFormData;
    });
  }, [files]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setError("");
    }
  }, [isOpen, setError]);

  const handleInputChange = (fileName: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fileName]: { ...prev[fileName], [field]: value },
    }));
    setError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const hasEmptyFields = files.some((file) => {
      const data = formData[file.name];
      return !data.bookName || !data.author;
    });

    if (hasEmptyFields || files.length === 0) {
      setError("Please fill in all fields marked with * for each book.");
      setIsSubmitting(false);
      return;
    }

    const uploadData = new FormData();
    files.forEach((file) => {
      const data = formData[file.name];
      uploadData.append("bookName", data.bookName.toUpperCase());
      uploadData.append("author", data.author.toUpperCase());
      uploadData.append("edition", data.edition.toUpperCase());
      uploadData.append("files", file);
    });

    try {
      await uploadBooks(uploadData);
      setSuccess(true);
      setFormData({});
      setFiles([]);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload books. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-5xl">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
          Fill Book Details
        </h2>

        {/* Scrollable content */}
        <div className="overflow-y-auto pr-2 space-y-5 flex-1">
          {files.map((file) => (
            <div
              key={file.name}
              className={`space-y-4 p-4 mb-4 rounded-lg
                ${activeFile === file.name
                  ? "border-2 border-blue-500 dark:ring-blue-500"
                  : "border border-gray-200 dark:border-gray-700"}
              `}
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {file.name}{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Book Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData[file.name]?.bookName || ""}
                    onFocus={() => setActiveFile(file.name)}
                    onChange={(e) =>
                      handleInputChange(file.name, "bookName", e.target.value.toUpperCase())
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Book Name (Unique)"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Author Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData[file.name]?.author || ""}
                    onFocus={() => setActiveFile(file.name)}
                    onChange={(e) =>
                      handleInputChange(file.name, "author", e.target.value.toUpperCase())
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Author Name"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Edition <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData[file.name]?.edition || ""}
                    onFocus={() => setActiveFile(file.name)}
                    onChange={(e) =>
                      handleInputChange(file.name, "edition", e.target.value.toUpperCase())
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Edition (Optional)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSubmitting ? "Processing..." : "Start Processing"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-gray-400 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </Modal>
  );
};

export default BookDetailsModal;
