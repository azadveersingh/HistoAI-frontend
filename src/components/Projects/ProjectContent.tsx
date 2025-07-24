import { FC, useState } from "react";
import AllCollections from "../Collections/AllCollections";
import ProjectCollections from "../Collections/ProjectCollections";
import AllBooks from "../Books/AllBooks";
import ProjectBooks from "../Books/ProjectBooks";
import AllMembers from "../Members/AllMembers";
import ProjectMembers from "../Members/ProjectMembers";
import ChatbotPage from "../Tools/Chatbot";
import ToolsPage from "../Tools/ToolsPage";


interface ProjectContentProps {
  selectedOption: string;
  projectId: string;
  searchQuery: string;
}

interface TabConfig {
  tab1: string;
  tab2: string;
  component1: JSX.Element;
  component2: JSX.Element;
}

const ProjectContent: FC<ProjectContentProps> = ({ selectedOption, projectId, searchQuery}) => {
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");

  const tabConfig: Record<string, TabConfig> = {
    "Add Collections": {
      tab1: "Project Collections",
      tab2: "All Collections",
      component1: <ProjectCollections projectId={projectId} searchQuery={searchQuery}/>,
      component2: <AllCollections searchQuery={searchQuery} />,
    },
    "Add Books": {
      tab1: "Project Books",
      tab2: "All Books",
      component1: <ProjectBooks projectId={projectId} searchQuery={searchQuery}/>,
      component2: <AllBooks searchQuery={searchQuery}/>,
    },
    "Add Members": {
      tab1: "Project Members",
      tab2: "All Members",
      component1: <ProjectMembers projectId={projectId} searchQuery={searchQuery}/>,
      component2: <AllMembers searchQuery={searchQuery}/>,
    },
    "Chatbot": {
      tab1: "",
      tab2: "",
      component1: <ChatbotPage projectId={projectId} />,
      component2: <></>,
    },
    "Use Tools": {
      tab1: "",
      tab2: "",
      component1: <ToolsPage projectId={projectId} />,
      component2: <></>,
    },
  };

  const currentConfig = tabConfig[selectedOption] || {
    tab1: "Select an option",
    tab2: "",
    component1: <div className="text-gray-600">Select an option to see content.</div>,
    component2: <div className="text-gray-600">Select an option to see content.</div>,
  };

  const shouldShowTabs = selectedOption !== "Chatbot" && selectedOption !== "Use Tools";

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      {shouldShowTabs && (
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
              {currentConfig.tab1}
            </button>
            {currentConfig.tab2 && (
              <button
                onClick={() => setActiveTab("tab2")}
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === "tab2"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
                }`}
              >
                {currentConfig.tab2}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="min-h-[calc(100vh-220px)]">
        {shouldShowTabs
          ? activeTab === "tab1"
            ? currentConfig.component1
            : currentConfig.component2
          : currentConfig.component1}
      </div>
    </div>
  );
};

export default ProjectContent;