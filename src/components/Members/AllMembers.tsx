// import { useState, useEffect, useMemo } from "react";
// import { useParams } from "react-router-dom";
// import { fetchAllUsers, addMembersToProject, fetchProjectMembers } from "../../services/adminService";
// import ComponentCard from "../../components/common/ComponentCard";
// import Button from "../../components/ui/button/Button";
// import Checkbox from "../../components/form/input/Checkbox";
// import { UserCircle } from "lucide-react";
// import Alert from "../../components/ui/alert/Alert";
// import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
// } from "../../components/ui/table";

// interface Member {
//   _id: string;
//   fullName: string;
//   email: string;
//   role: string;
//   isActive: boolean;
// }

// interface AllMembersProps {
//   searchQuery?: string;
//     checkedMembers?: string[]; // Controlled checked list (optional)
//   setCheckedMembers?: React.Dispatch<React.SetStateAction<string[]>>;
//   hideAddButton?: boolean;
//   onMembersUpdate?: (members: Member[]) => void;
// }

// export default function AllMembers({ searchQuery: externalSearchQuery = "" }: AllMembersProps) {
//   const { id: projectId } = useParams<{ id: string }>();
//   const [members, setMembers] = useState<Member[]>([]);
//   const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
//   const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);

//   // Decode JWT token to get user ID
//   const getCurrentUserId = () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return null;
//       const payload = JSON.parse(atob(token.split(".")[1]));
//       return payload.sub || null;
//     } catch (err) {
//       console.error("Error decoding token:", err);
//       return null;
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         const currentUserId = getCurrentUserId();
//         const users = await fetchAllUsers();
//         const activeUsers = users.filter((user: Member) => user.isActive);
//         // Exclude logged-in user, admin, and book_manager roles
//         const filteredUsers = activeUsers.filter(
//           (user: Member) =>
//           {return typeof user.role === "string" &&
//             user._id !== currentUserId &&
//             user.role.toLowerCase() !== "admin" &&
//             user.role.toLowerCase() !== "book_manager"
//       });
//         setMembers(filteredUsers);

//         if (projectId) {
//           const projectMembers = await fetchProjectMembers(projectId);
//           const existingIds = projectMembers.map((m: Member) => m._id);
//           setProjectMemberIds(existingIds);
//         }
//       } catch (err) {
//         setError("Failed to load members");
//         console.error("Error fetching members:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [projectId]);

//   useEffect(() => {
//     if (alert) {
//       const timer = setTimeout(() => {
//         setAlert(null);
//       }, 5000); // Clear alert after 5 seconds
//       return () => clearTimeout(timer);
//     }
//   }, [alert]);

//   const handleCheckboxChange = (memberId: string, checked: boolean) => {
//     setCheckedMembers((prev) =>
//       checked ? [...prev, memberId] : prev.filter((id) => id !== memberId)
//     );
//   };

//   const handleAddToProject = async () => {
//     if (!projectId) {
//       setAlert({
//         variant: "error",
//         title: "Error",
//         message: "No project selected.",
//       });
//       return;
//     }

//     if (checkedMembers.length === 0) {
//       setAlert({
//         variant: "info",
//         title: "No Selection",
//         message: "Please select at least one member to add.",
//       });
//       return;
//     }

//     setShowConfirmDialog(true);
//   };

//   const handleConfirmAdd = async () => {
//     try {
//       await addMembersToProject(projectId!, checkedMembers);
//       setProjectMemberIds((prev) => [...prev, ...checkedMembers]);
//       setCheckedMembers([]);
//       setAlert({
//         variant: "success",
//         title: "Success",
//         message: `${checkedMembers.length} member(s) added to the project.`,
//       });
//     } catch (err: any) {
//       console.error("Error adding members:", err);
//       setAlert({
//         variant: "error",
//         title: "Error",
//         message: err.response?.data?.error || "Failed to add members to project.",
//       });
//     } finally {
//       setShowConfirmDialog(false);
//     }
//   };

//   const sortedMembers = useMemo(() => {
//     return [...members].sort((a, b) => {
//       const aChecked = checkedMembers.includes(a._id);
//       const bChecked = checkedMembers.includes(b._id);
//       if (aChecked && !bChecked) return -1;
//       if (!aChecked && bChecked) return 1;
//       return (a.fullName || "").localeCompare(b.fullName || "");
//     });
//   }, [members, checkedMembers]);

//   if (loading) return (
//     <div className="text-gray-600 dark:text-gray-400 text-center p-4">
//       Loading members...
//     </div>
//   );
//   if (error) return (
//     <Alert
//       variant="error"
//       title="Error"
//       message={error}
//     />
//   );

