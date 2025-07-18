interface ProjectCardProps {
  id: string;
  name: string;
  details?: { label: string; value: string }[];
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ name, details, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Select project ${name}`}
    >
      <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 truncate">
        {name}
      </h3>
      <div className="text-sm space-y-2">
        {details?.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between text-gray-700 dark:text-gray-300"
          >
            <span className="font-medium">{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;