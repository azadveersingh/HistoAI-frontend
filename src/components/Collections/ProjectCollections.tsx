// import { useEffect, useState } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { fetchProjectCollections, removeCollectionsFromProject } from "../../services/collectionServices";
// import { fetchAllBooks } from "../../services/bookServices";
// import ComponentCard from "../../components/common/ComponentCard";
// import Checkbox from "../../components/form/input/Checkbox";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
// } from "../../components/ui/table";
// import { Modal } from "../../components/ui/modal/index";
// import Alert from "../../components/ui/alert/Alert";
// import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";

// interface Collection {
//   _id: string;
//   name: string;
//   bookIds: string[];
//   projectId?: string;
//   createdAt?: string;
// }

// interface Book {
//   _id: string;
//   bookName: string;
//   projectId?: string;
// }

// interface ProjectCollectionsProps {
//   projectId: string;
//   searchQuery: string;
// }

// export default function ProjectCollections({ projectId, searchQuery }: ProjectCollectionsProps) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [collections, setCollections] = useState<Collection[]>([]);
//   const [books, setBooks] = useState<Book[]>([]);
//   const [checkedCollections, setCheckedCollections] = useState<string[]>([]);
//   const [initialCheckedCollections, setInitialCheckedCollections] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedBookList, setSelectedBookList] = useState<Book[]>([]);
//   const [modalTitle, setModalTitle] = useState("");
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);

//   console.log("search query at project collections ", searchQuery);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         const [collectionsData, allBooks] = await Promise.all([
//           fetchProjectCollections(projectId),
//           fetchAllBooks(),
//         ]);

//         console.log("Project collections:", collectionsData);

//         const ids = collectionsData.map((c) => c._id);
//         setCollections(collectionsData);
//         setBooks(allBooks);
//         setCheckedCollections(ids);
//         setInitialCheckedCollections(ids);
//       } catch (err: any) {
//         console.error("Load data error:", err);
//         setError("Failed to load project collections");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [projectId]);

//   const handleCheckboxChange = (collectionId: string, checked: boolean) => {
//     setCheckedCollections((prev) =>
//       checked ? [...prev, collectionId] : prev.filter((id) => id !== collectionId)
//     );
//   };

//   const handleSaveChanges = async () => {
//     const removed = initialCheckedCollections.filter(
//       (id) => !checkedCollections.includes(id)
//     );

//     if (removed.length === 0) {
//       setAlert({
//         variant: "info",
//         title: "No Changes",
//         message: "No collections were removed.",
//       });
//       return;
//     }

//     console.log("Collections to remove:", removed);
//     setShowConfirmDialog(true);
//   };

//   const handleConfirmRemove = async () => {
//     const removed = initialCheckedCollections.filter(
//       (id) => !checkedCollections.includes(id)
//     );

//     try {
//       console.log("Sending removeCollectionsFromProject request with collectionIds:", removed);
//       const response = await removeCollectionsFromProject(projectId, removed);
//       console.log("removeCollectionsFromProject response:", response);

//       setCollections((prev) => prev.filter((col) => !removed.includes(col._id)));
//       setInitialCheckedCollections((prev) => prev.filter((id) => !removed.includes(id)));
//       setCheckedCollections((prev) => prev.filter((id) => !removed.includes(id)));
//       setAlert({
//         variant: "success",
//         title: "Collections Removed",
//         message: `${removed.length} collection(s) removed from the project.`,
//       });
//     } catch (err: any) {
//       console.error("Error removing collections:", err.response?.data || err);
//       setAlert({
//         variant: "error",
//         title: "Error",
//         message: err.response?.data?.error || "Failed to remove collections. Please try again.",
//       });
//     } finally {
//       setShowConfirmDialog(false);
//     }
//   };

