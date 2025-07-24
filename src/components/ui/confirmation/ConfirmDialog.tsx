import React, { useEffect, useRef } from "react";
import { Modal } from "../../ui/modal/index";
import Button from "../../ui/button/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key (complements Modal's built-in handler)
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      showCloseButton={false}
      isFullscreen={true}
      className="fixed top-1 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[90%] sm:max-w-md "
    >
      <div
        ref={dialogRef}
        className={`
          bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700
          p-4 sm:p-5
          transform transition-all duration-300 ease-out
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-4"}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
      >
        <h2
          id="confirm-dialog-title"
          className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 text-center"
        >
          Confirm Action
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end gap-2 sm:gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium transition-transform duration-200 hover:scale-105"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium
              transition-transform duration-200 hover:scale-105
              ${isDestructive
                ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : ""}
            `}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;