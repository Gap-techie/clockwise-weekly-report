
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900">
            <Link to="/" className="flex items-center">
              ClockWise
              <span className="text-xs text-gray-500 ml-2 mt-1">powered by Biteon</span>
            </Link>
          </h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600">
            <Clock className="h-5 w-5 mr-1" />
            <span>Dashboard</span>
          </Link>
          <Link to="/reports" className="flex items-center text-gray-700 hover:text-blue-600">
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
              <rect x="2" y="8" width="20" height="8" rx="1" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
            <span>Reports</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
