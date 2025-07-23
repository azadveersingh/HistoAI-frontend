// import { useState, useEffect, useMemo } from "react";
// import { useParams } from "react-router-dom";
// import { fetchAllBooks, fetchProjectBooks, addBooksToProject } from "../../services/bookServices";
// import Checkbox from "../../components/form/input/Checkbox";
// import ComponentCard from "../../components/common/ComponentCard";
// import Button from "../../components/ui/button/Button";
// import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
// import Alert from "../../components/ui/alert/Alert";
// import { api as API_BASE } from "../../api/api";

// interface Book {
//   _id: string;
//   bookName: string;
//   author?: string;
//   edition?: string;
//   fileName?: string;
//   frontPageImagePath?: string;
//   createdAt?: string;
// }

// interface AllBooksProps {
//   searchQuery?: string;
// }

// export default function AllBooks({ searchQuery = "" }: AllBooksProps) {
//   const { id: projectId } = useParams<{ id: string }>();
//   const [books, setBooks] = useState<Book[]>([]);
//   const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
//   const [projectBookIds, setProjectBookIds] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);

//   useEffect(() => {
//     const loadBooks = async () => {
//       try {
//         setLoading(true);
//         const [allBooks, projectBooks] = await Promise.all([
//           fetchAllBooks(),
//           projectId ? fetchProjectBooks(projectId) : Promise.resolve([]),
//         ]);

//         console.log("Fetched all books:", allBooks);
//         console.log("Fetched project books:", projectBooks);

//         const validBooks = allBooks.filter(
//           (book: Book) => book && book._id && typeof book._id === "string"
//         );
//         if (allBooks.length !== validBooks.length) {
//           console.warn("Filtered out invalid books:", allBooks.filter((book: Book) => !validBooks.includes(book)));
//         }
//         setBooks(validBooks);
//         setProjectBookIds(projectBooks.map((book: Book) => book._id));
//       } catch (err: any) {
//         const errorMessage = err.response?.data?.error || err.message || "Failed to load books";
//         setError(errorMessage);
//         console.error("Error fetching books:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadBooks();
//   }, [projectId]);

//   const handleCheckboxChange = (bookId: string, checked: boolean) => {
//     setCheckedBooks((prev) =>
//       checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
//     );
//   };

//   const handleAddToProject = async () => {
//     if (!projectId) {
//       setAlert({
//         variant: "error",
//         title: "No Project Selected",
//         message: "Please select a project to add books to.",
//       });
//       return;
//     }

//     if (checkedBooks.length === 0) {
//       setAlert({
//         variant: "info",
//         title: "No Books Selected",
//         message: "Please select at least one book to add to the project.",
//       });
//       return;
//     }

//     try {
//       await addBooksToProject(projectId, checkedBooks);
//       setProjectBookIds((prev) => [...prev, ...checkedBooks]);
//       setCheckedBooks([]);
//       setAlert({
//         variant: "success",
//         title: "Books Added",
//         message: `${checkedBooks.length} book(s) added to the project successfully.`,
//       });
//     } catch (err: any) {
//       console.error("Error adding books to project:", err);
//       setAlert({
//         variant: "error",
//         title: "Error",
//         message: err.response?.data?.error || "An error occurred while adding books to the project.",
//       });
//     }
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

//   const sortedBooks = useMemo(() => {
//     return [...books].sort((a, b) => {
//       const aChecked = checkedBooks.includes(a._id);
//       const bChecked = checkedBooks.includes(b._id);
//       if (aChecked && !bChecked) return -1;
//       if (!aChecked && bChecked) return 1;
//       const aBookName = a.bookName || "Untitled";
//       const bBookName = b.bookName || "Untitled";
//       return aBookName.localeCompare(bBookName);
//     });
//   }, [books, checkedBooks]);

//   const filteredBooks = useMemo(
//     () =>
//       sortedBooks.filter((book) =>
//         [
//           book.bookName || "",
//           book.author || "",
//           book.edition || "",
//           formatDate(book.createdAt),
//         ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
//       ),
//     [sortedBooks, searchQuery]
//   );

//   if (loading) return <div>Loading books...</div>;
//   if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