//   return (
//     <ComponentCard
//       title={
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
//           <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
//             All Members
//           </span>
//           <Button
//             onClick={handleAddToProject}
//             disabled={checkedMembers.length === 0}
//             variant="primary"
//             className="text-sm py-1 px-3 bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 text-white rounded-lg"
//           >
//             Add Selected to Project
//           </Button>
//         </div>
//       }
//     >
//       <div className="flex flex-col gap-4 p-4">
//         {alert && (
//           <Alert
//             variant={alert.variant}
//             title={alert.title}
//             message={alert.message}
//           />
//         )}
//         <div className="relative max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
//           <Table className="border-collapse min-w-[600px]">
//             <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
//               <TableRow>
//                 <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 w-16">
//                   Select
//                 </TableCell>
//                 <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 w-16">
//                   Profile
//                 </TableCell>
//                 <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
//                   Full Name
//                 </TableCell>
//                 <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
//                   Email
//                 </TableCell>
//                 <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[100px]">
//                   Role
//                 </TableCell>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {sortedMembers.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
//                     No members found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 sortedMembers.map((member) => (
//                   <TableRow
//                     key={member._id}
//                     className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
//                   >
//                     <TableCell className="p-4">
//                       {projectMemberIds.includes(member._id) ? (
//                         <div title="Already added to this project" className="cursor-not-allowed opacity-60">
//                           <Checkbox
//                             id={`member-${member._id}`}
//                             checked={true}
//                             disabled={true}
//                             onChange={() => {}}
//                             label=""
//                             className="text-gray-900 dark:text-gray-100"
//                           />
//                         </div>
//                       ) : (
//                         <Checkbox
//                           id={`member-${member._id}`}
//                           checked={checkedMembers.includes(member._id)}
//                           onChange={(checked) => handleCheckboxChange(member._id, checked)}
//                           label=""
//                           className="text-gray-900 dark:text-gray-100"
//                         />
//                       )}
//                     </TableCell>
//                     <TableCell className="p-4">
//                       <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
//                     </TableCell>
//                     <TableCell className="p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
//                       {member.fullName || "Unnamed"}
//                     </TableCell>
//                     <TableCell className="p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
//                       {member.email}
//                     </TableCell>
//                     <TableCell className="p-4 text-gray-900 dark:text-gray-100 capitalize">
//                       {member.role}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//         <ConfirmDialog
//           isOpen={showConfirmDialog}
//           message={`Are you sure you want to add ${checkedMembers.length} member(s) to the project?`}
//           onConfirm={handleConfirmAdd}
//           onCancel={() => setShowConfirmDialog(false)}
//           confirmText="Add"
//           isDestructive={false}
//         />
//       </div>
//     </ComponentCard>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchAllUsers, addMembersToProject, fetchProjectMembers } from "../../services/adminService";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Checkbox from "../../components/form/input/Checkbox";
import { UserCircle } from "lucide-react";
import Alert from "../../components/ui/alert/Alert";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

