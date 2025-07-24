import { useEffect, useState } from 'react';
import ProjectGrid from './Projects/ProjectGrid';
import { fetchMyProjects, updateProject } from '../services/projectService';
import { fetchAllUsers } from '../services/adminService';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import  PageBreadCrumb  from "../components/common/PageBreadCrumb"
import {useAuth} from "../context/AuthProvider"

interface Project {
  _id: string;
  name: string;
  memberIds?: string[];
  collectionIds?: string[];
  bookIds?: string[];
  chatHistoryId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  numMembers?: number;
  numCollections?: number;
  numBooks?: number;
}

interface ProjectListProps {
  onProjectSelect: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const {token} = useAuth();

  const getCurrentUserRole = (): string => {
    return localStorage.getItem('role') || 'guest';
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const role = getCurrentUserRole();
    
      try {
        let projectsData: Project[] = [];
    
        if (role === 'admin') {
          const res = await fetch('/api/projects', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          projectsData = (await res.json()).projects;
        } else if (['project_manager', 'book_manager'].includes(role)) {
          projectsData = await fetchMyProjects();
        } else if (role === 'user') {
          const res = await fetch('/api/projects/user', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          projectsData = (await res.json()).projects;
        }
    
        const users = await fetchAllUsers();
        const userMap = new Map(users.map((u: any) => [u._id, u.fullName]));
    
        projectsData.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const enrichedProjects = projectsData.map((project) => ({
          ...project,
          createdByName: userMap.get(project.createdBy) || 'Unknown',
          numMembers: project.memberIds?.length || 0,
          numCollections: project.collectionIds?.length || 0,
          numBooks: project.bookIds?.length || 0,
        }));
    
        setProjects(enrichedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleProjectSelect = (id: string) => {
    onProjectSelect(id);
    navigate(`/project/${id}`);
  };

  const handleUpdateName = async (id: string, newName: string) => {
    try {
      await updateProject(id, { name: newName });
      setProjects((prev) =>
        prev.map((project) =>
          project._id === id ? { ...project, name: newName } : project
        )
      );
    } catch (err) {
      console.error('Error updating project name:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          All Created Projects
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            aria-label="Search projects"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <PageBreadCrumb pageTitle="Project List" />
      <ProjectGrid 
        projects={filteredProjects} 
        onCardClick={handleProjectSelect} 
        onUpdateName={handleUpdateName}
      />
    </div>
  );
};

export default ProjectList;