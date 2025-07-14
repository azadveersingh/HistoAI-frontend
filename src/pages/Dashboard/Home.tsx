import { useEffect, useState } from 'react';
import AppSidebar from '../../layout/AppSidebar';
import ProjectGrid from '../../components/Projects/ProjectGrid';
import axios from 'axios';
import PageMeta from '../../components/common/PageMeta';
import ProjectDetailModal from '../../components/Projects/ProjectDetailModal';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
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
      axios
        .get(`/api/projects/${selectedProjectId}`)
        .then((res) => setProjectDetails(res.data))
        .catch((err) => console.error("Failed to fetch project details", err));
    }
  }, [selectedProjectId]);

  useEffect(() => {
    axios
      .get('/api/projects')
      .then((res) => setProjects(res.data.projects))
      .catch((err) => console.error(err));
  }, []);

  const filtered = Array.isArray(projects)
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="flex bg-blue-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <PageMeta
        title="User Dashboard - HistoAI"
        description="This is a Web application based AI Tool named HistoAI."
      />
      <AppSidebar />
      <div className="flex-1 p-6 rounded-r-xl text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold bg-red-200 dark:bg-red-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded">
            Projects
          </h2>
          <input
            type="text"
            placeholder="Search project"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-md shadow"
          />
        </div>
        <ProjectGrid projects={filtered} onCardClick={handleCardClick} />
      </div>

      {projectDetails && (
        <ProjectDetailModal project={projectDetails} onClose={closeModal} />
      )}
    </div>
  );
}
