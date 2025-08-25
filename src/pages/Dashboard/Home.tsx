import { useEffect, useState } from 'react';
import AppSidebar from '../../layout/AppSidebar';
import PageMeta from '../../components/common/PageMeta';
import ProjectDetailModal from '../../components/Projects/ProjectDetailModal';
import ProjectList from '../../components/ProjectList';
import { fetchProjectById } from '../../services/projectService';
interface Project {
  _id: string;
  name: string;
}

interface ProjectDetails extends Project {
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);

  const handleCardClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const closeModal = () => {
    setSelectedProjectId(null);
    setProjectDetails(null);
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectById(selectedProjectId)
        .then((res) => setProjectDetails(res))
        .catch((err) => console.error("Failed to fetch project details", err));
    }
  }, [selectedProjectId]);

  return (
    <div className="flex bg-gray-200 dark:bg-gray-600 min-h-screen transition-colors duration-300">
      <PageMeta
        title="User Dashboard - HistoAI"
        description="This is a Web application based AI Tool named HistoAI."
      />
      <AppSidebar />
      <div className="flex-1 p-6 rounded-r-xl text-gray-900 dark:text-gray-100">
        <ProjectList onProjectSelect={handleCardClick} />
      </div>

      {projectDetails && (
        <ProjectDetailModal project={projectDetails} onClose={closeModal} />
      )}
    </div>
  );
}
