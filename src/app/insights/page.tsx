'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React from 'react';

const InsightsPage: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50">
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
            <Link href="/insights" className="text-teal-500 flex items-center">
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
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

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-600">Analysis of your swimming performance trends</p>
        </div>

        {/* Weekly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Distance Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Distance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{trends.thisWeek.distance.value}km</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.thisWeek.distance.trend)}
                  <span className="text-sm font-medium text-gray-900">
                    {formatTrend(trends.thisWeek.distance.value, trends.lastWeek.distance)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">vs Last Week</p>
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Time</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{formatDuration(trends.thisWeek.time.value)}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.thisWeek.time.trend)}
                  <span className="text-sm font-medium text-gray-900">
                    {formatTrend(trends.thisWeek.time.value, trends.lastWeek.time)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">vs Last Week</p>
              </div>
            </div>
          </div>

          {/* Pace Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Pace</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{trends.thisWeek.pace.value}min/km</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.thisWeek.pace.trend)}
                  <span className="text-sm font-medium text-gray-900">
                    {formatTrend(trends.thisWeek.pace.value, trends.lastWeek.pace)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">vs Last Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Improvements</h3>
                <ul className="list-disc list-inside text-green-700 space-y-2">
                  <li>Your weekly distance increased by {formatTrend(trends.thisWeek.distance.value, trends.lastWeek.distance)}%</li>
                  <li>Average pace improved by {formatTrend(trends.lastWeek.pace, trends.thisWeek.pace.value)}%</li>
                  <li>Total swimming time increased showing better endurance</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-2">
                  <li>Consider adding one more session to improve consistency</li>
                  <li>Try interval training to further improve your pace</li>
                  <li>Focus on maintaining the current progress trend</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Patterns</h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Consistency</h3>
                <p className="text-purple-700">You&apos;ve maintained a consistent training schedule with regular workouts throughout the week.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-2">Peak Performance</h3>
                <p className="text-orange-700">Your best performances are typically during morning sessions, suggesting this might be your optimal training time.</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <h3 className="font-medium text-teal-800 mb-2">Recovery</h3>
                <p className="text-teal-700">Your rest days are well-distributed, allowing for proper recovery between intense sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InsightsPage; 