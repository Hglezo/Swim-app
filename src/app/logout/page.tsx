'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSwimmer } from 'react-icons/fa';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <FaSwimmer className="h-12 w-12 text-teal-500 mx-auto" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Logging Out</h1>
          <p className="mt-2 text-sm text-gray-600">
            You will be automatically logged out in {countdown} seconds
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4">Are you sure you want to log out?</p>
              <p className="text-sm text-gray-500">
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
                className="w-full flex justify-center py-2 px-4 border border-teal-500 rounded-md shadow-sm text-sm font-medium text-teal-500 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
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
