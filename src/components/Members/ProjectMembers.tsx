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

interface Member {
  _id: string;
  name: string;
  role: string;
  projectId?: string;
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
  const [alert, setAlert] = useState<{ variant: any; title: string; message: string } | null>(null);

  useEffect(() => {
    const loadProjectMembers = async () => {
      try {
        setLoading(true);
        // Replace with actual API call to fetch members for the project
        const data: Member[] = []; // Placeholder: fetch members from API
        const projectMembers = data.filter((member) => member.projectId === projectId);
        const ids = projectMembers.map((m) => m._id);
        setMembers(projectMembers);
        setCheckedMembers(ids);
        setInitialCheckedMembers(ids); // Save initial for diff comparison
      } catch (err) {
        console.error(err);
        setError("Failed to load project members");
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
    const removed = initialCheckedMembers.filter(
      (id) => !checkedMembers.includes(id)
    );

    if (removed.length === 0) {
      setAlert({
        variant: "info",
        title: "No Changes",
        message: "No members were removed.",
      });
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to remove ${removed.length} member(s) from the project?`
    );

    if (!confirm) return;

    try {
      for (const memberId of removed) {
        const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to remove member");
      }

      setMembers((prev) => prev.filter((member) => !removed.includes(member._id)));
      setInitialCheckedMembers((prev) => prev.filter((id) => !removed.includes(id)));
      setCheckedMembers((prev) => prev.filter((id) => !removed.includes(id)));

      setAlert({
        variant: "success",
        title: "Members Removed",
        message: `${removed.length} member(s) removed from the project.`,
      });
    } catch (err) {
      console.error(err);
      setAlert({
        variant: "error",
        title: "Error",
        message: "An error occurred while removing members.",
      });
    }
  };

  // Check if there are any changes by comparing checkedMembers with initialCheckedMembers
  const hasChanges = checkedMembers.length !== initialCheckedMembers.length ||
    checkedMembers.some((id) => !initialCheckedMembers.includes(id)) ||
    initialCheckedMembers.some((id) => !checkedMembers.includes(id));

  if (loading) return <div>Loading project members...</div>;
  if (error) return <div>{error}</div>;

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
                Role
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
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
                <TableCell className="p-4">{member.name}</TableCell>
                <TableCell className="p-4">{member.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {members.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No members added to this project
          </div>
        )}

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
      </div>
    </ComponentCard>
  );
}