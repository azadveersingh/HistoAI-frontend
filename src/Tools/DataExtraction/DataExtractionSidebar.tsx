import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { fetchAllBooks, fetchBookFile } from "../../services/bookServices";
import { fetchProjectCollections } from "../../services/collectionServices";
import { Book } from "./types";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { api } from "../../api/api";
import debounce from "lodash/debounce";

interface Collection {
  _id: string;
  name: string;
  bookIds: string[];
}

const DataExtractionSidebar: React.FC = () => {
  const { id: projectIdFromParams } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [bookPdfs, setBookPdfs] = useState<Book[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize selectedBooks and selectedCollections
  const selectedBooks = useMemo(
    () => searchParams.get("books")?.split(",").filter(Boolean) || [],
    [searchParams]
  );
  const selectedCollections = useMemo(
    () => searchParams.get("collections")?.split(",").filter(Boolean) || [],
    [searchParams]
  );

  // Debounced fetchData
  const fetchData = useMemo(
    () =>
      debounce(async () => {
        if (!projectIdFromParams) {
          setBookPdfs([]);
          setCollections([]);
          setError("No project ID provided");
          return;
        }

        try {
          const allBookIdsSet = new Set(selectedBooks);

          let collectionsData = [];
          let filteredCollections = [];
          if (selectedCollections.length > 0) {
            collectionsData = await fetchProjectCollections(projectIdFromParams);
            filteredCollections = collectionsData.filter((collection: { _id: string }) => selectedCollections.includes(collection._id));
            setCollections(
              filteredCollections.map((collection: { _id: string; name: string; bookIds: string[] }) => ({
                _id: collection._id,
                name: collection.name || `Collection ${collection._id}`,
                bookIds: Array.isArray(collection.bookIds) ? collection.bookIds : [],
              }))
            );
            filteredCollections.forEach((collection: { bookIds: string[] }) => {
              collection.bookIds.forEach((bid: string) => allBookIdsSet.add(bid));
            });
          } else {
            setCollections([]);
          }

          const allBookIds = Array.from(allBookIdsSet);

          let bookPdfsData: Book[] = [];
          if (allBookIds.length > 0) {
            const booksData = await fetchAllBooks("all");

            bookPdfsData = await Promise.all(
              booksData
                .filter((book: { _id: string }) => allBookIds.includes(book._id))
                .map(async (book: { _id: string; bookName: string; previewUrl: string }) => {
                  let fileUrl = "";
                  try {
                    if (book.previewUrl) {
                      fileUrl = await fetchBookFile(book.previewUrl); // ✅ use bookServices
                    }
                  } catch (err) {
                    console.error("Error fetching book file:", err);
                  }
                  return {
                    book_id: book._id,
                    filename: book.bookName || `Book ${book._id}`,
                    fileUrl,
                  };
                })
            );

            setBookPdfs(bookPdfsData);
          } else {
            setBookPdfs([]);
          }


          setError(null);
        } catch (e: any) {
          console.error("Error fetching metadata:", e.message);
          setError("Failed to fetch metadata");
        }
      }, 500),
    [projectIdFromParams, selectedBooks, selectedCollections]
  );

  useEffect(() => {
    fetchData();
    return () => {
      fetchData.cancel();
    };
  }, [fetchData]);

  const collectionBookIdsSet = useMemo(() => {
    const set = new Set<string>();
    collections.forEach((col) => {
      col.bookIds.forEach((bid) => set.add(bid));
    });
    return set;
  }, [collections]);

  const looseBooks = useMemo(() => {
    return bookPdfs.filter((book) => !collectionBookIdsSet.has(book.book_id));
  }, [bookPdfs, collectionBookIdsSet]);

  const collectionBooks = useMemo(() => {
    return collections.reduce((acc: Record<string, Book[]>, collection) => {
      acc[collection._id] = bookPdfs.filter((book) =>
        collection.bookIds.includes(book.book_id)
      );
      return acc;
    }, {});
  }, [collections, bookPdfs]);


return (
  <div className="h-full p-6 overflow-y-auto bg-gradient-to-b from-white to-gray-50 shadow-xl rounded-2xl max-w-xs w-full border border-gray-200">
    {/* Sticky Header */}
    <div className="sticky top-0 bg-white pb-4 z-10">
      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
         Selected Resources
      </h2>
    </div>

    {/* Error Message */}
    {error && (
      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium shadow-sm">
        {error}
      </div>
    )}

    {/* Books Section */}
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        📖 Projects Books
      </h3>
      {looseBooks.length > 0 ? (
        <ul className="space-y-2">
          {looseBooks.map((book) => (
            <li
              key={book.book_id}
              className="transition-transform transform hover:scale-[1.02]"
            >
              <a
                href={book.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 hover:shadow-md truncate text-sm text-gray-800"
                title={book.filename}
              >
                <span className="text-red-500">📄</span>
                <span className="truncate">{book.filename}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-sm italic flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
          <span>📭</span> No books selected
        </div>
      )}
    </div>

    <hr className="my-6 border-gray-300" />

    {/* Collections Section */}
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        🗂️ Collections
      </h3>
      {collections.length > 0 ? (
        collections.map((collection) => (
          <div
            key={collection._id}
            className={`mb-3 rounded-lg transition-all ${
              expandedCollection === collection._id
                ? "bg-gray-50 border border-gray-200 shadow-sm"
                : ""
            }`}
          >
            {/* Collection Toggle */}
            <button
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() =>
                setExpandedCollection(
                  expandedCollection === collection._id ? null : collection._id
                )
              }
              aria-expanded={expandedCollection === collection._id}
              aria-controls={`collection-${collection._id}`}
            >
              <span
                className={`mr-2 text-gray-500 transform transition-transform ${
                  expandedCollection === collection._id ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
              <span
                className="truncate text-sm font-medium"
                title={collection.name}
              >
                {collection.name}
              </span>
            </button>

            {/* Collection Books */}
            {expandedCollection === collection._id && (
              <div
                id={`collection-${collection._id}`}
                className="ml-6 mt-2 space-y-2 transition-all duration-300 ease-in-out"
              >
                {collectionBooks[collection._id]?.length > 0 ? (
                  collectionBooks[collection._id].map((book) => (
                    <a
                      key={book.book_id}
                      href={book.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 hover:shadow-md text-sm text-gray-700"
                      title={book.filename}
                    >
                      <span className="text-blue-500">📘</span>
                      <span className="truncate">{book.filename}</span>
                    </a>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm italic flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                    <span>📭</span> No books in this collection
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm italic flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
          <span>📂</span> No collections selected
        </div>
      )}
    </div>
  </div>
);

};

export default DataExtractionSidebar;