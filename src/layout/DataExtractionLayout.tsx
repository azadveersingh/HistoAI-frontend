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
      <div className="flex flex-1">
        <div className="relative z-20 h-full">
          <div
            className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
              isAppSidebarExpanded ? "w-55" : "w-16"
            } ${isAppSidebarMobileOpen ? "w-55" : "w-0"} md:w-55 h-full overflow-y-auto`}
          >
            <DataExtractionSidebar />
          </div>
          <Backdrop />
        </div>
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isAppSidebarExpanded ? "md:ml-0" : "md:ml-0"
          } ${isAppSidebarMobileOpen ? "ml-72" : "ml-0"} px-2 md:px-4 pt-2 md:pt-4`}
        >
          <div className="w-full max-w-[81rem]">
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