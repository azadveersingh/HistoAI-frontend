import React from "react";
import AppHeader from "./AppHeader";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import Backdrop from "./Backdrop";
import DataExtractionSidebar from "../Tools/DataExtraction/DataExtractionSidebar";

const LayoutContent: React.FC = () => {
  const { isAppSidebarExpanded, isAppSidebarMobileOpen } = useSidebar();

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* AppHeader (Persistent) */}
      <AppHeader />

      {/* Custom Layout Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="relative z-20 h-full">
          <div
            className={`
              bg-white shadow-lg transition-all duration-300 ease-in-out
              fixed top-16 sm:top-20 md:top-16 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)]
              ${isAppSidebarMobileOpen ? "w-64" : "w-0"}
              md:${isAppSidebarExpanded ? "w-64" : "w-16"}
              lg:w-64
              overflow-y-auto
              transform
              ${isAppSidebarMobileOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
            `}
          >
            <DataExtractionSidebar />
          </div>
          <Backdrop />
        </div>

        {/* Main Content */}
       <div
  className={`
    flex-1 transition-all duration-300 ease-in-out
    ${isAppSidebarMobileOpen ? "ml-64" : "ml-0"}
    md:${isAppSidebarExpanded ? "ml-64" : "ml-16"}
    lg:ml-64
    px-2 sm:px-4 md:px-4 lg:px-2
    pt-2 sm:pt-2 md:pt-1 lg:pt-0
    overflow-y-auto
  `}
>
          <div className="w-full max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-4rem)] lg:max-w-[calc(100vw-1rem)] mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

const DataExtractionLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default DataExtractionLayout;