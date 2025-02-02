'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSwimmer, FaEnvelope, FaLock } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

// Email validation helper function
const isValidEmail = (email: string): boolean => {
  // This regex checks for:
  // 1. Valid characters before @ (letters, numbers, dots, underscores, dashes)
  // 2. Valid domain name after @ (letters, numbers, dots, dashes)
  // 3. Valid top-level domain (.com, .org, .net, .edu, .gov, .es, etc.) with 2-6 characters
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Debounce helper function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Debounce the email value for validation
  const debouncedEmail = useDebounce(formData.email, 800);

  // Check email format when debounced email changes
  useEffect(() => {
    if (debouncedEmail && !isValidEmail(debouncedEmail)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address (e.g., user@domain.com)'
      }));
    } else if (debouncedEmail) {
      setErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  }, [debouncedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submitting
    if (!isValidEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address (e.g., user@domain.com)'
      }));
      return;
    }

    try {
      // Here you would typically make an API call to authenticate the user
      // For now, we'll just simulate success and redirect
      router.push('/');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        password: 'Invalid email or password'
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FaSwimmer className="h-12 w-12 text-teal-500" />
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
          Sign in to your account
        </h2>
        <p className={`mt-2 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-teal-500 hover:text-teal-400">
            Create one now
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-200`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email 
                      ? 'border-red-300' 
                      : isDark 
                        ? 'border-gray-600' 
                        : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                    isDark 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-900'
                  } transition-colors duration-200`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 transition-opacity duration-200">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.password 
                      ? 'border-red-300' 
                      : isDark 
                        ? 'border-gray-600' 
                        : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                    isDark 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-900'
                  } transition-colors duration-200`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 transition-opacity duration-200">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className={`h-4 w-4 text-teal-600 focus:ring-teal-500 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded transition-colors duration-200`}
                />
                <label htmlFor="rememberMe" className={`ml-2 block text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-200`}>
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-teal-500 hover:text-teal-400">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
