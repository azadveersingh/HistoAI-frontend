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

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <PageBreadcrumb pageTitle="Book Management" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("tab1")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "tab1"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              {tabConfig.tab1}
            </button>
            <button
              onClick={() => setActiveTab("tab2")}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === "tab2"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              {tabConfig.tab2}
            </button>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md min-h-[calc(100vh-220px)]">
          {activeTab === "tab1" ? (
            tabConfig.component1
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-end mb-4">
                <Button
                  variant="primary"
                  onClick={() => navigate("/books/upload", { state: { setActiveTab } })}
                  className="px-6 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md"
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