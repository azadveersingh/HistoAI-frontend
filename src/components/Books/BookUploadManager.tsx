import { FC, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AllBooks from "../Books/AllBooks";
import ProcessingBooks from "../Books/ProcessingBooks";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../common/PageBreadCrumb";

interface BookUploadManagerProps {
  searchQuery?: string;
}

interface TabConfig {
  tab1: string;
  tab2: string;
  component1: JSX.Element;
  component2: JSX.Element;
}

const BookUploadManager: FC<BookUploadManagerProps> = ({ searchQuery = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Initialize activeTab from location.state.tab, default to "tab1"
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">(
    (location.state?.tab as "tab1" | "tab2") || "tab1"
  );

  // Update activeTab if location.state.tab changes
  useEffect(() => {
    if (location.state?.tab && location.state.tab !== activeTab) {
      setActiveTab(location.state.tab as "tab1" | "tab2");
    }
  }, [location.state]);

  const tabConfig: TabConfig = {
    tab1: "Central Repository",
    tab2: "Book Upload and Processing",
    component1: <AllBooks searchQuery={searchQuery} isCentralRepository={true} />,
    component2: <ProcessingBooks />,
  };

  const handleTabChange = (tab: "tab1" | "tab2") => {
    setActiveTab(tab);
    // Update URL state to persist tab selection
    navigate(location.pathname, { state: { tab } });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <PageBreadcrumb pageTitle="Book Management" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 mb-6"
          role="tablist"
          aria-label="Book Management Tabs"
        >
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            <button
              role="tab"
              aria-selected={activeTab === "tab1"}
              aria-controls="tab1-panel"
              onClick={() => handleTabChange("tab1")}
              className={`px-4 py-2 text-sm sm:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                activeTab === "tab1"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-b-2 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              {tabConfig.tab1}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "tab2"}
              aria-controls="tab2-panel"
              onClick={() => handleTabChange("tab2")}
              className={`px-4 py-2 text-sm sm:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
                activeTab === "tab2"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-b-2 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              {tabConfig.tab2}
            </button>
          </div>
        </div>
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-220px)]"
          role="tabpanel"
          id={activeTab === "tab1" ? "tab1-panel" : "tab2-panel"}
          aria-labelledby={activeTab === "tab1" ? "tab1" : "tab2"}
        >
          {activeTab === "tab1" ? (
            tabConfig.component1
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-end mb-4">
                <Button
                  variant="primary"

                  onClick={() => navigate("/books/upload", { state: { fromTab: "tab2" } })}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"

                >
                  Upload Book
                </Button>
              </div>
              {tabConfig.component2}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookUploadManager;
