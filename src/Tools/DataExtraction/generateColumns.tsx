import React from "react";
import { MRT_ColumnDef } from "material-react-table";
import { api } from "../../api/api";

export const generateColumns = (
  headers: string[],
  globalFilter: string,
  tempRefsRef: React.MutableRefObject<React.RefObject<HTMLElement>[]>,
  collectingRefs: React.MutableRefObject<boolean>
): MRT_ColumnDef<Record<string, unknown>>[] => {
  const filteredHeaders = headers.filter((key) => key !== "pdfUrl");

  return filteredHeaders.map((key): MRT_ColumnDef<Record<string, unknown>> => ({
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
        let url = value;
        if (!url.startsWith("http")) {
          url = `${api}/${url.startsWith("uploads/") ? url : `uploads/${url}`}`;
        }
        // Log the URL when the link is rendered
        console.log("SourceURL href:", url);
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            onClick={() => console.log("Clicked SourceURL:", url)} // Log on click
          >
            See Page
          </a>
        );
      }

      if (search && value.toLowerCase().includes(search)) {
        const parts = value.split(new RegExp(`(${search})`, "gi"));
        return (
          <span>
            {parts.map((part, i) => {
              if (part.toLowerCase() === search) {
                const ref = React.createRef<HTMLSpanElement>();
                if (collectingRefs.current) {
                  tempRefsRef.current.push(ref);
                }
                return (
                  <mark
                    key={i}
                    ref={ref}
                    className="rounded px-1 bg-yellow-300 text-black"
                  >
                    {part}
                  </mark>
                );
              }
              return part;
            })}
          </span>
        );
      }

      return value;
    },
  }));
};