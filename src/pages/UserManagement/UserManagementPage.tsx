import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchAllUsers, updateUserStatus } from "../../services/adminService";
import UserTable from "../../components/UserTable";
import { toast } from "react-toastify";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();


  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchAllUsers();
      setUsers(result);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
      loadUsers();
    } catch (err) {
      console.error("Status update failed", err);
      toast.error("Failed to update user status");
    }
  };
  
  

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UserTable users={users} onToggleStatus={handleToggleStatus} onRoleChange={loadUsers} />
      )}
    </div>
  );
}
