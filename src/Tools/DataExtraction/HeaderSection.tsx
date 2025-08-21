import React from "react";
import { FaDownload } from "react-icons/fa";
import { downloadExcel } from "./downloadExcel";

interface HeaderSectionProps {
  pdfUrl?: string;
  pdfName?: string;
  bookId?: string;
  projectId?: string;
  selectedBooks?: string[];
  selectedCollections?: string[];
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  pdfUrl,
  pdfName,
  bookId,
  projectId,
  selectedBooks = [],
  selectedCollections = [],
}) => {
  const handleDownload = () => {
    const filename = projectId ? `project_${projectId}_structured.xlsx` : `book_${bookId}_structured.xlsx`;
    downloadExcel(bookId, projectId, selectedBooks, selectedCollections, filename);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2 items-center">
        <button
          onClick={handleDownload}
          className="p-2 text-blue-600 rounded hover:bg-gray-300"
        >
          <FaDownload />
        </button>
      </div>
      <div className="flex-1 text-center">
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
            title={pdfName}
          >
            {pdfName && pdfName.length > 30 ? `${pdfName.substring(0, 30)}...` : pdfName}
          </a>
        ) : (
          <span className="text-gray-500">No PDF Available</span>
        )}
      </div>
    </div>
  );
};

export default HeaderSection;