interface Member {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AllMembersProps {
  searchQuery?: string;
  checkedMembers?: string[];
  setCheckedMembers?: React.Dispatch<React.SetStateAction<string[]>>;
  hideAddButton?: boolean;
  onMembersUpdate?: (members: Member[]) => void;
}

export default function AllMembers({
  searchQuery: externalSearchQuery = "",
  checkedMembers: controlledCheckedMembers,
  setCheckedMembers: controlledSetCheckedMembers,
  hideAddButton = false,
  onMembersUpdate,
}: AllMembersProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [internalCheckedMembers, setInternalCheckedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Use controlled or internal checkedMembers state
  const checkedMembers = controlledCheckedMembers !== undefined ? controlledCheckedMembers : internalCheckedMembers;
  const setCheckedMembers = controlledSetCheckedMembers !== undefined ? controlledSetCheckedMembers : setInternalCheckedMembers;

  // Decode JWT token to get user ID
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || null;
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUserId = getCurrentUserId();
        console.log("JWT token:", localStorage.getItem("token"));
        console.log("Current user ID:", currentUserId);
        const users = await fetchAllUsers();
        console.log("Fetched users:", users);
        const activeUsers = users.filter((user: Member) => user.isActive);
        console.log("Active users:", activeUsers);
        const filteredUsers = activeUsers.filter(
          (user: Member) =>
            typeof user.role === "string" &&
            user._id !== currentUserId &&
            user.role.toLowerCase() !== "admin" &&
            user.role.toLowerCase() !== "book_manager"
        );
        console.log("Filtered users:", filteredUsers);
        setMembers(filteredUsers);

        if (projectId) {
          const projectMembers = await fetchProjectMembers(projectId);
          console.log("Project members:", projectMembers);
          const existingIds = projectMembers.map((m: Member) => m._id);
          setProjectMemberIds(existingIds);
        }

        if (onMembersUpdate) {
          onMembersUpdate(filteredUsers);
        }
      } catch (err) {
        setError("Failed to load members");
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, onMembersUpdate]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleCheckboxChange = (memberId: string, checked: boolean) => {
    setCheckedMembers((prev) =>
      checked ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  };

  const handleAddToProject = async () => {
    if (!projectId) {
      setAlert({
        variant: "error",
        title: "Error",
        message: "No project selected.",
      });
      return;
    }

    if (checkedMembers.length === 0) {
      setAlert({
        variant: "info",
        title: "No Selection",
        message: "Please select at least one member to add.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmAdd = async () => {
    try {
      await addMembersToProject(projectId!, checkedMembers);
      setProjectMemberIds((prev) => [...prev, ...checkedMembers]);
      setCheckedMembers([]);
      setAlert({
        variant: "success",
        title: "Success",
        message: `${checkedMembers.length} member(s) added to the project.`,
      });
    } catch (err: any) {
      console.error("Error adding members:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "Failed to add members to project.",
      });
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aChecked = checkedMembers.includes(a._id);
      const bChecked = checkedMembers.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [members, checkedMembers]);

  const filteredMembers = useMemo(() => {
    if (!externalSearchQuery) return sortedMembers;
    return sortedMembers.filter((member) =>
      [
        member.fullName || "",
        member.email || "",
        member.role || "",
      ].some((field) => field.toLowerCase().includes(externalSearchQuery.toLowerCase()))
    );
  }, [sortedMembers, externalSearchQuery]);

  if (loading) return (
    <div className="text-sm sm:text-base text-gray-800 dark:text-gray-100 text-center p-2 sm:p-4">
      Loading members...
    </div>
  );
  if (error) return (
    <Alert
      variant="error"
      title="Error"
      message={error}
      className="text-sm sm:text-base p-2 sm:p-4"
    />
  );

  return (
    <ComponentCard
      title={
        hideAddButton ? (
          <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
            All Members
          </span>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full gap-2 sm:gap-4">
            <div className="flex-1 text-center">
              <span className="text-xl sm:text-2xl md:text-3xl text-gray-900 dark:text-gray-100">
                All Members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddToProject}
                disabled={checkedMembers.length === 0 || !projectId}
                variant="primary"
                title={checkedMembers.length === 0 ? "Select at least one member to add" : ""}
                className="text-xs sm:text-sm py-1 px-2 sm:px-3 bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white rounded-md"
              >
                Add Selected to Project
              </Button>
            </div>
          </div>
        )
      }
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            className="text-sm sm:text-base p-2 sm:p-4"
          />
        )}
        <div className="max-h-[77vh] overflow-y-auto overflow-x-auto w-full">
          <Table className="table-fixed min-w-full border-collapse text-sm sm:text-base">
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className="w-1/5 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Select
                </TableCell>
                <TableCell isHeader className="w-1/5 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Profile
                </TableCell>
                <TableCell isHeader className="w-1/5 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                  Full Name
                </TableCell>
                <TableCell isHeader className="w-1/5 p-2 sm:p-4 text-left tfont-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                  Email
                </TableCell>
                <TableCell isHeader className="w-1/5 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[100px]">
                  Role
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-2 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    No members found{externalSearchQuery ? " matching your search" : ""}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow
                    key={member._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className="w-16 p-2 sm:p-4">
                      {projectMemberIds.includes(member._id) ? (
                        <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`member-${member._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => {}}
                            label=""
                            className="text-gray-800 dark:text-gray-100 scale-100"
                            aria-label={`Member ${member.fullName || "Unknown"} already in project`}
                          />
                        </div>
                      ) : (
                        <Checkbox
                          id={`member-${member._id}`}
                          checked={checkedMembers.includes(member._id)}
                          onChange={(checked) => handleCheckboxChange(member._id, checked)}
                          label=""
                          className="text-gray-800 dark:text-gray-100 scale-100"
                          aria-label={`Select member ${member.fullName || "Unknown"}`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="w-16 p-2 sm:p-4">
                      <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-gray-800 dark:text-gray-100 truncate max-w-[150px]">
                      {member.fullName || "Unnamed"}
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-gray-800 dark:text-gray-100 truncate max-w-[150px]">
                      {member.email}
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-gray-800 dark:text-gray-100 capitalize">
                      {member.role}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={`Are you sure you want to add ${checkedMembers.length} member(s) to the project?`}
          onConfirm={handleConfirmAdd}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText="Add"
          isDestructive={false}
          className="text-sm sm:text-base"
        />
      </div>
    </ComponentCard>
  );
}
