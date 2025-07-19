import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchAllUsers } from "../../services/adminService";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Checkbox from "../../components/form/input/Checkbox";
import { UserCircle } from "lucide-react"; // 👤 Icon

interface Member {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function AllMembers() {
  const { id: projectId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [checkedMembers, setCheckedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const data = await fetchAllUsers();
        setMembers(data); // Optional: filter by isActive or role
      } catch (err) {
        setError("Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  const handleCheckboxChange = (memberId: string, checked: boolean) => {
    setCheckedMembers((prev) =>
      checked ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  };

  const handleAddToProject = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ memberIds: checkedMembers }),
      });

      if (!response.ok) throw new Error("Failed to add members");

      alert("Members added to project successfully.");
      setCheckedMembers([]);
    } catch (err) {
      console.error(err);
      alert("Error adding members to project.");
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    const aChecked = checkedMembers.includes(a._id);
    const bChecked = checkedMembers.includes(b._id);
    if (aChecked && !bChecked) return -1;
    if (!aChecked && bChecked) return 1;
    return (a.fullName || "").localeCompare(b.fullName || "");
  });

  if (loading) return <div>Loading members...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ComponentCard title="All Members">
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
            {sortedMembers.map((member) => (
              <tr key={member._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3">
                  <Checkbox
                    id={`member-${member._id}`}
                    checked={checkedMembers.includes(member._id)}
                    onChange={(checked) => handleCheckboxChange(member._id, checked)}
                  />
                </td>
                <td className="p-3">
                  <UserCircle className="w-6 h-6 text-gray-500" />
                </td>
                <td className="p-3">{member.fullName}</td>
                <td className="p-3">{member.email}</td>
                <td className="p-3 capitalize">{member.role}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-gray-500 text-center">
                  No members available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleAddToProject}
          disabled={checkedMembers.length === 0}
          variant="primary"
        >
          Add Selected to Project
        </Button>
      </div>
    </ComponentCard>
  );
}
