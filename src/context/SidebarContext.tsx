import { createContext, useContext, useState, useEffect } from "react";

type SidebarContextType = {
  isAppSidebarExpanded: boolean;
  isAppSidebarMobileOpen: boolean;
  isProjectSidebarExpanded: boolean;
  isProjectSidebarMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleAppSidebar: () => void;
  toggleAppSidebarMobile: () => void;
  toggleProjectSidebar: () => void;
  toggleProjectSidebarMobile: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAppSidebarExpanded, setIsAppSidebarExpanded] = useState(true);
  const [isAppSidebarMobileOpen, setIsAppSidebarMobileOpen] = useState(false);
  const [isProjectSidebarExpanded, setIsProjectSidebarExpanded] = useState(true);
  const [isProjectSidebarMobileOpen, setIsProjectSidebarMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsAppSidebarMobileOpen(false);
        setIsProjectSidebarMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleAppSidebar = () => {
    setIsAppSidebarExpanded((prev) => !prev);
  };

  const toggleAppSidebarMobile = () => {
    setIsAppSidebarMobileOpen((prev) => !prev);
  };

  const toggleProjectSidebar = () => {
    setIsProjectSidebarExpanded((prev) => !prev);
  };

  const toggleProjectSidebarMobile = () => {
    setIsProjectSidebarMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        isAppSidebarExpanded: isMobile ? false : isAppSidebarExpanded,
        isAppSidebarMobileOpen,
        isProjectSidebarExpanded: isMobile ? false : isProjectSidebarExpanded,
        isProjectSidebarMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleAppSidebar,
        toggleAppSidebarMobile,
        toggleProjectSidebar,
        toggleProjectSidebarMobile,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};