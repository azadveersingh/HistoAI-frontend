import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDatabase,
  FiMessageSquare,
  FiGitBranch,
  FiInfo,
} from "react-icons/fi";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import ProjectBooks from "../../components/Books/ProjectBooks";
import ProjectCollections from "../../components/Collections/ProjectCollections";

interface ToolsPageProps {
  projectId: string;
  searchQuery?: string;
}

type ToolType = "data-extraction" | "chatbot" | "knowledge-graph";

const TOOL_BUTTONS: Array<{
  tool: ToolType;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  hoverBgColor: string;
  ringColor: string;
  route: string;
}> = [
    {
      tool: "data-extraction",
      label: "Data Extraction",
      icon: <FiDatabase className="w-4 h-4" />,
      bgColor: "bg-blue-600",
      hoverBgColor: "hover:bg-blue-700",
      ringColor: "ring-blue-500",
      route: "tools/welcome",
    },
    {
      tool: "chatbot",
      label: "Chatbot",
      icon: <FiMessageSquare className="w-4 h-4" />,
      bgColor: "bg-green-600",
      hoverBgColor: "hover:bg-green-700",
      ringColor: "ring-green-500",
      route: "chatbot",
    },
    {
      tool: "knowledge-graph",
      label: "Knowledge Graph",
      icon: <FiGitBranch className="w-4 h-4" />,
      bgColor: "bg-purple-600",
      hoverBgColor: "hover:bg-purple-700",
      ringColor: "ring-purple-500",
      route: "tools/welcome",
    },
  ];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const errorVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function ToolsPage({
  projectId,
  searchQuery = "",
}: ToolsPageProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const toggleCollection = useCallback((id: string, checked: boolean) => {
    setSelectedCollections((prev) =>
      checked ? [...prev, id] : prev.filter((cid) => cid !== id)
    );
  }, []);

  const toggleBook = useCallback((id: string, checked: boolean) => {
    setSelectedBooks((prev) =>
      checked ? [...prev, id] : prev.filter((bid) => bid !== id)
    );
  }, []);

  const handleProceed = useCallback(
    (tool: ToolType, route: string) => {
      const baseUrl = `/project/${projectId}/${route}`;
      const queryParams = [
        selectedCollections.length
          ? `collections=${encodeURIComponent(selectedCollections.join(","))}`
          : "",
        selectedBooks.length
          ? `books=${encodeURIComponent(selectedBooks.join(","))}`
          : "",
      ]
        .filter(Boolean)
        .join("&");

      const url = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [projectId, selectedCollections, selectedBooks]
  );

  const isSelectionEmpty =
    selectedCollections.length === 0 && selectedBooks.length === 0;

  return (
    <div className="h-[79vh] w-full flex flex-col transition-colors duration-300 bg-gray-0 dark:bg-gray-0 overflow-hidden">
      <ComponentCard
        title="Select Project Resources to Use Tools"
        className="flex-1  overflow-hidden m-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"
      >

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="min-w-0">


            </div>

            {/* Tool Buttons */}
            <div className="flex flex-col gap-3 lg:min-w-[300px]">
              {!loading && !error && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap lg:flex-nowrap justify-end gap-2"
                >
                  {TOOL_BUTTONS.map(
                    ({
                      tool,
                      label,
                      icon,
                      bgColor,
                      hoverBgColor,
                      ringColor,
                      route,
                    }) => (
                      <Button
                        key={tool}
                        onClick={() => handleProceed(tool, route)}
                        disabled={isSelectionEmpty}
                        className={`
                          flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                          ${bgColor} ${hoverBgColor} text-white
                          disabled:bg-gray-300 disabled:text-gray-500
                          dark:disabled:bg-gray-700 dark:disabled:text-gray-400
                          transition-all duration-200 hover:shadow-md
                          focus:outline-none focus:ring-2 ${ringColor} focus:ring-offset-2
                          dark:focus:ring-offset-gray-900
                        `}
                        aria-label={`Use ${label}`}
                      >
                        {icon}
                        <span>{label}</span>
                      </Button>
                    )
                  )}
                </motion.div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 justify-end mt-2">
                <FiInfo className="w-4 h-4" />
                <span>
                  <span className="text-blue-600">{selectedBooks.length}</span> book
                  {selectedBooks.length !== 1 && "s"} and{" "}
                  <span className="text-blue-600">{selectedCollections.length}</span> collection
                  {selectedCollections.length !== 1 && "s"} selected
                </span>
              </div>

            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-start gap-3"
                role="alert"
              >
                <FiInfo className="w-5 h-5 mt-1" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resource Selection */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectCollections
                projectId={projectId}
                searchQuery={searchQuery}
                isToolsPage
                selectedCollections={selectedCollections}
                onCollectionSelectionChange={toggleCollection}
              />
              <ProjectBooks
                projectId={projectId}
                searchQuery={searchQuery}
                isToolsPage
                selectedBooks={selectedBooks}
                onBookSelectionChange={toggleBook}
              />
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}
