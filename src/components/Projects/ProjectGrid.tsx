import { FC } from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  _id: string;
  name: string;
  [key: string]: any;
}

type ProjectGridProps = {
  projects: Project[];
  onCardClick: (id: string) => void;
};

const formatProjectDetails = (project: Project) => {
  return [
    {
      label: 'Project Manager',
      value: project.createdByName || '—',
    },
    {
      label: 'Collections',
      value: project.numCollections?.toString() || '0',
    },
    {
      label: 'Books',
      value: project.numBooks?.toString() || '0',
    },
    {
      label: 'Members',
      value: project.numMembers?.toString() || '0',
    },
    {
      label: 'Created',
      value: new Date(project.createdAt).toLocaleDateString(),
    },
  ];
};

const ProjectGrid: FC<ProjectGridProps> = ({ projects, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard
            key={project._id}
            id={project._id}
            name={project.name}
            details={formatProjectDetails(project)}
            onClick={() => onCardClick(project._id)}
          />
        ))
      ) : (
        <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
          No projects found.
        </div>
      )}
    </div>
  );
};

export default ProjectGrid;