import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchAllUsers, addMembersToProject, fetchProjectMembers } from "../../services/adminService";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Checkbox from "../../components/form/input/Checkbox";
import { UserCircle } from "lucide-react";
import Alert from "../../components/ui/alert/Alert";

interface Member {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AllMembersProps {
  searchQuery?: string;
}

export default function AllMembers({ searchQuery = "" }: AllMembersProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ variant: string; title: string; message: string } | null>(null);
  const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const users = await fetchAllUsers();
        const activeUsers = users.filter((user: Member) => user.isActive);
        setMembers(activeUsers);

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

  const filteredMembers = useMemo(
    () =>
      sortedMembers.filter((member) =>
        [
          member.fullName || "",
          member.email || "",
          member.role || "",
          member.isActive ? "active" : "inactive",
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [sortedMembers, searchQuery]
  );

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <ComponentCard
      title={
        <div className="flex justify-between items-center">
          <span>All Members</span>
          <Button
            onClick={handleAddToProject}
            disabled={checkedMembers.length === 0}
            variant="primary"
            className="text-sm py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add Selected to Project
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {alert && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-3">Select</th>
                <th className="p-3">Profile</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3">
                    {projectMemberIds.includes(member._id) ? (
                      <div title="Already added to this project" className="cursor-not-allowed opacity-60">
                        <Checkbox
                          id={`member-${member._id}`}
                          checked={true}
                          disabled={true}
                          onChange={() => {}}
                        />
                      </div>
                    ) : (
                      <Checkbox
                        id={`member-${member._id}`}
                        checked={checkedMembers.includes(member._id)}
                        onChange={(checked) => handleCheckboxChange(member._id, checked)}
                      />
                    )}
                  </td>
                  <td className="p-3">
                    <UserCircle className="w-6 h-6 text-gray-500" />
                  </td>
                  <td className="p-3">{member.fullName}</td>
                  <td className="p-3">{member.email}</td>
                  <td className="p-3 capitalize">{member.role}</td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-gray-500 text-center">
                    No members found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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