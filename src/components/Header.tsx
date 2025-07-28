import { TableProperties } from "lucide-react";
import { Link } from 'react-router-dom';

export default function Header({ darkMode, setDarkMode }: { 
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-9/10 mx-auto px-4 py-4 sm:px-6 md:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <TableProperties className="h-8 w-8 text-blue-600" />
          <h1 className="ml-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
            Table Manager
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 relative transition-colors duration-300 focus:outline-none"
            aria-label='dark-mode'
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 rounded-full transform transition-transform duration-300 ${
                darkMode ? "translate-x-6" : ""
              }`}
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                  />
                </svg>
              )}
            </div>
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            <Link
              to="/merge"
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              Merge Files
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