//   return (
//     <ComponentCard title="All Books">
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
//                 Book Name
//               </TableCell>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 Author
//               </TableCell>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 Edition
//               </TableCell>
//               <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
//                 Created At
//               </TableCell>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredBooks.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
//                   No books found matching your search
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredBooks.map((book) => (
//                 <TableRow
//                   key={book._id}
//                   className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
//                 >
//                   <TableCell className="p-4">
//                     <td className="p-3">
//                     {
//                       projectBookIds.includes(book._id) ? (
//                       <div title=" Already added to this project" className="cursor-not-allowed opacity-60">
//                         <Checkbox
//                         id={`book-${book._id}`}
//                             checked={true}
//                             disabled={true}
//                             onChange={()=>{ }}
//                         />
//                       </div>
//                       ) : (
//                         <Checkbox
//                         id={`member-${book._id}`}
//                         checked={checkedBooks.includes(book._id)}
//                         onChange={(checked) => handleCheckboxChange(book._id, checked)}
//                         />
//                       )
//                     }
//                     </td>
                    
//                   </TableCell>
//                   <TableCell className="p-4">
//                     <a
//                       href={book.previewUrl || `${API_BASE}/uploads/${book.fileName}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 dark:text-blue-400 hover:underline"
//                     >
//                       {book.bookName || "Untitled"}
//                     </a>
//                   </TableCell>
//                   <TableCell className="p-4">{book.author || "Unknown Author"}</TableCell>
//                   <TableCell className="p-4">{book.edition || "N/A"}</TableCell>
//                   <TableCell className="p-4">{formatDate(book.createdAt)}</TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//         <div className="mt-4 self-end">
//           <Button
//             onClick={handleAddToProject}
//             disabled={checkedBooks.length === 0}
//             variant="primary"
//           >
//             Add Selected to Project
//           </Button>
//         </div>
//       </div>
//     </ComponentCard>
//   );
// }










import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchAllBooks, fetchProjectBooks, addBooksToProject, deleteBook, updateBookVisibility } from "../../services/bookServices";
import Checkbox from "../../components/form/input/Checkbox";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { api as API_BASE } from "../../api/api";

interface Book {
  _id: string;
  bookName: string;
  author?: string;
  edition?: string;
  fileName?: string;
  frontPageImagePath?: string;
  createdAt?: string;
  pages?: number; // New field for number of pages
  visibility?: "public" | "private"; // New field for visibility
}

interface AllBooksProps {
  searchQuery?: string;
  isCentralRepository?: boolean;
}

export default function AllBooks({ searchQuery = "", isCentralRepository = false }: AllBooksProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [checkedBooks, setCheckedBooks] = useState<string[]>([]);
  const [projectBookIds, setProjectBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const [allBooks, projectBooks] = await Promise.all([
          fetchAllBooks(),
          projectId && !isCentralRepository ? fetchProjectBooks(projectId) : Promise.resolve([]),
        ]);

        console.log("Fetched all books:", allBooks);
        console.log("Fetched project books:", projectBooks);

        const validBooks = allBooks.filter(
          (book: Book) => book && book._id && typeof book._id === "string"
        );
        if (allBooks.length !== validBooks.length) {
          console.warn("Filtered out invalid books:", allBooks.filter((book: Book) => !validBooks.includes(book)));
        }
        setBooks(validBooks);
        setProjectBookIds(projectBooks.map((book: Book) => book._id));
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load books";
        setError(errorMessage);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [projectId, isCentralRepository]);

  const handleCheckboxChange = (bookId: string, checked: boolean) => {
    setCheckedBooks((prev) =>
      checked ? [...prev, bookId] : prev.filter((id) => id !== bookId)
    );
  };

  const handleAddToProject = async () => {
    if (!projectId) {
      setAlert({
        variant: "error",
        title: "No Project Selected",
        message: "Please select a project to add books to.",
      });
      return;
    }

    if (checkedBooks.length === 0) {
      setAlert({
        variant: "info",
        title: "No Books Selected",
        message: "Please select at least one book to add to the project.",
      });
      return;
    }

    try {
      await addBooksToProject(projectId, checkedBooks);
      setProjectBookIds((prev) => [...prev, ...checkedBooks]);
      setCheckedBooks([]);
      setAlert({
        variant: "success",
        title: "Books Added",
        message: `${checkedBooks.length} book(s) added to the project successfully.`,
      });
    } catch (err: any) {
      console.error("Error adding books to project:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while adding books to the project.",
      });
    }
  };

  const handleDeleteBooks = async () => {
    if (role !== "book_manager") {
      setAlert({
        variant: "error",
        title: "Unauthorized",
        message: "Only book managers can delete books.",
      });
      return;
    }

    if (checkedBooks.length === 0) {
      setAlert({
        variant: "info",
        title: "No Books Selected",
        message: "Please select at least one book to delete.",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${checkedBooks.length} book(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await Promise.all(checkedBooks.map((bookId) => deleteBook(bookId)));
      setBooks((prev) => prev.filter((book) => !checkedBooks.includes(book._id)));
      setCheckedBooks([]);
      setAlert({
        variant: "success",
        title: "Books Deleted",
        message: `${checkedBooks.length} book(s) deleted successfully.`,
      });
    } catch (err: any) {
      console.error("Error deleting books:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while deleting books.",
      });
    }
  };

  const handleToggleVisibility = async (bookId: string, currentVisibility: "public" | "private") => {
    if (role !== "book_manager") {
      setAlert({
        variant: "error",
        title: "Unauthorized",
        message: "Only book managers can change book visibility.",
      });
      return;
    }

    const newVisibility = currentVisibility === "public" ? "private" : "public";
    try {
      await updateBookVisibility(bookId, newVisibility);
      setBooks((prev) =>
        prev.map((book) =>
          book._id === bookId ? { ...book, visibility: newVisibility } : book
        )
      );
      setAlert({
        variant: "success",
        title: "Visibility Updated",
        message: `Book visibility changed to ${newVisibility}.`,
      });
    } catch (err: any) {
      console.error("Error updating book visibility:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while updating book visibility.",
      });
    }
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

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const aChecked = checkedBooks.includes(a._id);
      const bChecked = checkedBooks.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      const aBookName = a.bookName || "Untitled";
      const bBookName = b.bookName || "Untitled";
      return aBookName.localeCompare(bBookName);
    });
  }, [books, checkedBooks]);

  const filteredBooks = useMemo(
    () =>
      sortedBooks.filter((book) =>
        [
          book.bookName || "",
          book.author || "",
          book.edition || "",
          formatDate(book.createdAt),
          book.pages?.toString() || "",
          book.visibility || "",
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [sortedBooks, searchQuery]
  );

  if (loading) return <div>Loading books...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="All Books">
      <div className="flex flex-col gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}
        <Table className="border-collapse">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Select
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Book Name
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Author
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Edition
              </TableCell>
              <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                Created At
              </TableCell>
              {isCentralRepository && (
                <>
                  <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Pages
                  </TableCell>
                  <TableCell isHeader className="p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Visibility
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isCentralRepository ? 7 : 5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No books found matching your search
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow
                  key={book._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="p-4">
                    <td className="p-3">
                      {isCentralRepository ? (
                        <Checkbox
                          id={`book-${book._id}`}
                          checked={checkedBooks.includes(book._id)}
                          onChange={(checked) => handleCheckboxChange(book._id, checked)}
                          disabled={role !== "book_manager"}
                        />
                      ) : projectBookIds.includes(book._id) ? (
                        <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`book-${book._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => {}}
                          />
                        </div>
                      ) : (
                        <Checkbox
                          id={`book-${book._id}`}
                          checked={checkedBooks.includes(book._id)}
                          onChange={(checked) => handleCheckboxChange(book._id, checked)}
                        />
                      )}
                    </td>
                  </TableCell>
                  <TableCell className="p-4">
                    <a
                      href={book.previewUrl || `${API_BASE}/uploads/${book.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {book.bookName || "Untitled"}
                    </a>
                  </TableCell>
                  <TableCell className="p-4">{book.author || "Unknown Author"}</TableCell>
                  <TableCell className="p-4">{book.edition || "N/A"}</TableCell>
                  <TableCell className="p-4">{formatDate(book.createdAt)}</TableCell>
                  {isCentralRepository && (
                    <>
                      <TableCell className="p-4">{book.pages || "N/A"}</TableCell>
                      <TableCell className="p-4">
                        {role === "book_manager" ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={book.visibility === "public"}
                              onChange={() => handleToggleVisibility(book._id, book.visibility || "private")}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600 dark:peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {book.visibility || "Private"}
                            </span>
                          </label>
                        ) : (
                          <span className="text-sm capitalize">{book.visibility || "Private"}</span>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-4 self-end">
          <Button
            onClick={isCentralRepository ? handleDeleteBooks : handleAddToProject}
            disabled={checkedBooks.length === 0 || (isCentralRepository && role !== "book_manager")}
            variant="primary"
          >
            {isCentralRepository ? "Delete" : "Add Selected to Project"}
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}