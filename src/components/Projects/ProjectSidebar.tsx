import { FC, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import {
  FolderPlus,
  FilePlus,
  UserPlus,
  MessageSquare,
  ToolCase,
  Menu,
  X,
} from "lucide-react";

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

const ProjectSidebar: FC<ProjectSidebarProps> = ({
  selectedOption,
  onSelectOption,
  projectId,
}) => {
  const { isProjectSidebarExpanded, isProjectSidebarMobileOpen, toggleProjectSidebar, toggleProjectSidebarMobile } = useSidebar();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <ToolCase className="w-5 h-5" strokeWidth={1.5} />,
      name: "Use Tools",
      path: `/project/${projectId}/tools/welcome`,
    },
    {
      icon: <FolderPlus className="w-5 h-5" strokeWidth={1.5} />,
      name: "Add Collections",
      path: `/project/${projectId}/collections/add`,
    },
    {
      icon: <FilePlus className="w-5 h-5" strokeWidth={1.5} />,
      name: "Add Books to Project",
      path: `/project/${projectId}/books/add`,
    },
    {
      icon: <UserPlus className="w-5 h-5" strokeWidth={1.5} />,
      name: "Add Members",
      path: `/project/${projectId}/members/add`,
    },
    {
      icon: <MessageSquare className="w-5 h-5" strokeWidth={1.5} />,
      name: "Chatbot",
      path: `/${projectId}/chatbot`,
      openInNewTab: true,
    },
  ];

  const isActive = useCallback(
    (path: string) => {
      return (
        location.pathname === path ||
        (path === `/project/${projectId}/tools/welcome` &&
          location.pathname === `/project/${projectId}`)
      );
    },
    [location.pathname, projectId]
  );

  const handleNavClick = (nav: NavItem) => {
    if (!nav.openInNewTab) {
      onSelectOption(nav.name);
      if (isProjectSidebarMobileOpen) {
        toggleProjectSidebarMobile();
      }
    }
    if (nav.openInNewTab) {
      window.open(nav.path, "_blank", "noopener,noreferrer");
    }
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav) => (
        <li key={nav.name}>
          {nav.openInNewTab ? (
            <button
              onClick={() => handleNavClick(nav)}
              className={`menu-item group flex items-center gap-2 p-2 rounded-md transition-all duration-200 ${
                isActive(nav.path)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              } ${!isProjectSidebarExpanded && !isProjectSidebarMobileOpen ? "justify-center" : "justify-start"}`}
            >
              <span
                className={`w-5 h-5 ${
                  isActive(nav.path)
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-blue-600"
                } transition-colors duration-200`}
              >
                {nav.icon}
              </span>
              {(isProjectSidebarExpanded || isProjectSidebarMobileOpen) && (
                <span className="text-xs font-medium">{nav.name}</span>
              )}
            </button>
          ) : (
            <Link
              to={nav.path}
              onClick={() => handleNavClick(nav)}
              className={`menu-item group flex items-center gap-2 p-2 rounded-md transition-all duration-200 ${
                isActive(nav.path)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              } ${!isProjectSidebarExpanded && !isProjectSidebarMobileOpen ? "justify-center" : "justify-start"}`}
            >
              <span
                className={`w-5 h-5 ${
                  isActive(nav.path)
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-blue-600"
                } transition-colors duration-200`}
              >
                {nav.icon}
              </span>
              {(isProjectSidebarExpanded || isProjectSidebarMobileOpen) && (
                <span className="text-xs font-medium">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={toggleProjectSidebarMobile}
      >
        {isProjectSidebarMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      <aside
        className={`bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out border-r border-gray-200 fixed md:static z-40
        ${
          isProjectSidebarMobileOpen
            ? "block w-[240px] h-screen"
            : "hidden md:block " +
              (isProjectSidebarExpanded ? "w-[240px]" : "w-[60px]")
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto duration-300 ease-linear no-scrollbar p-3">
          <button
            className="mb-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleProjectSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <nav className="flex-1">
            <div className="flex flex-col gap-2">{renderMenuItems()}</div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default ProjectSidebar;