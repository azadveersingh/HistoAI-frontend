import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { api } from "../../api/api";
import { TableRow } from "./types";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { parseISO, isWithinInterval, isEqual } from "date-fns";
import { Select, MenuItem, Button, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { isValid } from "date-fns";
import axios from "axios";

const FILTERABLE_COLUMNS = [
  "Event Name",
  "Description",
  "Key Details",
  "General Comments",
  "Start Date",
  "End Date"
];

const MULTI_SELECT_COLUMNS = [
  "Day",
  "Month",
  "Year",
  "Place",
  "Location",
  "Participants/People"
];

const DATE_COLUMNS = [
  "Start Date",
  "End Date"
];

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

const getUniqueValues = (rows: TableRow[], column: string): string[] => {
  const values = new Set<string>();
  rows.forEach(row => {
    const value = row[column];
    if (value && value !== "N/A") {
      const items = String(value)
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);
      items.forEach(item => values.add(item));
    }
  });
  if (column === "Day" || column === "Month") {
    return Array.from(values).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  } else if (column === "Year") {
    return Array.from(values).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  }
  return Array.from(values).sort();
};

const parseDate = (dateStr: string | null | undefined): { date: Date | null; year: number | null; month: number | null; day: number | null; isPartial: "year" | "month" | null } => {
  if (!dateStr || dateStr === "N/A") return { date: null, year: null, month: null, day: null, isPartial: null };
  const centuryRegex = /(?:\d{1,2}(?:st|nd|rd|th)?\s*(?:and\s+\d{1,2}(?:st|nd|rd|th)?)?\s*centur(y|ies)\s*(?:ad|bc)?|\d{1,4}\s*(?:ad|bc))/i;
  if (centuryRegex.test(dateStr)) {
    return { date: null, year: null, month: null, day: null, isPartial: null };
  }
  try {
    if (dateStr.endsWith("-00-00")) {
      const year = parseInt(dateStr.split("-")[0], 10);
      if (year >= 1700 && year <= 2025) {
        return { date: null, year, month: 0, day: 0, isPartial: "year" };
      }
    } else if (dateStr.endsWith("-00")) {
      const [year, month] = dateStr.split("-").map(num => parseInt(num, 10));
      if (year >= 1700 && year <= 2025 && month >= 0 && month <= 12) {
        return { date: null, year, month: month - 1, day: 0, isPartial: "month" };
      }
    } else {
      const parsed = parseISO(dateStr);
      if (isValid(parsed)) {
        return {
          date: parsed,
          year: parsed.getFullYear(),
          month: parsed.getMonth(),
          day: parsed.getDate(),
          isPartial: null
        };
      }
    }
  } catch {
    console.warn(`Invalid date format: ${dateStr}`);
  }
  return { date: null, year: null, month: null, day: null, isPartial: null };
};

