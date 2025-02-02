'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaEdit, FaCog, FaMedal, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React, { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

const ProfilePage: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const { isDark, setDefaultTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);
  const [editedUser, setEditedUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    type: "athlete" as "athlete" | "coach",
    memberSince: "January 2023",
    achievements: [
      { name: "50km Club", date: "March 2024" },
      { name: "30 Day Streak", date: "February 2024" },
      { name: "Early Bird", date: "January 2024" },
    ]
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address (e.g., name@domain.com)');
      return false;
    }

    // Additional checks for common invalid patterns
    if (email.startsWith('.') || email.endsWith('.')) {
      setEmailError('Email cannot start or end with a dot');
      return false;
    }

    if (email.includes('..')) {
      setEmailError('Email cannot contain consecutive dots');
      return false;
    }

    const [localPart, domain] = email.split('@');
    if (localPart.length > 64) {
      setEmailError('Username part of email is too long');
      return false;
    }

    if (domain.length > 255) {
      setEmailError('Domain part of email is too long');
      return false;
    }

    if (!domain.includes('.')) {
      setEmailError('Email must have a valid domain (e.g., example.com)');
      return false;
    }

    const topLevelDomain = domain.split('.').pop() || '';
    if (topLevelDomain.length < 2) {
      setEmailError('Email must have a valid domain extension (.com, .org, etc.)');
      return false;
    }

    return true;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Validate email before saving
      if (!validateEmail(editedUser.email)) {
        return;
      }
      setEmailError(null);
      // Save changes here (in a real app, this would make an API call)
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setEmailError(null);
    }
  };

  const handleInputChange = (field: keyof typeof editedUser, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear email error when user starts typing
    if (field === 'email') {
      setEmailError(null);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setTempPreferences({
      ...tempPreferences,
      [key]: value
    });
  };

  const handleSaveChanges = () => {
    // Save preferences if they were being edited
    if (isEditingPreferences) {
      updatePreferences(tempPreferences);
      // Update the theme default when preferences are saved
      setDefaultTheme(tempPreferences.defaultTheme);
      setIsEditingPreferences(false);
    }

    // Save profile changes if they were being edited
    if (isEditing) {
      // In a real app, this would make an API call
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditedUser({
      name: "John Doe",
      email: "john.doe@example.com",
      type: "athlete",
      memberSince: "January 2023",
      achievements: editedUser.achievements
    });
    setTempPreferences(preferences);
    setIsEditing(false);
    setIsEditingPreferences(false);
  };

  const togglePreferencesEdit = () => {
    setIsEditingPreferences(!isEditingPreferences);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col transition-colors duration-200`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:text-teal-500 transition-colors">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className={`ml-2 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>SwimTracker</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaHome className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link href="/history" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaCalendarAlt className="h-5 w-5 mr-2" />
              Calendar
            </Link>
            <Link href="/dashboard" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <MdDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link href="/insights" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className={`${isDark ? 'text-teal-400' : 'text-teal-500'} transition-colors flex items-center`}>
              <MdPerson className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <ThemeToggle />
            <Link 
              href="/logout" 
              className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}
            >
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </Link>
          </div>
        </nav>
      </header>

      <main className={`flex-1 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Profile</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200 mr-4`}>Personal Information</h2>
              <div className="flex space-x-2 ml-4">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleEditToggle}
                      className="text-green-500 hover:text-green-400 transition-colors"
                    >
                      <FaCheck className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEditToggle}
                    className="text-teal-500 hover:text-teal-400 transition-colors"
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-2 ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    } shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 transition-colors duration-200`}
                  />
                ) : (
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{editedUser.name}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Email</label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-2 ${
                        emailError 
                          ? 'border-red-300' 
                          : isDark 
                            ? 'border-gray-600' 
                            : 'border-gray-300'
                      } ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 transition-colors duration-200`}
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1" />
                        {emailError}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{editedUser.email}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Member Since</label>
                <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{editedUser.memberSince}</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Achievements</h2>
            <div className="space-y-4">
              {editedUser.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <FaMedal className="h-5 w-5 text-teal-500 mt-1" />
                  <div className="ml-3">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{achievement.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Preferences</h2>
              <div className="flex space-x-2">
                {isEditingPreferences ? (
                  <>
                    <button 
                      onClick={handleSaveChanges}
                      className="text-green-500 hover:text-green-400 transition-colors"
                    >
                      <FaCheck className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={togglePreferencesEdit}
                    className="text-teal-500 hover:text-teal-400 transition-colors"
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Distance Unit</label>
                {isEditingPreferences ? (
                  <select
                    value={tempPreferences.distanceUnit}
                    onChange={(e) => handlePreferenceChange('distanceUnit', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-2 ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    } shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 transition-colors duration-200`}
                  >
                    <option value="meters">Meters</option>
                    <option value="yards">Yards</option>
                  </select>
                ) : (
                  <p className={`mt-1 capitalize ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{preferences.distanceUnit}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Time Format</label>
                {isEditingPreferences ? (
                  <select
                    value={tempPreferences.timeFormat}
                    onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-2 ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    } shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 transition-colors duration-200`}
                  >
                    <option value="24h">24-hour</option>
                    <option value="12h">12-hour</option>
                  </select>
                ) : (
                  <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {preferences.timeFormat === '24h' ? '24-hour' : '12-hour'}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>First Day of Week</label>
                {isEditingPreferences ? (
                  <select
                    value={tempPreferences.weekStart}
                    onChange={(e) => handlePreferenceChange('weekStart', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-2 ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    } shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 transition-colors duration-200`}
                  >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                ) : (
                  <p className={`mt-1 capitalize ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{preferences.weekStart}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Default Theme</label>
                {isEditingPreferences ? (
                  <select
                    value={tempPreferences.defaultTheme}
                    onChange={(e) => handlePreferenceChange('defaultTheme', e.target.value)}
                    className={`mt-1 block w-full rounded-md border-2 ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    } shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 transition-colors duration-200`}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                ) : (
                  <p className={`mt-1 capitalize ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{preferences.defaultTheme}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(isEditing || isEditingPreferences) && (
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center"
            >
              <FaCheck className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
            >
              <FaTimes className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-[200px]"></div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-lg shadow p-6 mt-auto mb-8">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <Link 
              href="/delete-account"
              className="text-red-600 hover:text-red-700 transition-colors font-medium inline-flex items-center"
            >
              <FaExclamationTriangle className="h-4 w-4 mr-2" />
              Delete Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 