
import { useEffect, useCallback } from "react";
import { fetchBookStructuredData, fetchProjectStructuredData } from "../../services/structuredDataServices";
import { fetchAllBooks } from "../../services/bookServices";
import { generateColumns } from "./generateColumns";
import { Event, StructuredDataEntry, TableRow } from "./types";
import debounce from "lodash/debounce";
import { api } from "../../api/api";
import { parse, isValid } from "date-fns";

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

const FIXED_COLUMNS = [
  "Event Name",
  "Description",
  "Participants/People",
  "Location",
  "Place",
  "Start Date",
  "End Date",
  "Key Details",
  "Day",
  "Month",
  "Year",
  "General Comments"
];

const FILTERABLE_COLUMNS = [
  "Event Name",
  "Description",
  "Key Details",
  "General Comments"
];

// Map month names/abbreviations to numeric values (01-12)
const monthMap: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

const normalizeDate = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === "N/A" || dateStr === "") return "N/A";

  const trimmedDate = dateStr.trim().toLowerCase();
  console.log(`Normalizing date: ${dateStr}`); // Debug log

  // Preserve century/era strings
  const centuryRegex =
    /(?:\d{1,2}(?:st|nd|rd|th)?\s*(?:and\s+\d{1,2}(?:st|nd|rd|th)?)?\s*centur(y|ies)\s*(?:ad|bc)?|\d{1,4}\s*(?:ad|bc))/i;
  if (centuryRegex.test(trimmedDate)) {
    console.warn(`Century string detected, returning original: ${dateStr}`);
    return dateStr;
  }

  // Map written numbers to digits
  const numberMap: Record<string, string> = {
    first: "1",
    second: "2",
    third: "3",
    fourth: "4",
    fifth: "5",
    sixth: "6",
    seventh: "7",
    eighth: "8",
    ninth: "9",
    tenth: "10",
    eleventh: "11",
    twelfth: "12",
    thirteenth: "13",
    fourteenth: "14",
    fifteenth: "15",
    sixteenth: "16",
    seventeenth: "17",
    eighteenth: "18",
    nineteenth: "19",
    twentieth: "20",
    twenty: "20",
    thirty: "30",
    fourty: "40",
    forty: "40",
    fifty: "50",
    sixty: "60",
    seventy: "70",
    eighty: "80",
    ninety: "90",
    hundred: "100",
    "eighteen-fifty-seven": "1857",
  };

  let processedDate = trimmedDate;
  Object.keys(numberMap).forEach((key) => {
    processedDate = processedDate.replace(new RegExp(`\\b${key}\\b`, "i"), numberMap[key]);
  });

  // Remove ordinal suffixes
  processedDate = processedDate.replace(/(?:(\d+)(?:st|nd|rd|th))/gi, "$1");

  // Map month names/abbreviations to numbers
  Object.keys(monthMap).forEach((key) => {
    processedDate = processedDate.replace(new RegExp(`\\b${key}\\b`, "i"), monthMap[key]);
  });

  // Define possible date formats
  const dateFormats = [
    "yyyy-MM-dd",
    "yyyy-MM",
    "yyyy",
    "MMMM d yyyy",
    "MMMM d, yyyy",
    "d MMMM yyyy",
    "dd MMMM yyyy",
    "d-MMMM-yyyy",
    "dd-MMMM-yyyy",
    "MMMM yyyy",
    "dd-MM-yyyy",
    "d-MM-yyyy",
    "dd/MM/yyyy",
    "d/MM/yyyy",
    "d MMMM",
    "dd MMMM",
  ];

  for (const format of dateFormats) {
    try {
      const parsedDate = parse(processedDate, format, new Date());
      if (isValid(parsedDate)) {
        const year = parsedDate.getFullYear();
        const month = parsedDate.getMonth() + 1; // 1-based for output
        const day = parsedDate.getDate();

        if (year < 1700 || year > 2025) {
          console.warn(
            `Date out of range: ${dateStr}, parsed: ${year}-${month}-${day}`
          );
          return "N/A";
        }

        if (format === "yyyy") {
          return `${year}-00-00`;
        } else if (
          format.includes("MMMM yyyy") ||
          format.includes("yyyy-MM") ||
          format.includes("yyyy-M")
        ) {
          return `${year}-${month.toString().padStart(2, "0")}-00`;
        } else if (format.includes("MMMM") && !format.includes("yyyy")) {
          return `0000-${month.toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`;
        } else {
          return `${year}-${month.toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`;
        }
      }
    } catch (e) {
      console.debug(`Failed to parse date "${dateStr}" with format "${format}"`);
    }
  }

  console.warn(`Unable to normalize date: ${dateStr}`);
  return "N/A";
};

