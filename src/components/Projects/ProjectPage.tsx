import { useState, useEffect } from 'react';
import { useParams, useLocation, useOutletContext } from 'react-router-dom';
import ProjectSidebar from './ProjectSidebar';
import ProjectContent from './ProjectContent';
import { useSidebar } from '../../context/SidebarContext';
import SearchBar from '../form/input/SearchBar';

interface ContextType {
  toggleSidebar?: () => void;
  toggleMobileSidebar?: () => void;
}

const ProjectPage: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar: localToggleSidebar, toggleMobileSidebar: localToggleMobileSidebar } = useSidebar();
  const { id: projectId } = useParams<{ id: string }>();
  const { toggleSidebar, toggleMobileSidebar } = useOutletContext<ContextType>() || {};
  const [selectedOption, setSelectedOption] = useState<string>('Add Collections');
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track input live
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('collections/add')) setSelectedOption('Add Collections');
    else if (path.includes('books/add')) setSelectedOption('Add Books');
    else if (path.includes('members/add')) setSelectedOption('Add Members');
    else if (path.includes('chatbot')) setSelectedOption('Chatbot');
    else if (path.includes('tools')) setSelectedOption('Use Tools');
  }, [location.pathname]);

  useEffect(() => {
    if (toggleSidebar) toggleSidebar();
    if (toggleMobileSidebar) toggleMobileSidebar();
  }, [toggleSidebar, toggleMobileSidebar, location.pathname]);

  const handleToggleMainSidebar = () => {
    if (localToggleSidebar) localToggleSidebar();
    if (toggleSidebar) toggleSidebar();
    if (isMobileOpen && localToggleMobileSidebar) {
      localToggleMobileSidebar();
      if (toggleMobileSidebar) toggleMobileSidebar();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {projectId && (
        <ProjectSidebar
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          projectId={projectId}
        />
      )}
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

          {/* Real-time search input */}
          <div className="flex-1 mx-4">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search project items... (Ctrl+K)"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {projectId && (
            <ProjectContent
              selectedOption={selectedOption}
              projectId={projectId}
              searchQuery={searchQuery} // Pass live query
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
