import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">
            Running Dashboard
          </span>
          <NavLink to="/" className={linkClass} end>Dashboard</NavLink>
          <NavLink to="/activities" className={linkClass}>Activities</NavLink>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