//   const openBookModal = (collection: Collection) => {
//     const bookList = books.filter((book) => collection.bookIds.includes(book._id));
//     setSelectedBookList(bookList);
//     setModalTitle(collection.name);
//     setShowModal(true);
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   const filteredCollections = collections.filter((collection) =>
//     collection.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const hasChanges =
//     checkedCollections.length !== initialCheckedCollections.length ||
//     checkedCollections.some((id) => !initialCheckedCollections.includes(id)) ||
//     initialCheckedCollections.some((id) => !checkedCollections.includes(id));

//   if (loading) return <div>Loading project collections...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <ComponentCard title="Project Collections">
//       <div className="flex flex-col gap-4">
//         {alert && (
//           <Alert
//             variant={alert.variant}
//             title={alert.title}
//             message={alert.message}
//           />
//         )}

//         <Table className="border-collapse">
//           <TableHeader className="bg-gray-100 dark:bg-gray-800">
//             <TableRow>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 Select
//               </TableCell>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 Collection Name
//               </TableCell>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 No. of Books
//               </TableCell>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 Created At
//               </TableCell>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredCollections.map((collection) => (
//               <TableRow
//                 key={collection._id}
//                 className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
//               >
//                 <TableCell className="p-4">
//                   <Checkbox
//                     id={`collection-${collection._id}`}
//                     checked={checkedCollections.includes(collection._id)}
//                     onChange={(checked) => handleCheckboxChange(collection._id, checked)}
//                     label=""
//                   />
//                 </TableCell>
//                 <TableCell className="p-4">
//                   <button
//                     className="text-blue-600 dark:text-blue-400 hover:underline"
//                     onClick={() => navigate(`/collections/${collection._id}`)}
//                   >
//                     {collection.name}
//                   </button>
//                 </TableCell>
//                 <TableCell className="p-4">
//                   <button
//                     className="text-blue-600 dark:text-blue-400 hover:underline"
//                     onClick={() => openBookModal(collection)}
//                   >
//                     {collection.bookIds.length}
//                   </button>
//                 </TableCell>
//                 <TableCell className="p-4">{formatDate(collection.createdAt)}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>

//         {filteredCollections.length === 0 && (
//           <div className="text-gray-500 dark:text-gray-400 text-center py-4">
//             No collections found matching your search
//           </div>
//         )}

//         <div className="mt-4 text-right">
//           <button
//             onClick={handleSaveChanges}
//             disabled={!hasChanges}
//             className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded transition ${
//               !hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
//             }`}
//           >
//             Save Changes
//           </button>
//         </div>

//         <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Books in "${modalTitle}"`}>
//           <div className="space-y-2 p-4">
//             {selectedBookList.length > 0 ? (
//               selectedBookList.map((book) => (
//                 <div key={book._id} className="text-gray-800 dark:text-gray-100">
//                   {book.bookName || "Untitled"}
//                 </div>
//               ))
//             ) : (
//               <div className="text-gray-500 dark:text-gray-400">No books found.</div>
//             )}
//           </div>
//         </Modal>

//         <ConfirmDialog
//           isOpen={showConfirmDialog}
//           message={`Are you sure you want to remove ${initialCheckedCollections.filter(
//             (id) => !checkedCollections.includes(id)
//           ).length} collection(s) from the project?`}
//           onConfirm={handleConfirmRemove}
//           onCancel={() => setShowConfirmDialog(false)}
//           confirmText="Remove"
//           isDestructive={true}
//         />
//       </div>
//     </ComponentCard>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjectCollections, removeCollectionsFromProject } from "../../services/collectionServices";
import { fetchAllBooks } from "../../services/bookServices";
import ComponentCard from "../../components/common/ComponentCard";
import Checkbox from "../../components/form/input/Checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal/index";
import Alert from "../../components/ui/alert/Alert";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";

interface Collection {
  _id: string;
  name: string;
  bookIds: string[];
  projectId?: string;
  createdAt?: string;
}

interface Book {
  _id: string;
  bookName: string;
  projectId?: string;
}

interface ProjectCollectionsProps {
  projectId: string;
  searchQuery?: string;
  isToolsPage?: boolean;
  selectedCollections?: string[];
  onCollectionSelectionChange?: (collectionId: string, checked: boolean) => void;
}

export default function ProjectCollections({ 
  projectId, 
  searchQuery = "", 
  isToolsPage = false, 
  selectedCollections, 
  onCollectionSelectionChange 
}: ProjectCollectionsProps) {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedCollections, setCheckedCollections] = useState<string[]>([]);
  const [initialCheckedCollections, setInitialCheckedCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookList, setSelectedBookList] = useState<Book[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [collectionsData, allBooks] = await Promise.all([
          fetchProjectCollections(projectId),
          isToolsPage ? Promise.resolve([]) : fetchAllBooks(),
        ]);

        setCollections(collectionsData);
        setBooks(allBooks);
        if (!isToolsPage) {
          const ids = collectionsData.map((c) => c._id);
          setCheckedCollections(ids);
          setInitialCheckedCollections(ids);
        }
      } catch (err: any) {
        console.error("Load data error:", err);
        setError("Failed to load project collections");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, isToolsPage]);

  const handleCheckboxChange = (collectionId: string, checked: boolean) => {
    if (isToolsPage && onCollectionSelectionChange) {
      onCollectionSelectionChange(collectionId, checked);
    } else {
      setCheckedCollections((prev) =>
        checked ? [...prev, collectionId] : prev.filter((id) => id !== collectionId)
      );
    }
  };

  const handleSaveChanges = async () => {
    const removed = initialCheckedCollections.filter(
      (id) => !checkedCollections.includes(id)
    );

    if (removed.length === 0) {
      setAlert({
        variant: "info",
        title: "No Changes",
        message: "No collections were removed.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    const removed = initialCheckedCollections.filter(
      (id) => !checkedCollections.includes(id)
    );

    try {
      await removeCollectionsFromProject(projectId, removed);
      setCollections((prev) => prev.filter((col) => !removed.includes(col._id)));
      setInitialCheckedCollections((prev) => prev.filter((id) => !removed.includes(id)));
      setCheckedCollections((prev) => prev.filter((id) => !removed.includes(id)));
      setAlert({
        variant: "success",
        title: "Collections Removed",
        message: `${removed.length} collection(s) removed from the project.`,
      });
    } catch (err: any) {
      console.error("Error removing collections:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "Failed to remove collections. Please try again.",
      });
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const openBookModal = (collection: Collection) => {
    const bookList = books.filter((book) => collection.bookIds.includes(book._id));
    setSelectedBookList(bookList);
    setModalTitle(collection.name);
    setShowModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const filteredCollections = collections.filter((collection) =>
    !searchQuery || collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasChanges =
    !isToolsPage &&
    (checkedCollections.length !== initialCheckedCollections.length ||
      checkedCollections.some((id) => !initialCheckedCollections.includes(id)) ||
      initialCheckedCollections.some((id) => !checkedCollections.includes(id)));

  if (loading) return <div className={isToolsPage ? "text-xs sm:text-sm text-gray-800 dark:text-gray-100" : "text-sm sm:text-base text-gray-800 dark:text-gray-100"}>Loading project collections...</div>;
  if (error) return <div className={isToolsPage ? "text-xs sm:text-sm text-red-600 dark:text-red-400" : "text-sm sm:text-base text-red-600 dark:text-red-400"}>{error}</div>;

  return (
    <ComponentCard
      title={
        <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
          Project Collections
        </span>
      }
      className={isToolsPage ? "bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-sm" : "bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow-sm"}
    >
      <div className={isToolsPage ? "flex flex-col gap-2 sm:gap-3" : "flex flex-col gap-3 sm:gap-4"}>
        {!isToolsPage && alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            className={isToolsPage ? "text-xs sm:text-sm" : "text-sm sm:text-base"}
          />
        )}

        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto w-full">
          <Table className={isToolsPage ? "table-fixed min-w-full border-collapse text-xs sm:text-sm" : "table-fixed min-w-full border-collapse text-sm sm:text-base"}>
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className={isToolsPage ? "w-12 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-16 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Select
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/2 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/2 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Collection Name
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/4 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/4 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  No. of Books
                </TableCell>
                <TableCell isHeader className={isToolsPage ? "w-1/4 p-1 sm:p-2 text-left font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-200" : "w-1/4 p-2 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-200"}>
                  Created At
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className={isToolsPage ? "p-1 sm:p-2 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400" : "p-2 sm:p-4 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400"}>
                    No collections found{searchQuery ? " matching your search" : ""}.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollections.map((collection) => (
                  <TableRow
                    key={collection._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className={isToolsPage ? "w-12 p-1 sm:p-2" : "w-16 p-2 sm:p-4"}>
                      <Checkbox
                        id={`collection-${collection._id}`}
                        checked={isToolsPage ? selectedCollections?.includes(collection._id) : checkedCollections.includes(collection._id)}
                        onChange={(checked) => handleCheckboxChange(collection._id, checked)}
                        label=""
                        className={isToolsPage ? "text-gray-700 dark:text-gray-200 scale-75 sm:scale-90" : "text-gray-700 dark:text-gray-200 scale-100"}
                        aria-label={`Select collection ${collection.name || "Untitled Collection"}`}
                      />
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/2 p-1 sm:p-2" : "w-1/2 p-2 sm:p-4"}>
                      <div className="truncate" title={collection.name}>
                        <button
                          className={isToolsPage ? "text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm" : "text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"}
                          onClick={() => navigate(`/collections/${collection._id}`)}
                        >
                          {truncateText(collection.name, isToolsPage ? 20 : 30)}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/4 p-1 sm:p-2" : "w-1/4 p-2 sm:p-4"}>
                      <button
                        className={isToolsPage ? "text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm" : "text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"}
                        onClick={() => openBookModal(collection)}
                      >
                        {collection.bookIds.length}
                      </button>
                    </TableCell>
                    <TableCell className={isToolsPage ? "w-1/4 p-1 sm:p-2 text-xs sm:text-sm text-gray-800 dark:text-gray-100" : "w-1/4 p-2 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-gray-100"}>
                      {formatDate(collection.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isToolsPage && (
          <div className={isToolsPage ? "mt-2 text-right" : "mt-3 sm:mt-4 text-right"}>
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className={isToolsPage
                ? `bg-blue-600 dark:bg-blue-700 text-white font-semibold py-1 px-2 sm:px-3 rounded-md transition text-xs sm:text-sm ${!hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-800"}`
                : `bg-blue-600 dark:bg-blue-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition text-sm sm:text-base ${!hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-800"}`
              }
            >
              Remove Collections
            </button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Books in "${modalTitle}"`}
          className={isToolsPage ? "text-xs sm:text-sm" : "text-sm sm:text-base"}
        >
          <div className={isToolsPage ? "space-y-1 p-2 sm:p-3" : "space-y-2 p-2 sm:p-4"}>
            {selectedBookList.length > 0 ? (
              selectedBookList.map((book) => (
                <div key={book._id} className={isToolsPage ? "text-xs sm:text-sm text-gray-800 dark:text-gray-100" : "text-sm sm:text-base text-gray-800 dark:text-gray-100"}>
                  {book.bookName || "Untitled"}
                </div>
              ))
            ) : (
              <div className={isToolsPage ? "text-xs sm:text-sm text-gray-500 dark:text-gray-400" : "text-sm sm:text-base text-gray-500 dark:text-gray-400"}>No books found.</div>
            )}
          </div>
        </Modal>

        {!isToolsPage && (
          <ConfirmDialog
            isOpen={showConfirmDialog}
            message={`Are you sure you want to remove ${initialCheckedCollections.filter(
              (id) => !checkedCollections.includes(id)
            ).length} collection(s) from the project?`}
            onConfirm={handleConfirmRemove}
            onCancel={() => setShowConfirmDialog(false)}
            confirmText="Remove"
            isDestructive={true}
            className={isToolsPage ? "text-xs sm:text-sm" : "text-sm sm:text-base"}
          />
        )}
      </div>
    </ComponentCard>
  );
}
