'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaExclamationTriangle, FaArrowLeft, FaSwimmer } from 'react-icons/fa';

const DeleteAccountPage = () => {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [showFinalWarning, setShowFinalWarning] = useState(false);

  const handleDeleteAccount = () => {
    // In a real app, this would make an API call to delete the account
    // For now, we'll just redirect to the login page
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center hover:text-teal-500 transition-colors">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">SwimTracker</span>
          </Link>
        </nav>
      </header>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-teal-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Delete Account</h2>
            <div className="mt-4 space-y-2 text-gray-600">
              <p className="text-lg font-medium">We're sorry to see you go!</p>
              <p>Your journey with SwimTracker has been valuable, and we hope you've enjoyed tracking your swimming progress with us.</p>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-md">
              <h3 className="text-lg font-medium text-teal-900 mb-2">Before you leave</h3>
              <p className="text-teal-700 mb-4">Have you considered:</p>
              <ul className="list-disc list-inside text-teal-700 space-y-2">
                <li>Downloading your swimming history for your records?</li>
                <li>Reaching out to our support team if you're having issues?</li>
                <li>Temporarily deactivating your account instead?</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <h3 className="text-lg font-medium text-red-800 mb-2">What you'll lose</h3>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>All your personal data will be permanently deleted</li>
                <li>Your swimming history and achievements will be lost</li>
                <li>You will lose access to all your training plans</li>
                <li>Your account cannot be recovered after deletion</li>
              </ul>
            </div>

            {!showFinalWarning ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                    Type "DELETE" to confirm
                  </label>
                  <input
                    id="confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 px-3 py-2 
                      focus:border-teal-500 focus:ring-teal-500 
                      text-gray-900 text-lg font-medium
                      placeholder-gray-400"
                    placeholder="Type DELETE"
                  />
                </div>

                <button
                  onClick={() => setShowFinalWarning(true)}
                  disabled={confirmText !== 'DELETE'}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                    confirmText === 'DELETE'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-md text-center">
                  <p className="text-red-800 font-medium">
                    Are you absolutely sure you want to delete your account?
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowFinalWarning(false)}
                    className="py-3 px-4 rounded-md bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="py-3 px-4 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            <Link
              href="/profile"
              className="block text-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <FaArrowLeft className="inline-block mr-2" />
              Return to Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage; 
