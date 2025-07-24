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

  if (loading) return <div>Loading project members...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard title="Project Members">
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
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                Select
              </TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                Member Name
              </TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                Email
              </TableCell>
              <TableCell isHeader className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                Role
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No members found for this project
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow
                  key={member._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="p-4">
                    <Checkbox
                      id={`member-${member._id}`}
                      checked={checkedMembers.includes(member._id)}
                      onChange={(checked) => handleCheckboxChange(member._id, checked)}
                      label=""
                    />
                  </TableCell>
                  <TableCell className="p-4">{member.fullName}</TableCell>
                  <TableCell className="p-4">{member.email}</TableCell>
                  <TableCell className="p-4 capitalize">{member.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-4 text-right">
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded transition ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
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
        />
      </div>
    </ComponentCard>
  );
}