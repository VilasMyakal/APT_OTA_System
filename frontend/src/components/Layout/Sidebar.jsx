import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Smartphone, 
  Users, 
  HardDrive, 
  Download, 
  Plus,
  X,
  LogOut,
  Upload
} from 'lucide-react';
import logo from '../../assets/logo.png';
import Select from 'react-select';
import '../../pages/react-select-tailwind.css';
import UploadFirmwareModal from '../UploadFirmwareModal';
import { BACKEND_BASE_URL } from '../../utils/api';

const DEVICES_API = `${BACKEND_BASE_URL}/devices`;

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [deviceOptions, setDeviceOptions] = useState([]);

  // Fetch devices for dropdown
  useEffect(() => {
    if (!showUploadModal) return;
    const fetchDevices = async () => {
      try {
        const res = await fetch(DEVICES_API);
        const data = await res.json();
        setDeviceOptions(
          data.map(d => ({ value: d.deviceId, label: `${d.name} (${d.deviceId})` }))
        );
      } catch (err) {
        setDeviceOptions([]);
      }
    };
    fetchDevices();
  }, [showUploadModal]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedDevice || !version || !file) return;
    try {
      const formData = new FormData();
      formData.append('version', version);
      formData.append('description', description);
      formData.append('esp_id', selectedDevice.value);
      formData.append('file', file);
      await fetch(`${BACKEND_BASE_URL}/firmware/upload`, {
        method: 'POST',
        body: formData
      });
      setVersion('');
      setDescription('');
      setFile(null);
      setSelectedDevice(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadModal(false);
    } catch (err) {
      alert('Failed to upload firmware');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Device Management', href: '/devices', icon: Smartphone },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Firmware Management', href: '/firmware', icon: HardDrive },
    { name: 'OTA Updates', href: '/ota-updates', icon: Download },
  ];

  const quickActions = [
    { name: 'Add New Device', href: '/add-device', icon: Plus },
    { name: 'Add New User', href: '/add-user', icon: Plus },
    { name: 'Upload New Firmware', onClick: () => setShowUploadModal(true), icon: Upload },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Logo */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-50 dark:bg-gray-900">
              <img src={logo} alt="Apropos Drive Logo" className="h-10 w-10 mr-3 rounded" />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Apropos Drive</span>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Main
                  </h3>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="space-y-1 pt-4">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  {quickActions.map((item) => {
                    const Icon = item.icon;
                    if (item.onClick) {
                      return (
                        <button
                          key={item.name}
                          onClick={item.onClick}
                          className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Bottom section */}
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center w-full space-x-3">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  {isDark ? '☀️' : '🌙'} Theme
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center">
              <img src={logo} alt="Apropos Drive Logo" className="h-9 w-9 mr-2 rounded" />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Apropos Drive</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {/* Main Navigation */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Main
                </h3>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="space-y-1 pt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </h3>
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  if (item.onClick) {
                    return (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Mobile bottom section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center w-full space-x-3">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {isDark ? '☀️' : '🌙'} Theme
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Upload New Firmware Modal */}
      <UploadFirmwareModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        deviceOptions={deviceOptions}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        version={version}
        setVersion={setVersion}
        description={description}
        setDescription={setDescription}
        file={file}
        setFile={setFile}
        fileInputRef={fileInputRef}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />
    </>
  );
};

export default Sidebar; 