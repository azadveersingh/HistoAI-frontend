import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { useSocket } from "../../context/SocketProvider";
import { useExcelViewerState } from "./useExcelViewerState";
import { useExcelData } from "./useExcelData";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import NavigationButtons from "./NavigationButtons";
import { FaDownload, FaSearch } from "react-icons/fa";
import { downloadExcel } from "./downloadExcel";
import { TableRow } from "./types";

const ExcelViewer: React.FC = () => {
  const { id: projectIdFromParams } = useParams<{ id: string }>();
  const {
    dataRaw,
    setDataRaw,
    columns,
    setColumns,
    rows,
    setRows,
    bookId,
    setBookId,
    projectId,
    setProjectId,
    selectedBooks,
    setSelectedBooks,
    selectedCollections,
    setSelectedCollections,
    pdfName,
    pdfUrl,
    globalFilter,
    setGlobalFilter,
    matchRefs,
    setMatchRefs,
    currentMatchIndex,
    containerRef,
    tempRefsRef,
    collectingRefs,
    handleNext,
    handlePrev,
    isSearchOpen,
    setIsSearchOpen,
    error,
    setError,
  } = useExcelViewerState();

  const { socket, subscribeToBookProgress, unsubscribeFromBookProgress } = useSocket();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);

  // Memoize selectedBooks and selectedCollections
  const books = useMemo(() => searchParams.get("books")?.split(",").filter(Boolean) || [], [searchParams]);
  const collections = useMemo(() => searchParams.get("collections")?.split(",").filter(Boolean) || [], [searchParams]);

  useEffect(() => {
    if (projectIdFromParams && projectId !== projectIdFromParams) {
      setProjectId(projectIdFromParams);
    }
    console.log("ExcelViewer parsed params:", { projectIdFromParams, books, collections });
    setSelectedBooks(books);
    setSelectedCollections(collections);
    if (books.length > 0 || collections.length > 0) {
      setBookId(null); // Reset bookId for multiple mode
    }
    setLoading(false);
  }, [books, collections, projectIdFromParams, setProjectId, projectId, setSelectedBooks, setSelectedCollections, setBookId]);

  useEffect(() => {
    if (socket && (bookId || selectedBooks.length > 0)) {
      const handleBookProgress = (data: any) => {
        if (
          data.status === "completed" &&
          (data.bookId === bookId || selectedBooks.includes(data.bookId))
        ) {
          setRows([]);
          setColumns([]);
        }
      };

      subscribeToBookProgress(handleBookProgress);
      return () => {
        unsubscribeFromBookProgress(handleBookProgress);
      };
    }
  }, [socket, bookId, selectedBooks, subscribeToBookProgress, unsubscribeFromBookProgress, setRows, setColumns]);

  useExcelData({
    bookId,
    projectId: projectIdFromParams || projectId,
    selectedBooks,
    selectedCollections,
    globalFilter,
    setDataRaw,
    setRows,
    setColumns,
    setMatchRefs,
    tempRefsRef,
    collectingRefs,
    setError,
  });

  const handleSearchBlur = () => {
    if (!globalFilter) setIsSearchOpen(false);
  };