export const generateColumns = (
  headers: string[],
  globalFilter: string,
  tempRefsRef: React.MutableRefObject<React.RefObject<HTMLElement>[]>,
  collectingRefs: React.MutableRefObject<boolean>,
  rows: TableRow[]
): MRT_ColumnDef<Record<string, unknown>>[] => {
  const filteredHeaders = headers.filter((key) => key !== "pdfUrl");
  return filteredHeaders.map((key): MRT_ColumnDef<Record<string, unknown>> => {
    const columnDef: MRT_ColumnDef<Record<string, unknown>> = {
      accessorKey: key,
      header: key,
      enableColumnFilter: true,
      size: 180,
      minSize: 120,
      Cell: ({ cell }) => {
  let value = cell.getValue<string | null>();
  const search = globalFilter?.toLowerCase();
  if (!value) return "";
  value = String(value).trim();
  if (key === "SourceURL") {
    if (!value || value === "N/A") return "N/A";
    // Extract page number from URL
    const [baseUrl, pageFragment] = value.split("#");
    // Clean the baseUrl to match expected format (e.g., <book_id>/<filename>)
    let cleanUrl = baseUrl
      .replace(/^\/+/, "") // Remove leading slashes
      .replace(/^Uploads\//, "") // Remove Uploads/ prefix
      .replace(/^book\//, "") // Remove book/ prefix
      .replace(/^books\//, "") // Remove books/ prefix
      .replace(new RegExp(`^${api}/Uploads/books?/`), "") // Remove api base and Uploads/books/
      .replace(/^https?:\/\/[^\/]+\/Uploads\/books?\//, ""); // Remove any full URL
    const fullUrl = `${api}/Uploads/book/${cleanUrl}`;
    console.log("SourceURL href:", fullUrl, "Page fragment:", pageFragment);

    const handleClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }
        const response = await axios.get(fullUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        });
        const blobUrl = URL.createObjectURL(response.data);
        const finalUrl = pageFragment ? `${blobUrl}#${pageFragment}` : blobUrl;
        console.log(`Opening PDF: ${finalUrl}`);
        window.open(finalUrl, "_blank");
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          console.log(`Revoked blob URL: ${blobUrl}`);
        }, 1000);
      } catch (error: any) {
        console.error("Error fetching PDF:", error);
        let errorMessage = "Unknown error";
        if (error.response?.data) {
          try {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            errorMessage = json.error || "Failed to fetch PDF";
          } catch {
            errorMessage = error.response?.data?.error || error.message || "Failed to fetch PDF";
          }
        } else {
          errorMessage = error.message || "Failed to fetch PDF";
        }
        alert(`Failed to open PDF: ${errorMessage}`);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        title="Open PDF"
      >
        See Page
      </button>
    );
  }
  if (search && matchesSearchTerms(value, globalFilter.split(/[, ]+/).map(t => t.trim()))) {
    let matchIndex = tempRefsRef.current.length; // Track the starting index for this cell
    const parts = value.split(new RegExp(`(${globalFilter.split(/[, ]+/).map(t => t.trim()).join("|")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => {
          const searchTerms = globalFilter.split(/[, ]+/).map(t => t.trim());
          if (searchTerms.some(term => part.toLowerCase() === term.toLowerCase())) {
            const ref = React.createRef<HTMLSpanElement>();
            if (collectingRefs.current) {
              tempRefsRef.current.push(ref);
            }
            return (
              <mark
                key={`${i}-${matchIndex}`}
                ref={ref}
                className="rounded px-1 bg-yellow-300 text-black"
                data-match-index={matchIndex++}
              >
                {part}
              </mark>
            );
          }
          return <span key={`${i}-${matchIndex}`}>{part}</span>;
        })}
      </span>
    );
  }
  return value;
}
    };
    if (FILTERABLE_COLUMNS.includes(key)) {
      columnDef.filterFn = (row, _id, filterValue: string) => {
        const value = row.getValue<string | null>(key);
        if (!filterValue || !value) return true;
        const searchTerms = filterValue
          .split(/[, ]+/)
          .map(term => term.trim())
          .filter(term => term.length > 0);
        return matchesSearchTerms(value, searchTerms);
      };
    }
    if (MULTI_SELECT_COLUMNS.includes(key)) {
      columnDef.filterVariant = "multi-select";
      columnDef.filterSelectOptions = getUniqueValues(rows, key);
      columnDef.Filter = ({ column }) => {
        const filterValues = (column.getFilterValue() as string[] | undefined) || [];
        return (
          <Select
            multiple
            value={filterValues}
            onChange={(event) => {
              column.setFilterValue(event.target.value);
            }}
            displayEmpty
            renderValue={(selected) => selected.length > 0 ? selected.join(", ") : `Select ${key}`}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 300 },
              },
              MenuListProps: {
                style: { paddingBottom: 0 },
              },
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              componentsProps: {
                paper: {
                  sx: {
                    "& .MuiMenuItem-root": { fontSize: "0.9rem" },
                    "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                    "& .MuiMenuItem-root:hover": { backgroundColor: "rgba(59, 130, 246, 0.05)" },
                  },
                },
              },
            }}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": { fontSize: "0.9rem", borderRadius: "6px" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3b82f6",
                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
              },
            }}
          >
            {columnDef.filterSelectOptions!.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
            <Box sx={{ borderTop: "1px solid #e5e7eb", padding: "8px" }}>
              <Button
                variant="text"
                size="small"
                startIcon={<CloseIcon />}
                onClick={() => column.setFilterValue([])}
                sx={{ width: "100%", justifyContent: "flex-start", fontSize: "0.9rem", color: "#3b82f6" }}
              >
                Clear Filter
              </Button>
            </Box>
          </Select>
        );
      };
      columnDef.filterFn = (row, _id, filterValues: string[]) => {
        const value = row.getValue<string | null>(key);
        console.log(`Filtering ${key}:`, { value, filterValues });
        if (!filterValues || filterValues.length === 0) return true;
        if (!value || value === "N/A") return false;
        const items = String(value)
          .split(",")
          .map(item => item.trim())
          .filter(item => item.length > 0);
        if (key === "Day" || key === "Month") {
          return filterValues.some(filterValue => items.includes(filterValue.padStart(2, "0")));
        }
        return filterValues.some(filterValue => items.includes(filterValue));
      };
    }
    if (DATE_COLUMNS.includes(key)) {
      columnDef.Filter = ({ column }) => {
        const filterValue = column.getFilterValue() as [Date | null, Date | null] || [null, null];
        const [startDate, endDate] = filterValue;
        console.log(`Rendering DatePicker for ${key}:`, { startDate, endDate });
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="flex flex-col gap-2 datepicker-container">
              {key === "Start Date" && (
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue: Date | null) => {
                    console.log(`DatePicker changed for ${key}:`, { newValue });
                    column.setFilterValue([newValue, endDate]);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      variant: "outlined",
                      sx: {
                        width: "100%",
                        "& .MuiInputBase-root": { fontSize: "0.9rem", borderRadius: "6px" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#3b82f6",
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
                        },
                      },
                    },
                    popper: { sx: { zIndex: 100000000 }, placement: "bottom-start" },
                  }}
                  format="yyyy-MM-dd"
                  views={["year", "month", "day"]}
                  minDate={new Date(1700, 0, 1)}
                  maxDate={new Date(2025, 11, 31)}
                />
              )}
              {key === "End Date" && (
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue: Date | null) => {
                    console.log(`DatePicker changed for ${key}:`, { newValue });
                    column.setFilterValue([startDate, newValue]);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      variant: "outlined",
                      sx: {
                        width: "100%",
                        "& .MuiInputBase-root": { fontSize: "0.9rem", borderRadius: "6px" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#3b82f6",
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
                        },
                      },
                    },
                    popper: { sx: { zIndex: 100000000 }, placement: "bottom-start" },
                  }}
                  format="yyyy-MM-dd"
                  views={["year", "month", "day"]}
                  minDate={new Date(1700, 0, 1)}
                  maxDate={new Date(2025, 11, 31)}
                />
              )}
            </div>
          </LocalizationProvider>
        );
      };
      columnDef.filterFn = (row, _id, filterValue: [Date | null, Date | null]) => {
        const value = row.getValue<string | null>(key);
        console.log(`Filtering ${key}:`, { value, filterValue });
        if (!filterValue || (!filterValue[0] && !filterValue[1])) return true;
        const { year: rowYear, month: rowMonth, day: rowDay, isPartial } = parseDate(value);
        if (rowYear === null || rowMonth === null || rowDay === null) return false;
        const [start, end] = filterValue;
        const startYear = start ? start.getFullYear() : null;
        const startMonth = start ? start.getMonth() : null;
        const startDay = start ? start.getDate() : null;
        const endYear = end ? end.getFullYear() : null;
        const endMonth = end ? end.getMonth() : null;
        const endDay = end ? end.getDate() : null;
        if (isPartial === "year") {
          if (startYear && endYear) {
            return rowYear >= startYear && rowYear <= endYear;
          } else if (startYear) {
            return rowYear === startYear;
          } else if (endYear) {
            return rowYear === endYear;
          }
        } else if (isPartial === "month") {
          if (startYear && startMonth && endYear && endMonth) {
            return (
              (rowYear > startYear || (rowYear === startYear && rowMonth >= startMonth)) &&
              (rowYear < endYear || (rowYear === endYear && rowMonth <= endMonth))
            );
          } else if (startYear && startMonth) {
            return rowYear === startYear && rowMonth === startMonth;
          } else if (endYear && endMonth) {
            return rowYear === endYear && rowMonth === endMonth;
          }
        } else {
          const rowDate = new Date(rowYear, rowMonth, rowDay);
          if (start && end) {
            const startDate = new Date(startYear!, startMonth!, startDay!);
            const endDate = new Date(endYear!, endMonth!, endDay!);
            return (
              isWithinInterval(rowDate, { start: startDate, end: endDate }) ||
              isEqual(rowDate, startDate) ||
              isEqual(rowDate, endDate)
            );
          } else if (start) {
            const startDate = new Date(startYear!, startMonth!, startDay!);
            return isEqual(rowDate, startDate);
          } else if (end) {
            const endDate = new Date(endYear!, endMonth!, endDay!);
            return isEqual(rowDate, endDate);
          }
        }
        return true;
      };
    }
    return columnDef;
  });
};