
import { useState, useEffect, useRef } from "react";
import { Modal } from "../modal/index";
import Button from "../button/Button";

interface ConfirmDialogWithInputProps {
  isOpen: boolean;
  message: string;
  onConfirm: (input: string) => void;
  onCancel: () => void;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialogWithInput({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  isDestructive = false,
}: ConfirmDialogWithInputProps) {
  const [inputValue, setInputValue] = useState("");
  const isInputValid = inputValue === "Delete"; // Case-sensitive check
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setInputValue(""); // Reset input when dialog opens
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && isInputValid) {
      onConfirm(inputValue); // Pass inputValue on Enter only if valid
    } else if (event.key === "Escape") {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (isInputValid) {
      onConfirm(inputValue); // Pass inputValue on button click only if valid
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} isFullscreen={true} showCloseButton={false}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative top-1 z-50 mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300 ease-out transform scale-100 opacity-100 data-[state=closed]:scale-90 data-[state=closed]:opacity-0"
        data-state={isOpen ? "open" : "closed"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
          Confirm Deletion
        </h2>
        <p id="dialog-description" className="mt-2 text-gray-600 dark:text-gray-300">
          {message}
        </p>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Type <span className="font-semibold">"Delete"</span> to confirm:
        </p>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`mt-2 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
            isInputValid
              ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              : "border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400"
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          placeholder="Type 'Delete' here"
          aria-label="Confirm deletion by typing Delete"
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "primary" : "outline"}
            onClick={handleConfirm}
            disabled={!isInputValid}
            className={`px-4 py-2 ${
              isDestructive
                ? isInputValid
                  ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  : "bg-red-300 text-white cursor-not-allowed dark:bg-red-700 dark:text-gray-300"
                : isInputValid
                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                : "bg-blue-300 text-white cursor-not-allowed dark:bg-blue-700 dark:text-gray-300"
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
