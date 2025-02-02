'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

const InsightsPage: React.FC = () => {
  const { isDark } = useTheme();

  // Mock data for trends
  const trends = {
    thisWeek: {
      distance: { value: 28.5, trend: 'up' }, // km
      time: { value: 840, trend: 'up' }, // minutes
      pace: { value: 29.5, trend: 'down' }, // min/km
    },
    lastWeek: {
      distance: 25.0, // km
      time: 780, // minutes
      pace: 31.2, // min/km
    }
  };

  const formatTrend = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    return percentChange.toFixed(1);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="text-green-500" />;
      case 'down':
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaMinus className="text-gray-500" />;
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
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
            <Link href="/insights" className={`${isDark ? 'text-teal-400' : 'text-teal-500'} transition-colors flex items-center`}>
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className={`${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'} transition-colors flex items-center`}>
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

      <main className={`max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Insights</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Analysis of your swimming performance trends</p>
        </div>

        {/* Weekly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Distance Card */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Weekly Distance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{trends.thisWeek.distance.value}km</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>This Week</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.thisWeek.distance.trend)}
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {formatTrend(trends.thisWeek.distance.value, trends.lastWeek.distance)}%
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>vs Last Week</p>
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Weekly Time</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{formatDuration(trends.thisWeek.time.value)}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>This Week</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.thisWeek.time.trend)}
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {formatTrend(trends.thisWeek.time.value, trends.lastWeek.time)}%
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>vs Last Week</p>
              </div>
            </div>
          </div>

          {/* Pace Card */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Average Pace</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{trends.thisWeek.pace.value}min/km</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>This Week</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.thisWeek.pace.trend)}
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {formatTrend(trends.thisWeek.pace.value, trends.lastWeek.pace)}%
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>vs Last Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Performance Analysis</h2>
            <div className="space-y-4">
              <div className={`p-4 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} rounded-lg transition-colors duration-200`}>
                <h3 className={`font-medium ${isDark ? 'text-green-400' : 'text-green-800'} mb-2 transition-colors duration-200`}>Improvements</h3>
                <ul className={`list-disc list-inside ${isDark ? 'text-green-300' : 'text-green-700'} space-y-2 transition-colors duration-200`}>
                  <li>Your weekly distance increased by {formatTrend(trends.thisWeek.distance.value, trends.lastWeek.distance)}%</li>
                  <li>Average pace improved by {formatTrend(trends.lastWeek.pace, trends.thisWeek.pace.value)}%</li>
                  <li>Total swimming time increased showing better endurance</li>
                </ul>
              </div>
              <div className={`p-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg transition-colors duration-200`}>
                <h3 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-2 transition-colors duration-200`}>Recommendations</h3>
                <ul className={`list-disc list-inside ${isDark ? 'text-blue-300' : 'text-blue-700'} space-y-2 transition-colors duration-200`}>
                  <li>Consider adding one more session to improve consistency</li>
                  <li>Try interval training to further improve your pace</li>
                  <li>Focus on maintaining the current progress trend</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Training Patterns</h2>
            <div className="space-y-4">
              <div className={`p-4 ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'} rounded-lg transition-colors duration-200`}>
                <h3 className={`font-medium ${isDark ? 'text-purple-400' : 'text-purple-800'} mb-2 transition-colors duration-200`}>Consistency</h3>
                <p className={`${isDark ? 'text-purple-300' : 'text-purple-700'} transition-colors duration-200`}>You&apos;ve maintained a consistent training schedule with regular workouts throughout the week.</p>
              </div>
              <div className={`p-4 ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'} rounded-lg transition-colors duration-200`}>
                <h3 className={`font-medium ${isDark ? 'text-orange-400' : 'text-orange-800'} mb-2 transition-colors duration-200`}>Peak Performance</h3>
                <p className={`${isDark ? 'text-orange-300' : 'text-orange-700'} transition-colors duration-200`}>Your best performances are typically during morning sessions, suggesting this might be your optimal training time.</p>
              </div>
              <div className={`p-4 ${isDark ? 'bg-teal-900/20' : 'bg-teal-50'} rounded-lg transition-colors duration-200`}>
                <h3 className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-800'} mb-2 transition-colors duration-200`}>Recovery</h3>
                <p className={`${isDark ? 'text-teal-300' : 'text-teal-700'} transition-colors duration-200`}>Your rest days are well-distributed, allowing for proper recovery between intense sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InsightsPage; 