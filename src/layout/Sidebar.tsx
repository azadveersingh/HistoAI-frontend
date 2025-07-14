import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-1/5 bg-blue-100 h-screen p-4 rounded-l-xl shadow">
      <div className="text-xl font-bold mb-4">Project List</div>
      <nav>
        <Link to="/" className="block py-2 px-4 bg-blue-200 rounded hover:bg-blue-300">
          All Project
        </Link>
      </nav>
    </div>
  );
}
