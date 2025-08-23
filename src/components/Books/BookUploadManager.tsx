import { FC, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AllBooks from "../Books/AllBooks";
import ProcessingBooks from "../Books/ProcessingBooks";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../common/PageBreadCrumb";
import { useSocket } from "../../context/SocketProvider";

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
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">(
    (location.state?.tab as "tab1" | "tab2") || "tab1"
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { subscribeToBookProgress, unsubscribeFromBookProgress } = useSocket();

  useEffect(() => {
    // Subscribe to book_progress events
    const handleProgressUpdate = (data: any) => {
      if (data.status === "data_extraction_done" && activeTab === "tab2") {
        setRefreshTrigger((prev) => prev + 1); // Refresh processing tab
        setActiveTab("tab1"); // Switch to central repository tab
        navigate(location.pathname, { state: { tab: "tab1", refresh: true } });
      } else if (activeTab === "tab2") {
        setRefreshTrigger((prev) => prev + 1); // Refresh on other updates
      }
    };
    subscribeToBookProgress(handleProgressUpdate);

    // Handle location state changes
    if (location.state?.tab && location.state.tab !== activeTab) {
      setActiveTab(location.state.tab as "tab1" | "tab2");
      if (location.state.tab === "tab2" || location.state?.refresh) {
        setRefreshTrigger((prev) => prev + 1);
      }
    }

    // Cleanup WebSocket subscription
    return () => {
      unsubscribeFromBookProgress(handleProgressUpdate);
    };
  }, [location.state, activeTab, subscribeToBookProgress, unsubscribeFromBookProgress]);

  const handleTabChange = (tab: "tab1" | "tab2") => {
    setActiveTab(tab);
    if (tab === "tab2") {
      setRefreshTrigger((prev) => prev + 1); // Refresh when switching to tab2
    }
    navigate(location.pathname, { state: { tab } });
  };

  const tabConfig: TabConfig = {
    tab1: "Central Repository",
    tab2: "Book Upload and Processing",
    component1: <AllBooks searchQuery={searchQuery} isCentralRepository={true} />,
    component2: <ProcessingBooks refreshTrigger={refreshTrigger} />,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* <PageBreadcrumb pageTitle="Book Management" /> */}
      <div className="mx-auto px-4">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 mb-2 "
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