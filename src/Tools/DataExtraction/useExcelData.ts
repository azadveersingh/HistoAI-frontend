import { useEffect, useCallback } from "react";
import { fetchBookStructuredData, fetchProjectStructuredData } from "../../services/structuredDataServices";
import { fetchAllBooks } from "../../services/bookServices";
import { generateColumns } from "./generateColumns";
import { Event, StructuredDataEntry, TableRow } from "./types";
import debounce from "lodash/debounce";
import { api } from "../../api/api";

interface UseExcelDataProps {
  bookId?: string;
  projectId?: string;
  selectedBooks?: string[];
  selectedCollections?: string[];
  globalFilter: string;
  setDataRaw: React.Dispatch<React.SetStateAction<TableRow[][]>>;
  setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
  setColumns: React.Dispatch<React.SetStateAction<any[]>>;
  setMatchRefs: React.Dispatch<React.SetStateAction<React.RefObject<HTMLElement>[]>>;
  tempRefsRef: React.MutableRefObject<React.RefObject<HTMLElement>[]>;
  collectingRefs: React.MutableRefObject<boolean>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}
const normalizeUrl = (url?: string | null): string => {
  if (!url || url === "N/A") return "N/A";
  if (url.startsWith("http")) return url;
  const apiBase = api;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  return `${apiBase}/Uploads/book/${cleanPath}`;
};

const normalizeChunk = (chunk: StructuredDataEntry) => {
  const rawUrl = chunk.SourceURL || chunk["Source URL"] || null;
  return {
    ...chunk,
    SourceURL: normalizeUrl(rawUrl),
  };
};

export const useExcelData = ({
  bookId,
  projectId,
  selectedBooks = [],
  selectedCollections = [],
  globalFilter,
  setDataRaw,
  setRows,
  setColumns,
  setMatchRefs,
  tempRefsRef,
  collectingRefs,
  setError,
}: UseExcelDataProps) => {
  const fetchData = useCallback(
    debounce(async () => {
      try {
        setError(null);
        let combinedData: TableRow[] = [];
        let allKeys = new Set<string>();
        let serial = 1;

        // Map bookId -> bookName
        let bookMap: Map<string, string> = new Map();
        if (projectId && (selectedBooks.length > 0 || selectedCollections.length > 0)) {
          try {
            const booksData = await fetchAllBooks("all");
            bookMap = new Map(
              booksData.map((book: { _id: string; bookName: string }) => [
                book._id,
                book.bookName || `Book ${book._id}`,
              ])
            );
          } catch (e: any) {
            console.error("Error fetching book metadata:", e.message);
          }
        }

        if (bookId) {
          // --- Fetch single book structured data ---
          const backendData = await fetchBookStructuredData(bookId);

          const parsed = backendData.flatMap((c: StructuredDataEntry) => {
            const chunk = normalizeChunk(c);
            let events: Event[] = [];
            try {
              events = chunk.Result ? JSON.parse(chunk.Result).Events || [] : [];
            } catch (e) {
              console.error("JSON parse error for chunk:", chunk, e);
            }

            events.forEach((evt) => Object.keys(evt).forEach((k) => allKeys.add(k)));

            return events.map((evt) => ({
              ...evt,
              SourceURL: chunk.SourceURL, // normalized
            }));
          });

          combinedData = parsed;
          setDataRaw([parsed]);
        } else if (projectId && (selectedBooks.length > 0 || selectedCollections.length > 0)) {
          // --- Fetch multiple books in project ---
          const backendData = await fetchProjectStructuredData(
            projectId,
            selectedCollections,
            selectedBooks
          );

          combinedData = backendData.flatMap((c: StructuredDataEntry, index: number) => {
            const chunk = normalizeChunk(c);
            let events: Event[] = [];
            try {
              events = chunk.Result ? JSON.parse(chunk.Result).Events || [] : [];
            } catch (e) {
              console.error("JSON parse error for chunk:", chunk, e);
            }

            events.forEach((evt) => Object.keys(evt).forEach((k) => allKeys.add(k)));

            return events.map((evt) => ({
              ...evt,
              SourceURL: chunk.SourceURL, // normalized
              _bookName:
                chunk.bookId && bookMap.get(chunk.bookId)
                  ? bookMap.get(chunk.bookId)
                  : `Book ${chunk.bookId || index + 1}`,
            }));
          });

          setDataRaw([combinedData]);
        } else {
          setError("No valid book or project resources selected.");
          return;
        }

        if (combinedData.length === 0) {
          setError("No data available for the selected resources.");
          return;
        }

        // Prepare table headers (exclude internal keys)
        const headers = [...allKeys].filter((h) => !["_bookName"].includes(h));
        headers.push("SourceURL"); // always last column

        // Update table
        setRows(combinedData);
        setColumns(generateColumns(headers, globalFilter, tempRefsRef, collectingRefs));

        // Manage search highlighting refs
        collectingRefs.current = true;
        tempRefsRef.current = [];

        if (globalFilter) {
          const refs = combinedData
            .map((row, index) =>
              Object.values(row).some((value) =>
                String(value).toLowerCase().includes(globalFilter.toLowerCase())
              )
                ? index
                : null
            )
            .filter((index): index is number => index !== null)
            .map((index) => ({
              current: document.querySelector(`[data-row-index="${index}"]`),
            }));

          tempRefsRef.current = refs;
        }

        setTimeout(() => {
          collectingRefs.current = false;
          setMatchRefs(tempRefsRef.current);
        }, 100);
      } catch (err: any) {
        console.error("useExcelData error:", err);
        setError(err.message || "Failed to fetch data");
        setDataRaw([]);
        setRows([]);
        setColumns([]);
      }
    }, 500),
    [bookId, projectId, selectedBooks, selectedCollections, globalFilter]
  );

  useEffect(() => {
    if (bookId || (projectId && (selectedBooks.length > 0 || selectedCollections.length > 0))) {
      fetchData();
    } else {
      setError("No valid book or project resources selected.");
    }

    return () => {
      fetchData.cancel();
    };
  }, [bookId, projectId, selectedBooks, selectedCollections, globalFilter, fetchData, setError]);
};
