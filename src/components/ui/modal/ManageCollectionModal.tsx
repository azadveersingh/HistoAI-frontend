import React from "react";
import { Modal } from "./index";

interface ManageCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
   noBackdrop?: boolean;
}

const ManageCollectionModal: React.FC<ManageCollectionModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      isFullscreen={false}
      className="max-w-[400px] p-6"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Manage Collections
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              onClose();
              onNavigate("/collections/create");
            }}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded"
          >
            Create Collection
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigate("/dashboard/collections");
            }}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded"
          >
            View Collections
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageCollectionModal;
