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
    if (matchRefs.length > 0 && matchRefs[currentMatchIndex]?.current) {
      matchRefs.forEach((ref, idx) => {
        if (ref.current) {
          ref.current.classList.remove("bg-blue-500", "text-white", "font-bold");
          ref.current.classList.add("bg-yellow-300", "text-black");
        }
      });

      const currentRef = matchRefs[currentMatchIndex];
      if (currentRef?.current) {
        currentRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        currentRef.current.classList.remove("bg-yellow-300", "text-black");
        currentRef.current.classList.add("bg-blue-500", "text-white", "font-bold");
      }
    }
  }, [currentMatchIndex, matchRefs]);

  if (!globalFilter || matchRefs.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrev}
        className="p-1.5 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 transition-colors duration-200"
        title="Previous match"
      >
        <FaChevronUp size={12} />
      </button>
      <button
        onClick={handleNext}
        className="p-1.5 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 transition-colors duration-200"
        title="Next match"
      >
        <FaChevronDown size={12} />
      </button>
      <span className="text-xs text-gray-700 font-medium">
        {`${currentMatchIndex + 1} of ${matchRefs.length}`}
      </span>
    </div>
  );
};

export default NavigationButtons;