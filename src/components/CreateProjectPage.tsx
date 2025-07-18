import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppSidebar from "../layout/AppSidebar";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Select from "../components/form/form-elements/SelectInputs";
import TextArea from "../components/form/form-elements/TextAreaInput";

import { createProject } from "../services/projectService";
import { fetchAllUsers } from "../services/adminService";

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  // const [memberIds, setMemberIds] = useState<string[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user list for member selection
    const loadUsers = async () => {
      try {
        const userList = await fetchAllUsers(); 
        setUsers(userList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const payload = {
        name,
        // memberIds,
        collectionIds: [],
        bookIds: [],
      };
      const res = await createProject(payload);
      console.log("Response : ",res)
      toast.success("Project Created!");
      const projectId = res.projectId || res._id; 
      navigate("/collections/create",{
        state:{
          projectId,
          // memberIds,
        },
    });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create project");
    }
  };

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
        className="mx-auto max-w-3xl space-y-6 bg-white p-6 shadow rounded-lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Project Name
            </label>
            <Input
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* <div>
            <label className="mb-1 block font-medium text-gray-700">
              Add Members
            </label>
            <select
              multiple
              value={memberIds}
              onChange={(e) =>
                setMemberIds(
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.fullName || "Unnamed"}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        <div className="pt-4">
          <Button type="submit" variant="primary" size="md">
            Create Project
          </Button>
        </div>
      </form>
    </>
  );
}