const normalizeRow = (row: TableRow): TableRow => {
  const normalized: TableRow = { ...row };

  FIXED_COLUMNS.forEach(col => {
    let value = normalized[col];
    const stringValue = value != null ? String(value).trim() : "";

    if (
      stringValue === "" ||
      stringValue === "N/A" ||
      stringValue === "string" ||
      stringValue === "year" ||
      stringValue === "yyyy" ||
      stringValue === "day" ||
      stringValue === "xx" ||
      stringValue === "dd" ||
      stringValue === "month" ||
      stringValue === "mm" ||
      stringValue === "year month day" ||
      stringValue === "null" ||
      stringValue === "undefined" ||
      value === null ||
      value === undefined
    ) {
      normalized[col] = "N/A";
    }
  });

  // Normalize Month
  if (normalized["Month"] && normalized["Month"] !== "N/A") {
    let monthStr = String(normalized["Month"]).trim().toLowerCase();
    if (monthMap[monthStr]) {
      normalized["Month"] = monthMap[monthStr];
    } else if (/^\d{1,2}$/.test(monthStr)) {
      const num = parseInt(monthStr, 10);
      if (num >= 1 && num <= 12) {
        normalized["Month"] = num.toString().padStart(2, "0");
      } else {
        normalized["Month"] = "N/A";
      }
    } else {
      normalized["Month"] = "N/A";
    }
  }

  // Normalize Day
  if (normalized["Day"] && normalized["Day"] !== "N/A") {
    let dayStr = String(normalized["Day"]).trim();
    if (/^\d{1,2}$/.test(dayStr)) {
      const num = parseInt(dayStr, 10);
      if (num >= 1 && num <= 31) {
        normalized["Day"] = num.toString().padStart(2, "0");
      } else {
        normalized["Day"] = "N/A";
      }
    } else {
      normalized["Day"] = "N/A";
    }
  }

  // Normalize Year
  if (normalized["Year"] && normalized["Year"] !== "N/A") {
    let yearStr = String(normalized["Year"]).trim();
    if (/^\d{4}$/.test(yearStr)) {
      const num = parseInt(yearStr, 10);
      if (num >= 1700 && num <= 2025) {
        normalized["Year"] = num.toString();
      } else {
        normalized["Year"] = "N/A";
      }
    } else {
      normalized["Year"] = "N/A";
    }
  }

  // Normalize Start Date and End Date
  if (normalized["Start Date"] && normalized["Start Date"] !== "N/A") {
    normalized["Start Date"] = normalizeDate(normalized["Start Date"]);
  }
  if (normalized["End Date"] && normalized["End Date"] !== "N/A") {
    normalized["End Date"] = normalizeDate(normalized["End Date"]);
  }

  if (!normalized.SourceURL || normalized.SourceURL === "string") {
    normalized.SourceURL = "N/A";
  }

  return normalized;
};

const normalizeUrl = (url?: string | null): string => {
  if (!url || url === "N/A") return "N/A";
  if (url.startsWith("http")) return url;
  const apiBase = api;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  return `${apiBase}/Uploads/${cleanPath}`;
};

const normalizeChunk = (chunk: StructuredDataEntry) => {
  const rawUrl = chunk.SourceURL || chunk["Source URL"] || null;
  return {
    ...chunk,
    SourceURL: normalizeUrl(rawUrl),
  };
};

