import { Menu, Bell, Search, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, pageTitle }) => {
  const { isDark } = useTheme();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close menu on click outside
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          {pageTitle && (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</span>
          )}
        </div>
        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
              </div>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                <User className="h-4 w-4" />
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 