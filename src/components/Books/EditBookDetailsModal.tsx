import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal/index";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  author2?: string;
  edition?: string;
}

interface EditBookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onUpdate: (updatedBook: Book) => void;
}

interface FormData {
  bookName: string;
  author: string;
  author2: string;
  edition: string;
  errors: { bookName?: string; author?: string };
}

const EditBookDetailsModal: React.FC<EditBookDetailsModalProps> = ({
  isOpen,
  onClose,
  book,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<FormData>({
    bookName: "",
    author: "",
    author2: "",
    edition: "",
    errors: {},
  });
  const [showAuthor2, setShowAuthor2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (book) {
      setFormData({
        bookName: book.bookName || "",
        author: book.author || "",
        author2: book.author2 || "",
        edition: book.edition || "",
        errors: {},
      });
      setShowAuthor2(!!book.author2?.trim());
    } else {
      setFormData({
        bookName: "",
        author: "",
        author2: "",
        edition: "",
        errors: {},
      });
      setShowAuthor2(false);
    }
    setError("");
  }, [book, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.toUpperCase(),
      errors: { ...prev.errors, [field]: "" },
    }));
    setError("");
  };

  const toggleAuthor2 = () => {
    setShowAuthor2((prev) => !prev);
    if (showAuthor2) {
      handleInputChange("author2", "");
    }
  };

  const validateForm = () => {
    const errors: { bookName?: string; author?: string } = {};
    let isValid = true;

    if (!formData.bookName.trim()) {
      errors.bookName = "Book name is required";
      isValid = false;
    }
    if (!formData.author.trim()) {
      errors.author = "Primary author is required";
      isValid = false;
    }

    setFormData((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const handleSubmit = () => {
    if (role !== "book_manager") {
      setError("Only book managers can update book details.");
      return;
    }

    if (!validateForm()) {
      setError("Please fill in all required fields.");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    setError("");
    setShowConfirmDialog(false);

    try {
      if (!book) throw new Error("No book selected");
      await onUpdate({
        _id: book._id,
        bookName: formData.bookName,
        author: formData.author,
        author2: formData.author2,
        edition: formData.edition,
      });
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.response?.data?.error || "Failed to update book details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-5xl">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
            Edit Book Details
          </h2>
          <div className="space-y-5 flex-1">
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Book Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bookName}
                    onChange={(e) => handleInputChange("bookName", e.target.value)}
                    className={`w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase
                      ${formData.errors.bookName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    placeholder="Book Name (Unique)"
                    aria-required="true"
                  />
                  {formData.errors.bookName && (
                    <p className="mt-1 text-xs text-red-500">{formData.errors.bookName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Primary Author<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => handleInputChange("author", e.target.value)}
                      className={`w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase
                        ${formData.errors.author ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                      placeholder="Primary Author"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={toggleAuthor2}
                      className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      aria-label={showAuthor2 ? "Remove co-author field" : "Add co-author field"}
                      aria-expanded={showAuthor2}
                    >
                      <PlusIcon
                        className={`h-5 w-5 transform ${showAuthor2 ? "rotate-45" : ""}`}
                      />
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        (Author)
                      </span>
                    </button>
                  </div>
                  {formData.errors.author && (
                    <p className="mt-1 text-xs text-red-500">{formData.errors.author}</p>
                  )}
                </div>
                {showAuthor2 && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Co-Author <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.author2}
                      onChange={(e) => handleInputChange("author2", e.target.value)}
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
                    value={formData.edition}
                    onChange={(e) => handleInputChange("edition", e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Edition (Optional)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || role !== "book_manager"}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? "Updating..." : "Update Book"}
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
      <ConfirmDialog
        isOpen={showConfirmDialog}
        message="Are you sure you want to update the book details? This action cannot be undone."
        onConfirm={handleConfirmUpdate}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Update"
        isDestructive={false}
      />
    </>
  );
};

export default EditBookDetailsModal;