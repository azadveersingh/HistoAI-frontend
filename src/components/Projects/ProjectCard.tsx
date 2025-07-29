import { FC } from 'react';

interface ProjectCardProps {
  id: string;
  name: string;
  details?: { label: string; value: string }[];
  onClick: () => void;
}

const ProjectCard: FC<ProjectCardProps> = ({ id, name, details, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Select project ${name}`}
    >
      <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-400 truncate mb-2">
        {name}
      </h3>
      <div className="text-xs space-y-1">
        {details?.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between text-gray-600 dark:text-gray-300"
          >
            <span className="font-medium">{item.label}:</span>
            <span className="truncate">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;