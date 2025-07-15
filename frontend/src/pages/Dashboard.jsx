import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import {
  Smartphone,
  HardDrive,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BACKEND_BASE_URL } from '../utils/api';

const DEVICES_API = `${BACKEND_BASE_URL}/devices`;
const FIRMWARE_API = `${BACKEND_BASE_URL}/firmware/firmwares-details`;
const OTA_API = `${BACKEND_BASE_URL}/ota-updates`;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [devices, setDevices] = useState([]);
  const [firmwares, setFirmwares] = useState([]);
  const [otaUpdates, setOtaUpdates] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect dark mode for recharts and react-select
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    window.addEventListener('storage', checkDark);
    window.addEventListener('DOMContentLoaded', checkDark);
    return () => {
      window.removeEventListener('storage', checkDark);
      window.removeEventListener('DOMContentLoaded', checkDark);
    };
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [devRes, fwRes, otaRes] = await Promise.all([
          fetch(DEVICES_API),
          fetch(FIRMWARE_API),
          fetch(OTA_API)
        ]);
        setDevices(await devRes.json());
        setFirmwares(await fwRes.json());
        setOtaUpdates(await otaRes.json());
      } catch (err) {
        setError('Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Device dropdown options
  const deviceOptions = devices.map(d => ({ value: d.deviceId, label: `${d.name} (${d.deviceId})` }));

  // Filter OTA updates by time range and device
  const now = new Date();
  const getStartDate = () => {
    if (timeRange === '7d') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    if (timeRange === '30d') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    if (timeRange === '90d') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89);
    return new Date(0);
  };
  const startDate = getStartDate();
  const filteredUpdates = useMemo(() => otaUpdates.filter(u => {
    const date = new Date(u.date || u.createdAt || u.updatedAt);
    if (isNaN(date)) return false;
    if (date < startDate) return false;
    if (selectedDevice) return u.deviceId === selectedDevice.value;
    return true;
  }), [otaUpdates, startDate, selectedDevice]);

  // Stats
  const totalDevices = devices.length;
  const totalFirmwares = selectedDevice
    ? firmwares.filter(fw => fw.esp_id === selectedDevice.value).length
    : 0;
  const totalSuccess = filteredUpdates.filter(u => u.status === 'Success').length;
  const totalFailed = filteredUpdates.filter(u => u.status === 'Failed').length;

  // Pie chart data
  const pieData = [
    { name: 'Success', value: filteredUpdates.filter(u => u.status === 'Success').length, color: '#10B981' },
    { name: 'Failed', value: filteredUpdates.filter(u => u.status === 'Failed').length, color: '#EF4444' },
    { name: 'Already Updated', value: filteredUpdates.filter(u => u.status === 'In Progress').length, color: '#F59E0B' },
  ];

  // Bar chart data
  const barData = useMemo(() => {
    if (timeRange === '7d') {
      // Per day for last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
        return d;
      });
      return days.map(day => {
        const dayStr = day.toISOString().slice(0, 10);
        const dayUpdates = filteredUpdates.filter(u => (u.date || u.createdAt || '').slice(0, 10) === dayStr);
        return {
          name: day.toLocaleDateString(undefined, { weekday: 'short' }),
          Success: dayUpdates.filter(u => u.status === 'Success').length,
          Failed: dayUpdates.filter(u => u.status === 'Failed').length,
        };
      });
    } else if (timeRange === '30d') {
      // Per week for last 4 weeks
      const weeks = [0, 1, 2, 3].map(w => {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29 + w * 7);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29 + (w + 1) * 7 - 1);
        return { start, end };
      });
      return weeks.map((week, i) => {
        const weekUpdates = filteredUpdates.filter(u => {
          const date = new Date(u.date || u.createdAt || u.updatedAt);
          return date >= week.start && date <= week.end;
        });
        return {
          name: `Week ${i + 1}`,
          Success: weekUpdates.filter(u => u.status === 'Success').length,
          Failed: weekUpdates.filter(u => u.status === 'Failed').length,
        };
      });
    } else if (timeRange === '90d') {
      // Per month for last 3 months
      const months = [2, 1, 0].map(m => {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        return d;
      });
      return months.map((month, i) => {
        const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        const monthUpdates = filteredUpdates.filter(u => {
          const date = new Date(u.date || u.createdAt || u.updatedAt);
          return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
        });
        return {
          name: month.toLocaleString(undefined, { month: 'short' }),
          Success: monthUpdates.filter(u => u.status === 'Success').length,
          Failed: monthUpdates.filter(u => u.status === 'Failed').length,
        };
      });
    }
    return [];
  }, [filteredUpdates, timeRange]);

  // Mock recent activities
  const recentActivities = [
    { id: 1, type: 'firmware', action: 'Firmware v1.2 uploaded', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'ota', action: 'OTA update failed for Device 23', time: '10 minutes ago', status: 'failed' },
    { id: 3, type: 'device', action: 'Device "Sensor-001" went offline', time: '1 hour ago', status: 'warning' },
    { id: 4, type: 'firmware', action: 'Firmware v1.1 deleted', time: '2 hours ago', status: 'info' },
    { id: 5, type: 'ota', action: 'OTA update successful for Device 12', time: '3 hours ago', status: 'success' },
  ];
  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'failed') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (status === 'warning') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  // Card icon backgrounds
  const iconBg = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  // Card config for consistent style
  const cardStats = [
    {
      label: 'Total Devices',
      valueKey: 'totalDevices',
      icon: Smartphone,
      iconBg: iconBg.blue,
      sub: '+0% from last period',
    },
    {
      label: 'Total Firmwares Uploaded',
      valueKey: 'totalFirmwares',
      icon: HardDrive,
      iconBg: iconBg.purple,
      sub: '+0% from last period',
    },
    {
      label: 'Total Success',
      valueKey: 'totalSuccess',
      icon: CheckCircle,
      iconBg: iconBg.green,
      sub: '+0% from last period',
    },
    {
      label: 'Total Failures',
      valueKey: 'totalFailed',
      icon: AlertTriangle,
      iconBg: iconBg.red,
      sub: '+0% from last period',
    },
  ];

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow px-4 py-2 border border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-gray-900 dark:text-white mb-1">{label}</div>
          <div className="flex flex-col gap-1">
            <span className="text-green-600 dark:text-green-400">Total Success: <b>{payload.find(p => p.dataKey === 'Success')?.value ?? 0}</b></span>
            <span className="text-red-600 dark:text-red-400">Total Failures: <b>{payload.find(p => p.dataKey === 'Failed')?.value ?? 0}</b></span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend for charts
  const CustomLegend = ({ payload }) => (
    <div className="flex gap-4 mt-4 text-xs">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: entry.color }}></span>
          <span style={{ color: isDark ? '#d1d5db' : '#374151' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your device management system
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Select
            className={`min-w-[220px]`}
            classNamePrefix="react-select"
            options={deviceOptions}
            isClearable
            placeholder="Select device..."
            value={selectedDevice}
            onChange={setSelectedDevice}
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: isDark ? '#1f2937' : '#fff',
                borderColor: isDark ? '#374151' : '#d1d5db',
                color: isDark ? '#f3f4f6' : '#111827',
                boxShadow: state.isFocused ? (isDark ? '0 0 0 1px #2563eb' : '0 0 0 1px #2563eb') : base.boxShadow,
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: isDark ? '#1f2937' : '#fff',
                color: isDark ? '#f3f4f6' : '#111827',
              }),
              singleValue: (base) => ({
                ...base,
                color: isDark ? '#f3f4f6' : '#111827',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? (isDark ? '#374151' : '#f3f4f6')
                  : (isDark ? '#1f2937' : '#fff'),
                color: isDark ? '#f3f4f6' : '#111827',
              }),
              input: (base) => ({
                ...base,
                color: isDark ? '#f3f4f6' : '#111827',
              }),
              placeholder: (base) => ({
                ...base,
                color: isDark ? '#9ca3af' : '#6b7280',
              }),
              dropdownIndicator: (base) => ({
                ...base,
                color: isDark ? '#9ca3af' : '#6b7280',
              }),
              indicatorSeparator: (base) => ({
                ...base,
                backgroundColor: isDark ? '#374151' : '#d1d5db',
              }),
            }}
          />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Info message if no device selected */}
      {!selectedDevice && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium">
          Select a device from the dropdown above to view detailed analytics and charts.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(!selectedDevice
          ? cardStats.filter(stat => stat.valueKey === 'totalDevices')
          : cardStats
        ).map((stat, i) => {
          const Icon = stat.icon;
          const value = (() => {
            if (stat.valueKey === 'totalDevices') return totalDevices;
            if (stat.valueKey === 'totalFirmwares') return totalFirmwares;
            if (stat.valueKey === 'totalSuccess') return totalSuccess;
            if (stat.valueKey === 'totalFailed') return totalFailed;
            return 0;
          })();
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow flex flex-col justify-between px-6 py-5 min-h-[120px]">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1 dark:text-white">{value}</div>
                  <div className="text-xs text-gray-400">{stat.sub}</div>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${stat.iconBg} bg-opacity-60`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Section - styled like screenshot */}
        {selectedDevice && (
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow px-8 py-6">
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Activity</h3>
                <div className="text-xs text-gray-400">Success vs Failure devices over the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '4 weeks' : '3 months'}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    data={barData}
                    barGap={8}
                    barCategoryGap={20}
                  >
                    <CartesianGrid stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" stroke={isDark ? '#9CA3AF' : '#6B7280'} tick={{ fill: isDark ? '#d1d5db' : '#374151' }} />
                    <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} allowDecimals={false} tick={{ fill: isDark ? '#d1d5db' : '#374151' }} />
                    <Tooltip
                      content={<CustomBarTooltip />}
                      contentStyle={{
                        backgroundColor: isDark ? '#1F2937' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        color: isDark ? '#F9FAFB' : '#111827',
                      }}
                    />
                    <Legend content={<CustomLegend />} />
                    <Bar dataKey="Success" name="success" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Failed" name="failure" fill="#d9f99d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {/* Pie chart and Recent Activities side by side, full width */}
        <div className="w-full flex flex-col md:flex-row gap-6 mt-6">
          {/* Pie Chart */}
          {selectedDevice && (
            <div
              className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col items-center justify-center min-w-0"
              style={{ maxWidth: '600px' }}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">OTA Update Status</h3>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 w-full">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1F2937' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        color: isDark ? '#F9FAFB' : '#111827',
                      }}
                    />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* Recent Activities */}
          <div className={`flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col min-w-0 ${selectedDevice ? '' : 'w-full'}`}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activities</h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center gap-3">
                  <div className="flex-shrink-0">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 dark:text-white">{activity.action}</div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 