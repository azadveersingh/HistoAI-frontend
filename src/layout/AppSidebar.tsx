import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import ManageCollectionModal from "../components/ui/modal/ManageCollectionModal";
import Logo from "../icons/graphiti.png";
import {
  LayoutGrid,
  Users,
  FilePlus,
  BookOpen,
  FolderPlus,
  ChevronDown,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const role = localStorage.getItem("role");

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <LayoutGrid className="w-6 h-6" strokeWidth={1.5} />,
    name: "Projects",
    path: "/dashboard",
  },
  ...(role === "admin"
    ? [
        {
          icon: <Users className="w-6 h-6" strokeWidth={1.5} />,
          name: "All Users",
          path: "/admin/users",
        },
      ]
    : []),
  ...(role === "project_manager" || role === "book_manager"
    ? [
        {
          icon: <FilePlus className="w-6 h-6" strokeWidth={1.5} />,
          name: "Create Projects",
          path: "/dashboard/projects/create",
        },
      ]
    : []),
  ...(role === "book_manager"
    ? [
        {
          icon: <BookOpen className="w-6 h-6" strokeWidth={1.5} />,
          name: "Manage Books",
          path: "/books/manage",
        },
      ]
    : []),
  ...(role === "project_manager" || role === "book_manager"
    ? [
        {
          icon: <FolderPlus className="w-6 h-6" strokeWidth={1.5} />,
          name: "Manage Collections",
          path: "/dashboard/collections",
        },
      ]
    : []),
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar(); // Removed isHovered, setIsHovered
  const location = useLocation();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const navigate = useNavigate();

  const openManageModal = () => setIsManageModalOpen(true);
  const closeManageModal = () => setIsManageModalOpen(false);
  const handleNavigate = (path: string) => {
    closeManageModal();
    navigate(path);
  };

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              } ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`} // Removed isHovered
            >
              <span
                className={`w-6 h-6 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-blue-600"
                } transition-colors duration-200`}
              >
                {nav.icon}
              </span>
              {isExpanded && ( // Removed isHovered
                <span className="text-sm font-medium">{nav.name}</span>
              )}
              {isExpanded && ( // Removed isHovered
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-blue-600"
                      : "text-gray-500"
                  }`}
                />
              )}
            </button>
          ) : nav.path ? (
            <Link
              to={nav.path}
              className={`menu-item group flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                isActive(nav.path)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span
                className={`w-6 h-6 ${
                  isActive(nav.path)
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-blue-600"
                } transition-colors duration-200`}
              >
                {nav.icon}
              </span>
              {isExpanded && ( // Removed isHovered
                <span className="text-sm font-medium">{nav.name}</span>
              )}
            </Link>
          ) : null}

          {nav.subItems && isExpanded && ( // Removed isHovered
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center p-2 rounded-md text-sm transition-all duration-200 ${
                        isActive(subItem.path)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              isActive(subItem.path)
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              isActive(subItem.path)
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[220px]" : "w-[60px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div
          className={`py-4 flex ${
            !isExpanded ? "lg:justify-center" : "justify-center"
          }`}
        >
          <Link to="/">
            {isExpanded ? (
              <>
                <img
                  className="dark:hidden"
                  alt="Logo"
                  width="100"
                  height="40"
                  src={Logo}
                />
                <img
                  className="hidden dark:block"
                  src={Logo}
                  alt="Logo"
                  width={100}
                  height={40}
                />
              </>
            ) : (
              <img
                className="dark:block"
                src={Logo}
                alt="Logo"
                width={100}
                height={40}
              />
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>{renderMenuItems(navItems, "main")}</div>
              <div>{renderMenuItems(othersItems, "others")}</div>
            </div>
          </nav>
        </div>
      </aside>
      <ManageCollectionModal
        isOpen={isManageModalOpen}
        onClose={closeManageModal}
        onNavigate={handleNavigate}
      />
    </>
  );
};

export default AppSidebar;