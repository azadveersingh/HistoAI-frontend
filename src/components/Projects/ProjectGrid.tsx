import { FC } from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  _id: string;
  name: string;
}

type ProjectGridProps = {
  projects: Project[];
  onCardClick: (id: string) => void;
};

const ProjectGrid: FC<ProjectGridProps> = ({ projects, onCardClick }) => {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          id={project._id}
          name={project.name}
          onClick={() => onCardClick(project._id)}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
