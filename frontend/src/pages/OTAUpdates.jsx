import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { BACKEND_BASE_URL } from '../utils/api';

const DEVICES_PER_PAGE = 5;
const UPDATES_PER_PAGE = 5;

const DEVICES_API = `${BACKEND_BASE_URL}/devices`;
const OTA_API = `${BACKEND_BASE_URL}/ota-updates`;

const OTAUpdates = () => {
  const [devices, setDevices] = useState([]);
  const [otaUpdates, setOtaUpdates] = useState([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [devicePage, setDevicePage] = useState(1);
  const [updatesPage, setUpdatesPage] = useState(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(DEVICES_API);
        const data = await res.json();
        setDevices(data);
      } catch (err) {
        setError('Failed to fetch devices');
      }
    };
    fetchDevices();
  }, []);

  // Fetch OTA updates
  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(OTA_API);
        const data = await res.json();
        setOtaUpdates(data);
      } catch (err) {
        setError('Failed to fetch OTA updates');
      }
      setLoading(false);
    };
    fetchUpdates();
  }, []);

  // Filtered device list
  const filteredDevices = useMemo(() => devices.filter(d => d.name.toLowerCase().includes(deviceSearch.toLowerCase())), [devices, deviceSearch]);
  const pagedDevices = filteredDevices.slice((devicePage - 1) * DEVICES_PER_PAGE, devicePage * DEVICES_PER_PAGE);
  const totalDevicePages = Math.ceil(filteredDevices.length / DEVICES_PER_PAGE);

  // Filtered OTA updates for selected device
  const filteredUpdates = useMemo(() => {
    let updates = otaUpdates;
    if (selectedDeviceId) {
      updates = updates.filter(u => u.deviceId === devices.find(d => d._id === selectedDeviceId)?.deviceId);
    }
    return updates;
  }, [otaUpdates, selectedDeviceId, devices]);
  const pagedUpdates = filteredUpdates.slice((updatesPage - 1) * UPDATES_PER_PAGE, updatesPage * UPDATES_PER_PAGE);
  const totalUpdatesPages = Math.ceil(filteredUpdates.length / UPDATES_PER_PAGE);

  // Summary counts
  const successCount = filteredUpdates.filter(u => u.normalizedStatus === 'Success').length;
  const failedCount = filteredUpdates.filter(u => u.normalizedStatus === 'Failed').length;

  // --- UI helpers for pill badges ---
  const getDeviceStatusBadge = (status) => {
    const map = {
      online: 'text-blue-700',
      offline: 'text-red-700',
      updating: 'text-yellow-700',
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>{label}</span>;
  };
  const getUpdateStatusBadge = (status) => {
    const map = {
      Success: 'text-blue-700',
      Failed: 'text-red-700',
      'In Progress': 'text-gray-700',
      Scheduled: 'text-yellow-700',
    };
    return <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'scheduled': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'paused': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    const statusIcons = {
      'in-progress': <Clock className="h-3 w-3" />,
      'completed': <CheckCircle className="h-3 w-3" />,
      'scheduled': <Clock className="h-3 w-3" />,
      'failed': <AlertTriangle className="h-3 w-3" />,
      'paused': <Pause className="h-3 w-3" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusIcons[status]}
        <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
      </span>
    );
  };

  const getProgressBar = (progress, status) => {
    const getColor = () => {
      if (status === 'failed') return 'bg-red-600';
      if (status === 'completed') return 'bg-green-600';
      return 'bg-blue-600';
    };

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUpdates(filteredUpdates.map(update => update.id));
    } else {
      setSelectedUpdates([]);
    }
  };

  const handleSelectUpdate = (updateId) => {
    if (selectedUpdates.includes(updateId)) {
      setSelectedUpdates(selectedUpdates.filter(id => id !== updateId));
    } else {
      setSelectedUpdates([...selectedUpdates, updateId]);
    }
  };

  return (
    <div className="min-h-screen py-8 px-2 sm:px-6 md:px-12 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OTA Updates</h1>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Successful Updates</span>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{successCount}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total successful firmware updates.</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Failed Updates</span>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{failedCount}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total failed firmware updates.</span>
        </div>
      </div>
      {/* Main Content: Device List & OTA Updates History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Device</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click a device to see its update history.</span>
          {/* Device Search */}
          <input
            type="text"
            placeholder="Search devices..."
            value={deviceSearch}
            onChange={e => { setDeviceSearch(e.target.value); setDevicePage(1); }}
            className="mb-3 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device ID</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pagedDevices.map(device => (
                  <tr
                    key={device._id}
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedDeviceId === device._id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                    onClick={() => { setSelectedDeviceId(device._id); setUpdatesPage(1); }}
                  >
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{device.name}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{device.deviceId}</td>
                  </tr>
                ))}
                {pagedDevices.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-2 text-center text-gray-400 dark:text-gray-500">No devices found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Device Pagination */}
          <div className="flex justify-between items-center mt-3 gap-2">
            <button
              className="px-4 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200 disabled:opacity-50"
              onClick={() => setDevicePage(p => Math.max(1, p - 1))}
              disabled={devicePage === 1}
            >Previous</button>
            <span className="text-xs text-gray-500 dark:text-gray-400">Page {devicePage} of {totalDevicePages}</span>
            <button
              className="px-4 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200 disabled:opacity-50"
              onClick={() => setDevicePage(p => Math.min(totalDevicePages, p + 1))}
              disabled={devicePage === totalDevicePages}
            >Next</button>
          </div>
        </div>
        {/* OTA Updates History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">OTA Updates History</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedDeviceId ? `Showing updates for ${devices.find(d => d._id === selectedDeviceId)?.name}` : 'Showing all updates. Select a device to filter.'}</span>
          {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
          {error && <div className="p-4 text-center text-red-500">{error}</div>}
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PIC ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Previous Version</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated Version</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pagedUpdates.map(update => (
                  <tr key={update._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{update.pic_id}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{update.deviceId}</td>
                    <td className="px-4 py-2">
                      {update.normalizedStatus === 'Success' && <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">{update.status}</span>}
                      {update.normalizedStatus === 'Failed' && <span className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">{update.status}</span>}
                      {update.normalizedStatus === 'In Progress' && <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">{update.status}</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{update.previousVersion}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{update.updatedVersion}</td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{update.date ? new Date(update.date).toLocaleString() : ''}</td>
                  </tr>
                ))}
                {pagedUpdates.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-2 text-center text-gray-400 dark:text-gray-500">No updates found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-end items-center mt-3 gap-2">
            <button
              className="px-4 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200 disabled:opacity-50"
              onClick={() => setUpdatesPage(p => Math.max(1, p - 1))}
              disabled={updatesPage === 1}
            >Previous</button>
            <button
              className="px-4 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-200 disabled:opacity-50"
              onClick={() => setUpdatesPage(p => Math.min(totalUpdatesPages, p + 1))}
              disabled={updatesPage === totalUpdatesPages}
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTAUpdates; 
