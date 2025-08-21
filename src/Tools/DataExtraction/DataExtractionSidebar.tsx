import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { fetchAllBooks } from "../../services/bookServices";
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

          let bookPdfsData = [];
          if (allBookIds.length > 0) {
            const booksData = await fetchAllBooks("all");
            bookPdfsData = booksData
              .filter((book: { _id: string }) => allBookIds.includes(book._id))
              .map((book: { _id: string; bookName: string }) => ({
                book_id: book._id,
                filename: book.bookName || `Book ${book._id}`,
                fileUrl: `${api}/api/uploads/book_${book._id}.pdf`,
              }));
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
    <div className="h-full p-6 overflow-y-auto bg-white shadow-lg rounded-xl max-w-xs w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Selected Resources</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Books</h3>
        {looseBooks.length > 0 ? (
          <ul className="space-y-2">
            {looseBooks.map((book) => (
              <li
                key={book.book_id}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <a
                  href={book.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg hover:bg-gray-100 truncate text-sm"
                  title={book.filename}
                >
                  {book.filename}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic">No books selected</p>
        )}
      </div>
      <hr className="my-6 border-gray-200" />
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Collections</h3>
        {collections.length > 0 ? (
          collections.map((collection) => (
            <div key={collection._id} className="mb-2">
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
                {expandedCollection === collection._id ? (
                  <FaChevronDown className="mr-2 text-gray-500" size={14} />
                ) : (
                  <FaChevronRight className="mr-2 text-gray-500" size={14} />
                )}
                <span className="truncate text-sm font-medium" title={collection.name}>
                  {collection.name}
                </span>
              </button>
              {expandedCollection === collection._id && (
                <div
                  id={`collection-${collection._id}`}
                  className="ml-6 mt-2 space-y-2 transition-all duration-300 ease-in-out"
                >
                  {collectionBooks[collection._id]?.length > 0 ? (
                    collectionBooks[collection._id].map((book) => (
                      <div
                        key={book.book_id}
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        <a
                          href={book.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate text-sm transition-colors duration-200"
                          title={book.filename}
                        >
                          {book.filename}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic pl-2">
                      No books in this collection
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No collections selected</p>
        )}
      </div>
    </div>
  );
};

export default DataExtractionSidebar;