const handleDownload = () => {
  if (selectedBooks.length > 0 || selectedCollections.length > 0) {
    // Multiple books/collections → download for whole project
    downloadExcel(
      undefined, // no single bookId
      projectIdFromParams || projectId, // projectId
      selectedBooks, // selectedBooks
      selectedCollections, // selectedCollections
      "combined_data.xlsx"
    );
  } else if (bookId) {
    // Single book → download book excel
    downloadExcel(
      bookId,
      undefined,
      [],
      [],
      `${pdfName}.xlsx`
    );
  }
};


  return (
    <div
      className="p-4 bg-gray-50 rounded-xl shadow-lg overflow-x-auto transition-all duration-300"
      ref={containerRef}
    >
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600 text-lg">Loading...</p>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
          Error: {error}
        </p>
      )}
      {!loading && !error && (
        <MaterialReactTable
          columns={columns}
          data={rows}
          enableColumnResizing
          enableSorting
          enableGlobalFilter={false}
          enableColumnFilters
          enableRowNumbers={true}
          enableFullScreenToggle
          enablePagination={false}
          columnResizeMode="onChange"
          initialState={{
            density: "compact",
            columnSizing: columns.reduce((acc, col) => {
              acc[col.accessorKey] = col.size ?? 180;
              return acc;
            }, {}),
          }}
          muiTablePaperProps={({ table }) => ({
            sx: {
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.4s ease-in-out",
              ...(table.getState().isFullScreen 
              ? {
                position: "fixed",
                inset: 0,
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                borderRadius: 0,
                zIndex: 999999,
                backgroundColor: "#fff",
                transform: "scale(1)",
              }
            : {
              transform: "scale(0.98)", // slightly smaller before fullscreen
        }),
            },  
          })}
      muiTableContainerProps={{
        sx: {
          tableLayout: "auto",
          overflowX: "scroll",
          overflowY: "auto",
          maxHeight: "70vh",
          backgroundColor: "#ffffff",
          paddingBottom: "0 !important", // 🔑 removes bottom padding
          marginBottom: "0 !important",  // 🔑 removes bottom margin
        },
      }}
     muiTableHeadCellProps={{
  sx: {
    background: "linear-gradient(to bottom, #f9fafb, #f3f4f6)", // subtle gradient
    fontWeight: 700,
    fontSize: "0.95rem",
    letterSpacing: "0.5px",
    textTransform: "camelcase",
    color: "#374151",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    padding: "14px 10px",
    textAlign: "center",
    position: "sticky",
    top: 0, // keep header sticky on scroll
    zIndex: 5,
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)", // subtle divider shadow
    "&:last-child": {
      borderRight: "none", // no border at the far right
    },
    "&:hover": {
      background: "#eef2ff", // light indigo hover
      cursor: "pointer", // makes headers feel interactive
    },
  },
}}

      muiTableBodyCellProps={({ row }) => ({
        sx: {
          backgroundColor: "#ffffff",
          whiteSpace: "normal",
          wordWrap: "break-word",
          border: "1px solid #e5e7eb",
          fontSize: "0.9rem",
          textAlign: "left",
          padding: "8px",
          color: "#374151",
          ...(row.original._bookName && {
            backgroundColor: "#ffffff",
            fontWeight: "550",
            fontStyle: "times new roman",
          }),
        },
      }
      )}
          // 1) Disable MUI's hover class entirely and nuke any remaining hover bg
      muiTableBodyRowProps={{
        hover: false, // <— important!
        sx: {
          backgroundColor: "#ffffff",
          "&:hover": { backgroundColor: "transparent !important" },
          "&.MuiTableRow-hover:hover": { backgroundColor: "transparent !important" },
          "&:hover td": { backgroundColor: "transparent !important" },
        },
      }}

      muiTableProps={{
        sx: {
          "& tbody": {
            marginBottom: 0,
            paddingBottom: 0,
          },
          "& tr:last-child td": {
            borderBottom: "none", // remove bottom border line too
          },
        },
      }}
      muiBottomToolbarProps={{
        sx: { display: "none" }, // 🔑 completely removes extra toolbar space
      }}
      muiPaginationProps={{
        sx: { display: "none" }, // 🔑 in case MRT injects pagination spacing
      }}






      renderTopToolbarCustomActions={() => (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 bg-white rounded-t-lg border-b border-gray-200">
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200"
              title="Download Excel"
            >
              <FaDownload className="text-sm" />
              <span>Download Excel</span>
            </button>

          </div>
          <NavigationButtons
            globalFilter={globalFilter}
            matchRefs={matchRefs}
            currentMatchIndex={currentMatchIndex}
            handlePrev={handlePrev}
            handleNext={handleNext}
          />
          <div
            className="flex items-center gap-2 relative group"
            onMouseEnter={() => setIsSearchOpen(true)}
            onMouseLeave={() => {
              if (!globalFilter) setIsSearchOpen(false);
            }}
          >
            <button
              onClick={() => {
                if (isSearchOpen) {
                  setIsSearchOpen(false);
                  setGlobalFilter("");
                } else {
                  setIsSearchOpen(true);
                  setTimeout(() => {
                    const input = document.getElementById("search-input");
                    input?.focus();
                  }, 100);
                }
              }}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1"
              title="Search"
            >
              <FaSearch className="text-lg" />
            </button>
            <input
              id="search-input"
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              onBlur={handleSearchBlur}
              className={`transition-all duration-300 ease-in-out border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-sm
                    ${isSearchOpen || globalFilter
                  ? "w-48 opacity-100 ml-2"
                  : "w-0 opacity-0 ml-0 pointer-events-none"
                }`}
            />
          </div>
        </div>
      )}
        />
      )}
    </div>
  );
};

export default ExcelViewer;