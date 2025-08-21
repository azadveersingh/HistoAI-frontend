import React, { useEffect } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

interface NavigationButtonsProps {
  globalFilter: string;
  matchRefs: React.RefObject<HTMLElement>[];
  currentMatchIndex: number;
  handlePrev: () => void;
  handleNext: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  globalFilter,
  matchRefs,
  currentMatchIndex,
  handlePrev,
  handleNext,
}) => {
  // Scroll to and highlight current match
  useEffect(() => {
    if (matchRefs.length > 0 && matchRefs[currentMatchIndex]) {
      matchRefs.forEach((ref, idx) => {
        if (ref.current) {
          ref.current.classList.remove("bg-yellow-300", "bg-blue-500");
        }
      });

      const currentRef = matchRefs[currentMatchIndex];
      if (currentRef?.current) {
        currentRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        currentRef.current.classList.add("bg-blue-500", "text-white", "font-bold");
      }
    }
  }, [currentMatchIndex, matchRefs]);

  if (!globalFilter || matchRefs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 ml-20">
      <button
        onClick={handlePrev}
        className="p-2 bg-blue-700 rounded hover:bg-blue-500"
        title="Previous match"
      >
        <FaChevronUp size={14} />
      </button>
      <button
        onClick={handleNext}
        className="p-2 bg-blue-700 rounded hover:bg-blue-500"
        title="Next match"
      >
        <FaChevronDown size={14} />
      </button>
      <span className="text-sm text-blue-700">
        {`${currentMatchIndex + 1} of ${matchRefs.length}`}
      </span>
    </div>
  );
};

export default NavigationButtons;