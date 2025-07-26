import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AppSidebar from "../layout/AppSidebar";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Alert from "../components/ui/alert/Alert";
import ComponentCard from "../components/common/ComponentCard";
import { createProject } from "../services/projectService";
import { fetchAllUsers } from "../services/adminService";
import Checkbox from "../components/form/input/Checkbox";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../components/ui/table";
import { UserCircle } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function CreateProjectPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all users for member selection
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const users = await fetchAllUsers();
        const activeUsers = users.filter((user: User) => user.isActive);
        // Exclude admin and book_manager roles
        const filteredUsers = activeUsers.filter(
          (user: User) =>
            user.role.toLowerCase() !== "admin" &&
            user.role.toLowerCase() !== "book_manager"
        );
        setMembers(filteredUsers);
      } catch (err) {
        setError("Failed to load members");
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
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
      setIsSubmitting(true);
      const payload = {
        name,
        memberIds,
        collectionIds: [],
        bookIds: [],
      };
      console.log("Creating project with payload:", payload);
      const res = await createProject(payload);
      console.log("Create project response:", res);
      setName("");
      setMemberIds([]);
      setSearchQuery("");
      setShowSuccessAlert(true);
      toast.success("Project Created!");
      const projectId = res.projectId || res._id;
      console.log("Navigating to dashboard with state:", { projectId, memberIds });
      navigate("/dashboard", {
        state: {
          projectId,
          memberIds,
        },
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to create project";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aChecked = memberIds.includes(a._id);
      const bChecked = memberIds.includes(b._id);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [members, memberIds]);

  const filteredMembers = useMemo(
    () =>
      sortedMembers.filter((member) =>
        [
          member.fullName || "",
          member.email || "",
          member.role || "",
        ].some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [sortedMembers, searchQuery]
  );

  const isCreateButtonDisabled = !name.trim() || memberIds.length === 0 || isSubmitting;

  if (loading) return (
    <div className="text-gray-600 dark:text-gray-400 text-center p-4">
      Loading members...
    </div>
  );

  if (error && !members.length) {
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

      <ComponentCard title="Create New Project">
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          {(showSuccessAlert || error) && (
            <Alert
              variant={showSuccessAlert ? "success" : "error"}
              title={showSuccessAlert ? "Project Created" : "Error"}
              message={
                showSuccessAlert ? "Your project has been created successfully." : error
              }
            />
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="w-full sm:max-w-md space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-gray-700 dark:text-gray-200">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:focus:ring-brand-400"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isCreateButtonDisabled}
                variant="primary"
                className="w-full sm:w-40 h-11 rounded-lg bg-brand-500 text-white font-medium text-sm transition-colors hover:bg-brand-600 dark:hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Select Members
                </h3>
                <div className="w-full sm:w-64">
                  <Label htmlFor="search-members" className="text-gray-700 dark:text-gray-200">
                    Search Members
                  </Label>
                  <Input
                    id="search-members"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:focus:ring-brand-400"
                  />
                </div>
              </div>
              <div className="relative overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                <Table className="border-collapse w-full min-w-[600px]">
                  <TableHeader className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                    <TableRow>
                      <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 w-16">
                        Select
                      </TableCell>
                      <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 w-16">
                        Profile
                      </TableCell>
                      <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                        Full Name
                      </TableCell>
                      <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[150px]">
                        Email
                      </TableCell>
                      <TableCell isHeader className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-200 min-w-[100px]">
                        Role
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400">
                          No members found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow
                          key={member._id}
                          className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <TableCell className="p-3 sm:p-4">
                            <Checkbox
                              id={`member-${member._id}`}
                              checked={memberIds.includes(member._id)}
                              onChange={(checked) => handleCheckboxChange(member._id, checked)}
                              label=""
                              className="text-gray-900 dark:text-gray-100"
                            />
                          </TableCell>
                          <TableCell className="p-3 sm:p-4">
                            <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                          </TableCell>
                          <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                            {member.fullName || "Unnamed"}
                          </TableCell>
                          <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                            {member.email}
                          </TableCell>
                          <TableCell className="p-3 sm:p-4 text-gray-900 dark:text-gray-100 capitalize">
                            {member.role}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </form>
        </div>
      </ComponentCard>
    </>
  );
}