// Helper function to check if a value matches the search terms
const matchesSearchTerms = (value: string | null | undefined, searchTerms: string[]): boolean => {
  if (!value) return false;
  const lowerValue = value.toLowerCase();
  return searchTerms.some(term => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return false;
    const termWords = trimmedTerm.split(/\s+/);
    const allWordsMatch = termWords.every(word => lowerValue.includes(word.toLowerCase()));
    return allWordsMatch;
  });
};

// Helper function to check if a row is empty
const isRowEmpty = (row: TableRow): boolean => {
  return FIXED_COLUMNS
    .filter(col => col !== "SourceURL")
    .every(col => {
      const value = row[col];
      return value === null || value === undefined || value === "" || value === "N/A";
    });
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
        let serial = 1;

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
          const backendData = await fetchBookStructuredData(bookId);
          const parsed = backendData.flatMap((c: StructuredDataEntry) => {
            const chunk = normalizeChunk(c);
            let events: Event[] = [];
            try {
              events = chunk.Result ? JSON.parse(chunk.Result).Events || [] : [];
            } catch (e) {
              console.error("JSON parse error for chunk:", chunk, e);
            }

            return events.map((evt) => {
              const filteredEvt: Partial<Event> = {};
              FIXED_COLUMNS.forEach(key => {
                if (key in evt) {
                  filteredEvt[key] = evt[key];
                }
              });
              return {
                ...filteredEvt,
                SourceURL: chunk.SourceURL,
              };
            });
          });

          combinedData = parsed;
        } else if (projectId && (selectedBooks.length > 0 || selectedCollections.length > 0)) {
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

            return events.map((evt) => {
              const filteredEvt: Partial<Event> = {};
              FIXED_COLUMNS.forEach(key => {
                if (key in evt) {
                  filteredEvt[key] = evt[key];
                }
              });
              return {
                ...filteredEvt,
                SourceURL: chunk.SourceURL,
                _bookName:
                  chunk.bookId && bookMap.get(chunk.bookId)
                    ? bookMap.get(chunk.bookId)
                    : `Book ${chunk.bookId || index + 1}`,
              };
            });
          });
        } else {
          setError("No valid book or project resources selected.");
          return;
        }

        if (combinedData.length === 0) {
          setError("No data available for the selected resources.");
          return;
        }

        // Filter out empty rows and normalize
        combinedData = combinedData
          .filter(row => !isRowEmpty(row))
          .map(row => normalizeRow(row));
        console.log("Normalized data:", combinedData); // Debug log

        // Apply global filter to specified columns
        let filteredData = combinedData;
        if (globalFilter) {
          const searchTerms = globalFilter
            .split(/[, ]+/)
            .map(term => term.trim())
            .filter(term => term.length > 0);

          filteredData = combinedData.filter(row =>
            FILTERABLE_COLUMNS.some(column =>
              matchesSearchTerms(row[column], searchTerms)
            )
          );
        }

        // Prepare table headers (exclude _bookName)
        const headers = [...FIXED_COLUMNS, "SourceURL"];

        // Update table
        setRows(filteredData);
        setDataRaw([filteredData]);
        setColumns(generateColumns(headers, globalFilter, tempRefsRef, collectingRefs, filteredData));

        // Manage search highlighting refs
        collectingRefs.current = true;
        tempRefsRef.current = [];

        if (globalFilter) {
          const refs = filteredData
            .map((row, index) =>
              FILTERABLE_COLUMNS.some(column =>
                matchesSearchTerms(row[column], globalFilter.split(/[, ]+/).map(t => t.trim()))
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
    },),
    [bookId, projectId, selectedBooks, selectedCollections, globalFilter]
  );
  const debouncedFetchData = useCallback(debounce(fetchData, 500), [fetchData]);
  useEffect(() => {
    if (bookId || (projectId && (selectedBooks.length > 0 || selectedCollections.length > 0))) {
      fetchData();
    } else {
      setError("No valid book or project resources selected.");
    }

    return () => {
      debouncedFetchData.cancel();
    };
  }, [bookId, projectId, selectedBooks, selectedCollections, globalFilter, fetchData, debouncedFetchData, setError]);
};
