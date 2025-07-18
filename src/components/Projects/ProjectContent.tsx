import { FC } from 'react';

interface ProjectContentProps {
  selectedOption: string;
}

const ProjectContent: FC<ProjectContentProps> = ({ selectedOption }) => {
  const [activeTab, setActiveTab] = useState<'Details' | 'Tasks'>('Details');

  const renderContent = () => {
    switch (selectedOption) {
      case 'Add Collections':
        return activeTab === 'Details' ? (
          <div>Form to add collections (e.g., name, description).</div>
        ) : (
          <div>Task list for adding collections (e.g., pending, completed).</div>
        );
      case 'Add Books':
        return activeTab === 'Details' ? (
          <div>Form to add books (e.g., title, author).</div>
        ) : (
          <div>Task list for adding books (e.g., pending, completed).</div>
        );
      case 'Chatbot':
        return activeTab === 'Details' ? (
          <div>Chatbot interface or configuration settings.</div>
        ) : (
          <div>Task list for chatbot interactions (e.g., pending chats).</div>
        );
      case 'Add Members':
        return activeTab === 'Details' ? (
          <div>Form to add members (e.g., name, role).</div>
        ) : (
          <div>Task list for adding members (e.g., pending invitations).</div>
        );
      case 'Use Tools':
        return activeTab === 'Details' ? (
          <div>Tool selection interface (e.g., analytics, editor).</div>
        ) : (
          <div>Task list for tool usage (e.g., pending tasks).</div>
        );
      default:
        return <div>Select an option to see content.</div>;
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('Details')}
          className={`px-4 py-2 ${activeTab === 'Details' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('Tasks')}
          className={`px-4 py-2 ${activeTab === 'Tasks' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}
        >
          Tasks
        </button>
      </div>
      <div className="min-h-[calc(100vh-200px)]">{renderContent()}</div>
    </div>
  );
};

export default ProjectContent;