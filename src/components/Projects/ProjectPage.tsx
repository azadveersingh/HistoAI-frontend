import { useState, useEffect } from 'react';
import ProjectSidebar from './ProjectSidebar';
import ProjectContent from './ProjectContent';

const ProjectPage: React.FC<{ onMainSidebarToggle: (isOpen: boolean) => void }> = ({ onMainSidebarToggle }) => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('Add Collections');

  useEffect(() => {
    // Close main sidebar when page loads
    onMainSidebarToggle(false);
  }, [onMainSidebarToggle]);

  const handleToggleMainSidebar = () => {
    const newState = !isMainSidebarOpen;
    setIsMainSidebarOpen(newState);
    onMainSidebarToggle(newState);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Local Sidebar */}
      <ProjectSidebar selectedOption={selectedOption} onSelectOption={setSelectedOption} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow">
          <button
            onClick={handleToggleMainSidebar}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="flex-1 mx-4">
            <input
              type="text"
              placeholder="Search project items..."
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ProjectContent selectedOption={selectedOption} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;