import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Checkbox from "../../components/form/input/Checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import Alert from "../../components/ui/alert/Alert";
import { fetchProjectMembers, removeMembersFromProject } from "../../services/adminService";
import ConfirmDialog from "../../components/ui/confirmation/ConfirmDialog";

interface Member {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
}

interface ProjectMembersProps {
  projectId: string;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
  const [initialCheckedMembers, setInitialCheckedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadProjectMembers = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectMembers = await fetchProjectMembers(projectId);
        console.log("Project members:", projectMembers);
        if (projectMembers.length === 0) {
          console.warn(`No members found for projectId: ${projectId}`);
        }
        const ids = projectMembers.map((m: Member) => m._id);
        setMembers(projectMembers);
        setCheckedMembers(ids);
        setInitialCheckedMembers(ids);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load project members";
        setError(errorMessage);
        console.error("Error fetching project members:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProjectMembers();
  }, [projectId]);

  const handleCheckboxChange = (memberId: string, checked: boolean) => {
    setCheckedMembers((prev) =>
      checked ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  };

  const handleSaveChanges = async () => {
    const removed = initialCheckedMembers.filter((id) => !checkedMembers.includes(id));
    if (removed.length === 0) {
      setAlert({
        variant: "info",
        title: "No Changes",
        message: "No members were removed.",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    const removed = initialCheckedMembers.filter((id) => !checkedMembers.includes(id));
    try {
      await removeMembersFromProject(projectId, removed);
      setMembers((prev) => prev.filter((member) => !removed.includes(member._id)));
      setInitialCheckedMembers((prev) => prev.filter((id) => !removed.includes(id)));
      setCheckedMembers((prev) => prev.filter((id) => !removed.includes(id)));
      setAlert({
        variant: "success",
        title: "Members Removed",
        message: `${removed.length} member(s) removed from the project.`,
      });
    } catch (err: any) {
      console.error("Error removing members:", err);
      setAlert({
        variant: "error",
        title: "Error",
        message: err.response?.data?.error || "An error occurred while removing members.",
      });
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const hasChanges =
    checkedMembers.length !== initialCheckedMembers.length ||
    checkedMembers.some((id) => !initialCheckedMembers.includes(id)) ||
    initialCheckedMembers.some((id) => !checkedMembers.includes(id));

  if (loading) return <div className="text-sm sm:text-base text-gray-800 dark:text-gray-100">Loading project members...</div>;
  if (error) return <div className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard
      title={
        <span className="text-xl sm:text-2xl md:text-3xl text-center block text-gray-900 dark:text-gray-100">
          Project Members
        </span>
      }
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            className="text-sm sm:text-base"
          />
        )}

        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto w-full">
          <Table className="table-fixed min-w-full border-collapse text-sm sm:text-base">
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableCell isHeader className="w-16 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Select
                </TableCell>
                <TableCell isHeader className="w-1/3 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Member Name
                </TableCell>
                <TableCell isHeader className="w-1/3 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Email
                </TableCell>
                <TableCell isHeader className="w-1/6 p-2 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Role
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-2 sm:p-4 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    No members found for this project
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow
                    key={member._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className="w-16 p-2 sm:p-4">
                      <Checkbox
                        id={`member-${member._id}`}
                        checked={checkedMembers.includes(member._id)}
                        onChange={(checked) => handleCheckboxChange(member._id, checked)}
                        label=""
                        className="text-gray-700 dark:text-gray-200 scale-100"
                        aria-label={`Select member ${member.fullName || "Unknown"}`}
                      />
                    </TableCell>
                    <TableCell className="w-1/3 p-2 sm:p-4 text-gray-800 dark:text-gray-100">{member.fullName}</TableCell>
                    <TableCell className="w-1/3 p-2 sm:p-4 text-gray-800 dark:text-gray-100">{member.email}</TableCell>
                    <TableCell className="w-1/6 p-2 sm:p-4 text-gray-800 dark:text-gray-100 capitalize">{member.role}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 sm:mt-4 text-right">
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`bg-blue-600 dark:bg-blue-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition text-sm sm:text-base ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-800"
            }`}
          >
            Save Changes
          </button>
        </div>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          message={`Are you sure you want to remove ${initialCheckedMembers.filter(
            (id) => !checkedMembers.includes(id)
          ).length} member(s) from the project?`}
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText="Remove"
          isDestructive={true}
          className="text-sm sm:text-base"
        />
      </div>
    </ComponentCard>
  );
}