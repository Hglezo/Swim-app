'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaEdit, FaCog, FaMedal, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React, { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

const ProfilePage: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes here (in a real app, this would make an API call)
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (field: keyof typeof editedUser, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:text-teal-500 transition-colors">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">SwimTracker</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaHome className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link href="/history" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaCalendarAlt className="h-5 w-5 mr-2" />
              Calendar
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <MdDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link href="/insights" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className="text-teal-500 flex items-center">
              <MdPerson className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <Link 
              href="/logout" 
              className="text-gray-700 hover:text-teal-500 transition-colors flex items-center"
            >
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleEditToggle}
                      className="text-green-500 hover:text-green-600 transition-colors"
                    >
                      <FaCheck className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEditToggle}
                    className="text-teal-500 hover:text-teal-600 transition-colors"
                  >
                    <FaEdit className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedUser.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedUser.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">User Type</label>
                {isEditing ? (
                  <select
                    value={editedUser.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3"
                  >
                    <option value="athlete">Athlete</option>
                    <option value="coach">Coach</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900 capitalize">{editedUser.type}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Member Since</label>
                <p className="mt-1 text-gray-900">{editedUser.memberSince}</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
              <FaMedal className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              {editedUser.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{achievement.name}</p>
                    <p className="text-sm text-gray-600">{achievement.date}</p>
                  </div>
                  <FaMedal className="h-5 w-5 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              <button
                onClick={togglePreferencesEdit}
                className="text-teal-500 hover:text-teal-600 transition-colors"
              >
                <FaCog className={`h-5 w-5 ${isEditingPreferences ? 'rotate-180' : ''} transition-transform duration-300`} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Distance Unit</label>
                {isEditingPreferences ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Current: {preferences.distanceUnit}</p>
                    <select 
                      value={tempPreferences.distanceUnit}
                      onChange={(e) => handlePreferenceChange('distanceUnit', e.target.value)}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 font-medium shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 cursor-pointer hover:border-gray-400"
                    >
                      <option value="kilometers" className="text-gray-900 font-medium">Kilometers</option>
                      <option value="miles" className="text-gray-900 font-medium">Miles</option>
                    </select>
                  </>
                ) : (
                  <p className="text-gray-700 capitalize">{preferences.distanceUnit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Time Format</label>
                {isEditingPreferences ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Current: {preferences.timeFormat}</p>
                    <select 
                      value={tempPreferences.timeFormat}
                      onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 font-medium shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 cursor-pointer hover:border-gray-400"
                    >
                      <option value="24h" className="text-gray-900 font-medium">24-hour</option>
                      <option value="12h" className="text-gray-900 font-medium">12-hour</option>
                    </select>
                  </>
                ) : (
                  <p className="text-gray-700">{preferences.timeFormat === '24h' ? '24-hour' : '12-hour'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Week Starts On</label>
                {isEditingPreferences ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Current: {preferences.weekStart}</p>
                    <select 
                      value={tempPreferences.weekStart}
                      onChange={(e) => handlePreferenceChange('weekStart', e.target.value)}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white text-gray-900 font-medium shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2 px-3 cursor-pointer hover:border-gray-400"
                    >
                      <option value="monday" className="text-gray-900 font-medium">Monday</option>
                      <option value="sunday" className="text-gray-900 font-medium">Sunday</option>
                    </select>
                  </>
                ) : (
                  <p className="text-gray-700 capitalize">{preferences.weekStart}</p>
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