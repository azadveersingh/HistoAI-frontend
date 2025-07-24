import { FC, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import {
  BoxCubeIcon,
  UserCircleIcon,
  ChatIcon,
  FolderIcon,
  FileIcon,
} from '../../icons';

interface ProjectSidebarProps {
  selectedOption: string;
  onSelectOption: (option: string) => void;
  projectId: string;
}

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  openInNewTab?: boolean;
};

const ProjectSidebar: FC<ProjectSidebarProps> = ({ selectedOption, onSelectOption, projectId }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <FolderIcon />,
      name: 'Add Collections',
      path: `/project/${projectId}/collections/add`,
    },
    {
      icon: <FileIcon />,
      name: 'Add Books to Project',
      path: `/project/${projectId}/books/add`,
    },
    {
      icon: <UserCircleIcon />,
      name: 'Add Members',
      path: `/project/${projectId}/members/add`,
    },
    {
      icon: <ChatIcon />,
      name: 'Chatbot',
      path: `/${projectId}/chatbot`,
      openInNewTab: true,
    },
    {
      icon: <BoxCubeIcon />,
      name: 'Use Tools',
      path: `/project/${projectId}/tools/welcome`,
    },
  ];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleNavClick = (nav: NavItem) => {
    // Only update selectedOption for non-new-tab items
    if (!nav.openInNewTab) {
      onSelectOption(nav.name);
    }
    if (nav.openInNewTab) {
      window.open(nav.path, '_blank', 'noopener,noreferrer');
    }
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav) => (
        <li key={nav.name}>
          {nav.openInNewTab ? (
            <button
              onClick={() => handleNavClick(nav)}
              className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'} ${
                !isExpanded && !isHovered ? 'justify-center' : 'justify-start'
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          ) : (
            <Link
              to={nav.path}
              onClick={() => onSelectOption(nav.name)}
              className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'} ${
                !isExpanded && !isHovered ? 'justify-center' : 'justify-start'
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out border-r border-gray-200 
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'block' : 'hidden'} md:block`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar p-5">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>{renderMenuItems()}</div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default ProjectSidebar;