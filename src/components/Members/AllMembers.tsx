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
    checkedMembers?: string[]; // Controlled checked list (optional)
  setCheckedMembers?: React.Dispatch<React.SetStateAction<string[]>>;
  hideAddButton?: boolean;
  onMembersUpdate?: (members: Member[]) => void;
}

export default function AllMembers({ searchQuery: externalSearchQuery = "" }: AllMembersProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
        const users = await fetchAllUsers();
        const activeUsers = users.filter((user: Member) => user.isActive);
        // Exclude logged-in user, admin, and book_manager roles
        const filteredUsers = activeUsers.filter(
          (user: Member) =>
            user._id !== currentUserId &&
            user.role.toLowerCase() !== "admin" &&
            user.role.toLowerCase() !== "book_manager"
        );
        setMembers(filteredUsers);

        if (projectId) {
          const projectMembers = await fetchProjectMembers(projectId);
          const existingIds = projectMembers.map((m: Member) => m._id);
          setProjectMemberIds(existingIds);
        }
      } catch (err) {
        setError("Failed to load members");
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000); // Clear alert after 5 seconds
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

  if (loading) return (
    <div className="text-gray-600 dark:text-gray-400 text-center p-4">
      Loading members...
    </div>
  );
  if (error) return (
    <Alert
      variant="error"
      title="Error"
      message={error}
    />
  );

  return (
    <ComponentCard
      title={
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            All Members
          </span>
          <Button
            onClick={handleAddToProject}
            disabled={checkedMembers.length === 0}
            variant="primary"
            className="text-sm py-1 px-3 bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 text-white rounded-lg"
          >
            Add Selected to Project
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}
        <div className="relative max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <Table className="border-collapse min-w-[600px]">
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 w-16">
                  Select
                </TableCell>
                <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 w-16">
                  Profile
                </TableCell>
                <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                  Full Name
                </TableCell>
                <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                  Email
                </TableCell>
                <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[100px]">
                  Role
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                sortedMembers.map((member) => (
                  <TableRow
                    key={member._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className="p-4">
                      {projectMemberIds.includes(member._id) ? (
                        <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                          <Checkbox
                            id={`member-${member._id}`}
                            checked={true}
                            disabled={true}
                            onChange={() => {}}
                            label=""
                            className="text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      ) : (
                        <Checkbox
                          id={`member-${member._id}`}
                          checked={checkedMembers.includes(member._id)}
                          onChange={(checked) => handleCheckboxChange(member._id, checked)}
                          label=""
                          className="text-gray-900 dark:text-gray-100"
                        />
                      )}
                    </TableCell>
                    <TableCell className="p-4">
                      <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </TableCell>
                    <TableCell className="p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                      {member.fullName || "Unnamed"}
                    </TableCell>
                    <TableCell className="p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                      {member.email}
                    </TableCell>
                    <TableCell className="p-4 text-gray-900 dark:text-gray-100 capitalize">
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
        />
      </div>
    </ComponentCard>
  );
}


