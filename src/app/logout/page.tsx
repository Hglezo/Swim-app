'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSwimmer } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // In a real app, you would:
    // 1. Call your logout API endpoint
    // 2. Clear authentication tokens
    // 3. Clear any user data from local storage
    // 4. Reset any global state

    // Redirect to login page after logout
    router.push('/login');
  };

  const handleStayLoggedIn = () => {
    router.back();
  };

  const handleLogoutNow = () => {
    handleLogout();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col items-center justify-center p-4 transition-colors duration-200`}>
      <div className="max-w-md w-full mx-auto">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8">
          <FaSwimmer className="h-12 w-12 text-teal-500 mx-auto" />
          <h1 className={`mt-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Logging Out</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
            You will be automatically logged out in {countdown} seconds
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} py-8 px-4 shadow rounded-lg sm:px-10 transition-colors duration-200`}>
          <div className="space-y-6">
            <div className="text-center">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 transition-colors duration-200`}>Are you sure you want to log out?</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                You will need to log in again to access your account.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleLogoutNow}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Log Out Now
              </button>
              <button
                onClick={handleStayLoggedIn}
                className={`w-full flex justify-center py-2 px-4 border border-teal-500 rounded-md shadow-sm text-sm font-medium text-teal-500 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-teal-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200`}
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
