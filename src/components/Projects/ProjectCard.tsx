import { FC } from 'react';

type ProjectCardProps = {
  id: string;
  name: string;
  onClick: () => void;
};

const ProjectCard: FC<ProjectCardProps> = ({ name, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border p-6 rounded-md shadow hover:bg-blue-50 transition"
    >
      {name}
    </div>
  );
};

export default ProjectCard;
