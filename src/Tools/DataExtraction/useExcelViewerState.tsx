import { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../../api/api";
import { TableRow } from "./types";

export const useExcelViewerState = () => {
  const [dataRaw, setDataRaw] = useState<TableRow[][]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [bookId, setBookId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [pdfName, setPdfName] = useState<string>("");
  const [llm, setLlm] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>(localStorage.getItem("fileUrl") || "");
  const [structuredDataPath, setStructuredDataPath] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [matchRefs, setMatchRefs] = useState<React.RefObject<HTMLElement>[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null); // Added ref for table container
  const tempRefsRef = useRef<React.RefObject<HTMLElement>[]>([]);
  const collectingRefs = useRef<boolean>(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const filenameFromURL = location.state?.filename || localStorage.getItem("filename");

  useEffect(() => {
    // Parse query parameters
    const bookIdFromURL = searchParams.get("bookId") || location.state?.book_id || localStorage.getItem("bookId");
    const projectIdFromURL = searchParams.get("projectId") || location.state?.project_id;
    const selectedBooksFromURL = searchParams.get("books")?.split(",").filter(Boolean) || location.state?.selectedBooks || [];
    const selectedCollectionsFromURL = searchParams.get("collections")?.split(",").filter(Boolean) || location.state?.selectedCollections || [];
    const selected_llm = searchParams.get("selected_llm") || location.state?.selected_llm || localStorage.getItem("selected_llm") || "";
    const dp = location.state?.structured_data_path || localStorage.getItem("structured_data_path") || "";
    const fu = location.state?.fileUrl || localStorage.getItem("fileUrl") || "";

    console.log("Parsed params in useExcelViewerState:", {
      bookIdFromURL,
      projectIdFromURL,
      selectedBooksFromURL,
      selectedCollectionsFromURL,
      filenameFromURL,
      selected_llm,
      dp,
      fu,
    }); // Debug log

    if (bookIdFromURL) {
      setBookId(bookIdFromURL);
      localStorage.setItem("bookId", bookIdFromURL);
    }
    if (projectIdFromURL) {
      setProjectId(projectIdFromURL);
      localStorage.setItem("projectId", projectIdFromURL);
    }
    if (selectedBooksFromURL.length > 0) {
      setSelectedBooks(selectedBooksFromURL);
    }
    if (selectedCollectionsFromURL.length > 0) {
      setSelectedCollections(selectedCollectionsFromURL);
    }
    if (filenameFromURL) {
      setPdfName(filenameFromURL);
      localStorage.setItem("filename", filenameFromURL);
    }
    if (selected_llm) {
      setLlm(selected_llm);
      localStorage.setItem("selected_llm", selected_llm);
    }

    const formattedDp = dp && !dp.startsWith("http") ? `${api}/api/uploads/${dp}` : dp;
    const formattedFu = fu && !fu.startsWith("http") ? `${api}/api/uploads/${fu}` : fu;

    setPdfUrl(formattedFu);
    setStructuredDataPath(formattedDp);
    localStorage.setItem("structured_data_path", formattedDp);
    localStorage.setItem("fileUrl", formattedFu);
  }, [location, searchParams, filenameFromURL]);

  useEffect(() => {
    if (llm) {
      toast.info(
        <span style={{ color: "black" }}>
          Your structured data is extracted using{" "}
          <strong style={{ color: "#1518e6" }}>{llm}</strong> LLM Model
        </span>,
        { position: "top-right", autoClose: 3000 }
      );
    }
  }, [llm]);

  useEffect(() => {
    if (matchRefs.length > 0) {
      scrollToMatch(currentMatchIndex);
    }
  }, [currentMatchIndex, matchRefs]);

  const scrollToMatch = (index: number) => {
    const currentRef = matchRefs[index]?.current;
    if (currentRef && tableContainerRef.current) {
      // Scroll to the highlighted word
      currentRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Adjust table container scroll for better positioning
      const rect = currentRef.getBoundingClientRect();
      const tableRect = tableContainerRef.current.getBoundingClientRect();

      // Vertical scroll adjustment
      tableContainerRef.current.scrollTop += rect.top - tableRect.top - 100; // Adjust for header/toolbar

      // Horizontal scroll adjustment
      tableContainerRef.current.scrollLeft += rect.left - tableRect.left - 100; // Adjust for sidebar/columns
    }
  };

  const handleNext = () => {
    const nextIndex = (currentMatchIndex + 1) % matchRefs.length;
    setCurrentMatchIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentMatchIndex - 1 + matchRefs.length) % matchRefs.length;
    setCurrentMatchIndex(prevIndex);
  };

  return {
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
    setPdfName,
    pdfUrl,
    setPdfUrl,
    structuredDataPath,
    setStructuredDataPath,
    globalFilter,
    setGlobalFilter,
    matchRefs,
    setMatchRefs,
    currentMatchIndex,
    setCurrentMatchIndex,
    containerRef,
    tableContainerRef, // Added
    tempRefsRef,
    collectingRefs,
    handleNext,
    handlePrev,
    isSearchOpen,
    setIsSearchOpen,
    error,
    setError,
  };
};