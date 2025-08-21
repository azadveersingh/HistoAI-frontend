// import { useState, useEffect } from 'react';
// import { useParams, useLocation, useOutletContext } from 'react-router-dom';
// import ProjectSidebar from './ProjectSidebar';
// import ProjectContent from './ProjectContent';
// import { useSidebar } from '../../context/SidebarContext';
// import SearchBar from '../form/input/SearchBar';
// import { fetchProjectById, updateProject } from '../../services/projectService';
// import PageBreadCrumb from "../common/PageBreadCrumb";
// import { Edit2 } from 'lucide-react';

// interface ContextType {
//   toggleSidebar?: () => void;
//   toggleMobileSidebar?: () => void;
// }

// const ProjectPage: React.FC = () => {
//   const { isExpanded, isMobileOpen, toggleSidebar: localToggleSidebar, toggleMobileSidebar: localToggleMobileSidebar } = useSidebar();
//   const { id: projectId } = useParams<{ id: string }>();
//   const { toggleSidebar, toggleMobileSidebar } = useOutletContext<ContextType>() || {};
//   const [selectedOption, setSelectedOption] = useState<string>('Use Tools');
//   const [searchQuery, setSearchQuery] = useState<string>(''); // Track input live
//   const [projectName, setProjectName] = useState<string>(''); // Store project name
//   const [isEditing, setIsEditing] = useState(false); // Track edit mode
//   const [newName, setNewName] = useState<string>(''); // Store edited name
//   const location = useLocation();

//   useEffect(() => {
//     const path = location.pathname;
//     if (path.includes('collections/add')) setSelectedOption('Add Collections');
//     else if (path.includes('books/add')) setSelectedOption('Add Books');
//     else if (path.includes('members/add')) setSelectedOption('Add Members');
//     else if (path.includes('chatbot')) setSelectedOption('Chatbot');
//     else if (path.includes('tools')) setSelectedOption('Use Tools');
//   }, [location.pathname]);

//   useEffect(() => {
//     const fetchProjectName = async () => {
//       if (projectId) {
//         try {
//           const projectData = await fetchProjectById(projectId);
//           setProjectName(projectData.name || 'Unnamed Project');
//           setNewName(projectData.name || 'Unnamed Project'); // Initialize newName
//         } catch (err) {
//           console.error('Error fetching project name:', err);
//           setProjectName('Unnamed Project');
//           setNewName('Unnamed Project');
//         }
//       }
//     };
//     fetchProjectName();
//   }, [projectId]);

//   const handleToggleMainSidebar = () => {
//     if (isExpanded && localToggleSidebar) {
//       localToggleSidebar();
//     }
//     if (isMobileOpen && localToggleMobileSidebar) {
//       localToggleMobileSidebar();
//     }
//   };

//   const handleEditClick = () => {
//     setIsEditing(true);
//   };

//   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewName(e.target.value);
//   };

//   const handleKeyDown = async (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && newName.trim() && projectId) {
//       try {
//         await updateProject(projectId, { name: newName.trim() });
//         setProjectName(newName.trim());
//         setIsEditing(false);
//       } catch (err) {
//         console.error('Error updating project name:', err);
//       }
//     } else if (e.key === 'Escape') {
//       setNewName(projectName);
//       setIsEditing(false);
//     }
//   };

//   return (
//     <div className="flex bg-gray-100 dark:bg-gray-900">
//       {projectId && (
//         <ProjectSidebar
//           selectedOption={selectedOption}
//           onSelectOption={setSelectedOption}
//           projectId={projectId}
//         />
//       )}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="flex flex-col p-2 bg-white dark:bg-gray-800 shadow">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             {/* <button
//               onClick={handleToggleMainSidebar}
//               className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded sm:self-start"
//               aria-label="Close sidebar"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
//               </svg>
//             </button> */}
//             <div className="flex items-center justify-center sm:flex-1">
//               {isEditing ? (
//                 <input
//                   type="text"
//                   value={newName}
//                   onChange={handleNameChange}
//                   onKeyDown={handleKeyDown}
//                   className="text-3xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 w-full text-center"
//                   autoFocus
//                 />
//               ) : (
//                 <>
//                   <h1 className="text-3xl sm:text-2xl font-bold text-blue-600 dark:text-gray-100 tracking-tight text-center">
//                     {projectName}
//                   </h1>
//                   <button
//                     onClick={handleEditClick}
//                     className="ml-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
//                     aria-label={`Edit project ${projectName}`}
//                   >
//                     <Edit2 className="w-5 h-5" />
//                   </button>
//                 </>
//               )}
//             </div>
//             <div className="sm:w-64">
//               <SearchBar
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onClear={() => setSearchQuery('')}
//                 placeholder="Search here"
//               />
//             </div>
//           </div>
//           {/* <PageBreadCrumb pageTitle="Project Page" /> */}
//         </div>
//         <div className="flex-1 overflow-y-auto">
//           {projectId && (
//             <ProjectContent
//               selectedOption={selectedOption}
//               projectId={projectId}
//               searchQuery={searchQuery}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectPage;



// ProjectPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useOutletContext, Outlet } from 'react-router-dom';
import ProjectSidebar from './ProjectSidebar';
import ProjectContent from './ProjectContent';
import { useSidebar } from '../../context/SidebarContext';
import SearchBar from '../form/input/SearchBar';
import { fetchProjectById, updateProject } from '../../services/projectService';
import PageBreadCrumb from '../common/PageBreadCrumb';
import { Edit2 } from 'lucide-react';

interface ContextType {
  toggleSidebar?: () => void;
  toggleMobileSidebar?: () => void;
}

const ProjectPage: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar: localToggleSidebar, toggleMobileSidebar: localToggleMobileSidebar } = useSidebar();
  const { id: projectId } = useParams<{ id: string }>();
  const { toggleSidebar, toggleMobileSidebar } = useOutletContext<ContextType>() || {};
  const [selectedOption, setSelectedOption] = useState<string>('Use Tools');
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track input live
  const [projectName, setProjectName] = useState<string>(''); // Store project name
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [newName, setNewName] = useState<string>(''); // Store edited name
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    console.log('ProjectPage: Current path:', path);
    // Handle base route /project/:id
    if (path === `/project/${projectId}`) {
      setSelectedOption('Use Tools');
    } else if (path.includes('collections/add')) {
      setSelectedOption('Add Collections');
    } else if (path.includes('books/add')) {
      setSelectedOption('Add Books');
    } else if (path.includes('members/add')) {
      setSelectedOption('Add Members');
    } else if (path.includes('chatbot')) {
      setSelectedOption('Chatbot');
    } else if (path.includes('tools')) {
      setSelectedOption('Use Tools');
    } else {
      setSelectedOption(''); // For routes like data-extraction
    }
  }, [location.pathname, projectId]);

  useEffect(() => {
    const fetchProjectName = async () => {
      if (projectId) {
        try {
          const projectData = await fetchProjectById(projectId);
          setProjectName(projectData.name || 'Unnamed Project');
          setNewName(projectData.name || 'Unnamed Project'); // Initialize newName
        } catch (err) {
          console.error('Error fetching project name:', err);
          setProjectName('Unnamed Project');
          setNewName('Unnamed Project');
        }
      }
    };
    fetchProjectName();
  }, [projectId]);

  const handleToggleMainSidebar = () => {
    if (isExpanded && localToggleSidebar) {
      localToggleSidebar();
    }
    if (isMobileOpen && localToggleMobileSidebar) {
      localToggleMobileSidebar();
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newName.trim() && projectId) {
      try {
        await updateProject(projectId, { name: newName.trim() });
        setProjectName(newName.trim());
        setIsEditing(false);
      } catch (err) {
        console.error('Error updating project name:', err);
      }
    } else if (e.key === 'Escape') {
      setNewName(projectName);
      setIsEditing(false);
    }
  };

  // Render ProjectContent for routes handled by selectedOption, Outlet for others
  const shouldRenderProjectContent = location.pathname.includes('tools') ||
                                    location.pathname.includes('collections/add') ||
                                    location.pathname.includes('books/add') ||
                                    location.pathname.includes('members/add') ||
                                    location.pathname.includes('chatbot') ||
                                    location.pathname === `/project/${projectId}`;

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900">
      {projectId && (
        <ProjectSidebar
          selectedOption={selectedOption}
          onSelectOption={setSelectedOption}
          projectId={projectId}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col p-2 bg-white dark:bg-gray-800 shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-center sm:flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={newName}
                  onChange={handleNameChange}
                  onKeyDown={handleKeyDown}
                  className="text-3xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 w-full text-center"
                  autoFocus
                />
              ) : (
                <>
                  <h1 className="text-3xl sm:text-2xl font-bold text-blue-600 dark:text-gray-100 tracking-tight text-center">
                    {projectName}
                  </h1>
                  <button
                    onClick={handleEditClick}
                    className="ml-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                    aria-label={`Edit project ${projectName}`}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <div className="sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search here"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {projectId && shouldRenderProjectContent ? (
            <ProjectContent
              selectedOption={selectedOption}
              projectId={projectId}
              searchQuery={searchQuery}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;