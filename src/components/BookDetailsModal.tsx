import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/ui/modal/index";
import Button from "../components/ui/button/Button";
import { uploadBooks } from "../services/bookServices";
import { PlusIcon } from "@heroicons/react/24/outline";

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
  setActiveTab?: (tab: "tab1" | "tab2") => void;
}

interface BookFormData {
  [key: string]: {
    bookName: string;
    author: string;
    author2: string;
    edition: string;
    errors?: { bookName?: string; author?: string };
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
  setActiveTab,
}) => {
  const [formData, setFormData] = useState<BookFormData>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showAuthor2, setShowAuthor2] = useState<{ [key: string]: boolean }>({});
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    setFormData((prev) => {
      const newFormData: BookFormData = { ...prev };
      files.forEach((file) => {
        if (!newFormData[file.name]) {
          newFormData[file.name] = { bookName: "", author: "", author2: "", edition: "", errors: {} };
        }
      });
      return newFormData;
    });
    setShowAuthor2((prev) => {
      const newShowAuthor2 = { ...prev };
      files.forEach((file) => {
        if (!(file.name in newShowAuthor2)) {
          newShowAuthor2[file.name] = false;
        }
      });
      return newShowAuthor2;
    });
  }, [files]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setShowAuthor2({});
      setError("");
    }
  }, [isOpen, setError]);

  const handleInputChange = (fileName: string, field: string, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [fileName]: {
          ...prev[fileName],
          [field]: value,
          errors: { ...prev[fileName].errors, [field]: "" },
        },
      };
      return updated;
    });
    setError("");
  };

  const toggleAuthor2 = (fileName: string) => {
    setShowAuthor2((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
    if (showAuthor2[fileName]) {
      handleInputChange(fileName, "author2", "");
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newFormData = { ...formData };

    files.forEach((file) => {
      const data = newFormData[file.name];
      data.errors = {};

      if (!data.bookName.trim()) {
        data.errors.bookName = "Book name is required";
        isValid = false;
      }
      if (!data.author.trim()) {
        data.errors.author = "Primary author is required";
        isValid = false;
      }
    });

    setFormData(newFormData);
    return isValid;
  };

  const handleSubmit = async () => {
    if (role !== "book_manager") {
      setError("Only book managers can upload books.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setError("");

    if (files.length === 0) {
      setError("No files selected for upload.");
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setError("Please fill in all required fields for each book.");
      setIsSubmitting(false);
      return;
    }

    try {
      for (const file of files) {
        const uploadData = new FormData();
        const data = formData[file.name];
        uploadData.append("files", file);
        uploadData.append("bookName", data.bookName.toUpperCase());
        uploadData.append("author", data.author.toUpperCase());
        uploadData.append("author2", data.author2.toUpperCase());
        uploadData.append("edition", data.edition.toUpperCase());

        // console.log(`FormData for ${file.name}:`);
        for (let [key, value] of uploadData.entries()) {
          console.log(`  ${key} = ${value instanceof File ? value.name : value}`);
        }

        await uploadBooks(uploadData);
      }

      setSuccess(true);
      setFormData({});
      setShowAuthor2({});
      setFiles([]);
      onClose();
      if (setActiveTab) {
        console.log("Switching to processing tab (tab2)");
        setActiveTab("tab2");
      }
      navigate("/books/manage", { state: { tab: "tab2" } });
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Failed to upload books. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-5xl">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
          Fill Book Details
        </h2>
        <div className="overflow-y-auto pr-2 space-y-5 flex-1">
          {files.map((file) => (
            <div
              key={file.name}
              className={`space-y-4 p-4 mb-4 rounded-lg transition-all duration-300
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
              <div
                className={`grid grid-cols-1 gap-4
                  ${showAuthor2[file.name] ? "md:grid-cols-4" : "md:grid-cols-3"}`}
              >
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
                    className={`w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase
                      ${formData[file.name]?.errors?.bookName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="Book Name (Unique)"
                    aria-required="true"
                  />
                  {formData[file.name]?.errors?.bookName && (
                    <p className="mt-1 text-xs text-red-500">{formData[file.name].errors.bookName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Primary Author<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData[file.name]?.author || ""}
                      onFocus={() => setActiveFile(file.name)}
                      onChange={(e) =>
                        handleInputChange(file.name, "author", e.target.value.toUpperCase())
                      }
                      className={`w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase
                        ${formData[file.name]?.errors?.author ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                      placeholder="Primary Author"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => toggleAuthor2(file.name)}
                      className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      aria-label={showAuthor2[file.name] ? "Remove co-author field" : "Add co-author field"}
                      aria-expanded={showAuthor2[file.name]}
                    >
                      <PlusIcon
                        className={`h-5 w-5 transform ${showAuthor2[file.name] ? "rotate-45" : ""}`}
                      />
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        (Author)
                      </span>
                    </button>
                  </div>
                  {formData[file.name]?.errors?.author && (
                    <p className="mt-1 text-xs text-red-500">{formData[file.name].errors.author}</p>
                  )}
                </div>
                {showAuthor2[file.name] && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Co-Author <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData[file.name]?.author2 || ""}
                      onFocus={() => setActiveFile(file.name)}
                      onChange={(e) =>
                        handleInputChange(file.name, "author2", e.target.value.toUpperCase())
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-gray-50 dark:bg-gray-800"
                      placeholder="Co-Author (Optional)"
                    />
                  </div>
                )}
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
        <div className="flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || role !== "book_manager"}
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