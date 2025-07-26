import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppSidebar from "../../layout/AppSidebar";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";
import AllMembers from "./AllMembers";

export default function AddMembersToProject() {
  const { id: projectId } = useParams<{ id: string }>();
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSuccess = () => {
    toast.success("Members added to project!");
    navigate("/dashboard", { state: { projectId, memberIds } });
  };

  return (
    <>
      <PageMeta
        title="Add Members to Project | TailAdmin"
        description="Add members to an existing project"
      />
      <AppSidebar />
      <PageBreadcrumb pageTitle="Add Members to Project" />

      <div className="mx-auto max-w-full space-y-6 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow rounded-lg">
        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
          />
        )}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-lg">
          <AllMembers
            searchQuery={searchQuery}
            checkedMembers={memberIds}
            setCheckedMembers={setMemberIds}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </>
  );
}