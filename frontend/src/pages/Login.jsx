import { useState } from 'react';
import { Eye, EyeOff, Smartphone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { BACKEND_BASE_URL } from '../utils/api';

const Login = ({ setIsAuthenticated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="relative w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg border border-blue-100 dark:border-gray-800 animate-fade-in">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl z-0" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl z-0" />
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-6">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-2">
              <Smartphone className="h-8 w-8 text-white" />
            </span>
            <h2 className="text-3xl font-extrabold text-blue-900 dark:text-white tracking-tight mb-1">Welcome Back</h2>
            <p className="text-base text-blue-700 dark:text-blue-200 opacity-80">Sign in to Device Manager</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-blue-900 dark:text-white placeholder-blue-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="you@email.com"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-blue-900 dark:text-white placeholder-blue-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute right-4 top-9 text-blue-400 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-100"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-blue-900 dark:text-blue-200">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded mr-2"
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-500 hover:underline dark:text-blue-300">Forgot password?</a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-400 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              ) : (
                'Sign In'
              )}
            </button>
            <div className="text-center mt-2">
              <p className="text-xs text-blue-400 dark:text-blue-200">Demo: <span className="font-medium">admin@device.com / password123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 