import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import DeviceManagement from './pages/DeviceManagement';
import UserManagement from './pages/UserManagement';
import FirmwareManagement from './pages/FirmwareManagement';
import OTAUpdates from './pages/OTAUpdates';
import AddNewDevice from './pages/AddNewDevice';
import AddNewUser from './pages/AddNewUser';
import Login from './pages/Login';
import './App.css';

function PageWithTitle({ title, children }) {
  return <Layout pageTitle={title}>{children}</Layout>;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated (check localStorage for token)
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={
              !isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />
            } />
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
            <Route path="/*" element={
              isAuthenticated ? (
                <Routes>
                  <Route path="/dashboard" element={<PageWithTitle title="Dashboard"><Dashboard /></PageWithTitle>} />
                  <Route path="/devices" element={<PageWithTitle title="Device Management"><DeviceManagement /></PageWithTitle>} />
                  <Route path="/users" element={<PageWithTitle title="User Management"><UserManagement /></PageWithTitle>} />
                  <Route path="/firmware" element={<PageWithTitle title="Firmware Management"><FirmwareManagement /></PageWithTitle>} />
                  <Route path="/ota-updates" element={<PageWithTitle title="OTA Updates"><OTAUpdates /></PageWithTitle>} />
                  <Route path="/add-device" element={<PageWithTitle title="Add New Device"><AddNewDevice /></PageWithTitle>} />
                  <Route path="/add-user" element={<PageWithTitle title="Add New User"><AddNewUser /></PageWithTitle>} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              ) : (
                <Navigate to="/login" />
              )
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
