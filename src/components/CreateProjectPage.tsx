import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

import AppSidebar from "../layout/AppSidebar";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Checkbox from "../components/form/input/Checkbox";
import Alert from "../components/ui/alert/Alert";
import { fetchAllUsers } from "../services/adminService";
import { createProject } from "../services/projectService";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userList = await fetchAllUsers();
        const activeUsers = userList.filter((user: User) => user.isActive);
        setUsers(activeUsers);
      } catch (err) {
        setError("Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000); // Hide success alert after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // Clear error after 5 seconds
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCheckboxChange = (memberId: string, checked: boolean) => {
    setMemberIds((prev) =>
      checked ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      toast.error("Project name is required");
      return;
    }

    if (memberIds.length === 0) {
      setError("Please select at least one member");
      toast.error("Please select at least one member");
      return;
    }

    try {
      const payload = {
        name,
        memberIds,
        collectionIds: [],
        bookIds: [],
      };
      const res = await createProject(payload);
      setName("");
      setMemberIds([]);
      setSearchQuery("");
      setShowSuccessAlert(true);
      toast.success("Project Created!");
      const projectId = res.projectId || res._id;
      navigate("/dashboard", {
        state: {
          projectId,
          memberIds,
        },
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Failed to create project";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const sortedMembers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aChecked = memberIds.includes(a._id);
      const bChecked = memberIds.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [users, memberIds]);

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

  const selectedMembers = useMemo(
    () => users.filter((user) => memberIds.includes(user._id)),
    [users, memberIds]
  );

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 200; // Pixels to scroll
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const isCreateButtonDisabled = !name.trim() || memberIds.length === 0;

  if (loading) return (
    <div className="text-gray-600 dark:text-gray-400 text-center p-4 sm:p-6">
      Loading users...
    </div>
  );
  if (error && !users.length) {
    return (
      <Alert
        variant="error"
        title="Error"
        message={error}
      />
    );
  }

  return (
    <>
      <PageMeta
        title="Create Project | TailAdmin"
        description="Create new project page"
      />
      <AppSidebar />
      <PageBreadcrumb pageTitle="Create Project" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-full space-y-6 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow rounded-lg"
      >
        {(showSuccessAlert || error) && (
          <Alert
            variant={showSuccessAlert ? "success" : "error"}
            title={showSuccessAlert ? "Project Created" : "Error"}
            message={
              showSuccessAlert ? "Your project has been created successfully." : error
            }
          />
        )}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="w-full sm:max-w-md">
            <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
              Project Name
            </label>
            <Input
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:focus:ring-brand-400"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isCreateButtonDisabled}
            className="w-full sm:w-40 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium text-sm transition-colors hover:bg-brand-600 dark:hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </Button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Select Members
            </h3>
            <div className="w-full sm:w-64">
              <label className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
                Search Members
              </label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:focus:ring-brand-400"
              />
            </div>
          </div>
          <div className="relative overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="min-w-full border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-200 w-16">Select</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-200 w-16">Profile</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">Full Name</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">Email</th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[100px]">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400">
                      No members found matching your search
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member._id}
                      className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-3 sm:p-4">
                        <Checkbox
                          id={`member-${member._id}`}
                          checked={memberIds.includes(member._id)}
                          onChange={(checked) => handleCheckboxChange(member._id, checked)}
                          label=""
                          className="text-gray-900 dark:text-gray-100"
                        />
                      </td>
                      <td className="p-3 sm:p-4">
                        <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </td>
                      <td className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                        {member.fullName || "Unnamed"}
                      </td>
                      <td className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                        {member.email}
                      </td>
                      <td className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 capitalize">
                        {member.role}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedMembers.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Selected Members
            </h3>
            <div className="relative flex items-center">
              <button
                onClick={() => scrollSlider("left")}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
                disabled={selectedMembers.length <= 3}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div
                ref={sliderRef}
                className="flex overflow-x-auto space-x-4 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
              >
                {selectedMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex-none w-48 bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {member.fullName || "Unnamed"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollSlider("right")}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
                disabled={selectedMembers.length <= 3}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
