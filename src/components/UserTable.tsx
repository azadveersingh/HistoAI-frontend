import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table/index";
import Badge from "../components/ui/badge/Badge";
import { changeUserRole } from "../services/adminService";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { useState } from "react";
import { toast } from "react-toastify";

const roles = ["user", "project_manager", "book_manager"];


type User = {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
  isActive: boolean;
};

interface Props {
  users: User[];
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onRoleChange: () => void;
}

export default function UserTable({ users, onToggleStatus, onRoleChange }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Role
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="px-5 py-4 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {user.fullName || user.name}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {user.email}
                </TableCell>

                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400 relative">
                  <div className="relative inline-block">
                    <button
                      className="dropdown-toggle text-sm text-blue-600 underline"
                      onClick={() => setOpenDropdown(user._id)}
                    >
                      {user.role}
                    </button>
                    <Dropdown isOpen={openDropdown === user._id} onClose={() => setOpenDropdown(null)}>
                      {roles
                        .filter((role) => role !== user.role)
                        .map((roleOption) => (
                          <DropdownItem
                            key={roleOption}
                            onClick={async () => {
                              try {
                                const res = await changeUserRole(user._id, roleOption);
                                
                                if (res?.message === "User role updated successfully") {
                                  toast.success(`Role updated to ${roleOption}`);
                                  onRoleChange();
                                } else {
                                  console.error("Unexpected response:", res);
                                  toast.error("Unexpected response received.");
                                }
                            
                              } catch (err: any) {
                                console.error("Caught error during role change:", err);
                                toast.error("Failed to change role");
                              } finally {
                                setOpenDropdown(null);
                              }
                            }}
                          >
                            {roleOption.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </DropdownItem>
                        ))}
                    </Dropdown>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge
                    size="sm"
                    color={
                      user.isActive
                        ? "success"
                        : "error"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <button
                    onClick={() => onToggleStatus(user._id, user.isActive)}
                    className={`px-3 py-1 rounded text-white text-sm ${user.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                      }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
