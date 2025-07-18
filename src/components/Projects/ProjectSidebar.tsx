import { FC } from 'react';

interface ProjectSidebarProps {
  selectedOption: string;
  onSelectOption: (option: string) => void;
}

const ProjectSidebar: FC<ProjectSidebarProps> = ({ selectedOption, onSelectOption }) => {
  const options = ['Add Collections', 'Add Books', 'Chatbot', 'Add Members', 'Use Tools'];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg p-4">
      <ul className="space-y-2">
        {options.map((option) => (
          <li
            key={option}
            onClick={() => onSelectOption(option)}
            className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
              selectedOption === option ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d={option === 'Add Collections' ? 'M9 5l7 7-7 7' : 'M10 12a2 2 0 100-4 2 2 0 000 4z'} />
            </svg>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectSidebar;