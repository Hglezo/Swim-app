'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaClock, FaTrophy, FaFire } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React from 'react';

interface Workout {
  count: number;
  durations: string[]; // Format: "HH:MM:SS"
  meters: number[];    // Meters per workout
}

interface WorkoutRecord {
  [key: string]: Workout;
}

// Helper function to generate workout data for a given date
const generateWorkoutForDate = (date: Date): Workout | null => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // No workouts on Sundays
  if (dayOfWeek === 0) return null;
  
  // Monday, Wednesday, Friday: Two workouts (5km and 3.5km)
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    return {
      count: 2,
      durations: ["01:45:00", "01:30:00"],
      meters: [5000, 3500]
    };
  }
  
  // Tuesday, Thursday, Saturday: One workout (6km)
  if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
    return {
      count: 1,
      durations: ["02:00:00"],
      meters: [6000]
    };
  }
  
  return null;
};

// Helper function to generate workouts for a given month
const generateMonthWorkouts = (year: number, month: number): { [key: string]: Workout } => {
  const workouts: { [key: string]: Workout } = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const workout = generateWorkoutForDate(date);
    
    if (workout) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      workouts[dateString] = workout;
    }
  }
  
  return workouts;
};

// Generate workouts for 2023-2025
const generateAllWorkouts = (): WorkoutRecord => {
  const allWorkouts: WorkoutRecord = {};
  
  for (let year = 2023; year <= 2025; year++) {
    for (let month = 0; month < 12; month++) {
      const monthWorkouts = generateMonthWorkouts(year, month);
      Object.assign(allWorkouts, monthWorkouts);
    }
  }
  
  return allWorkouts;
};

// Helper function to format meters to kilometers
const formatToKm = (meters: number): string => {
  return (meters / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'km';
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

const DashboardPage: React.FC = () => {
  const mockWorkouts = generateAllWorkouts();
  const currentDate = new Date();

  // Calculate current month's stats
  const currentMonthStats = {
    totalWorkouts: 0,
    totalDistance: 0,
    totalDuration: 0,
    averageDistance: 0,
    averageDuration: 0,
    longestWorkout: 0,
    fastestPace: 0,
  };

  Object.entries(mockWorkouts).forEach(([date, workout]) => {
    const workoutDate = new Date(date);
    if (workoutDate.getMonth() === currentDate.getMonth() && 
        workoutDate.getFullYear() === currentDate.getFullYear()) {
      currentMonthStats.totalWorkouts += workout.count;
      const dayDistance = workout.meters.reduce((sum, m) => sum + m, 0);
      currentMonthStats.totalDistance += dayDistance;
      const dayDuration = workout.durations.reduce((sum, duration) => {
        const [hours, minutes] = duration.split(':').map(Number);
        return sum + hours * 60 + minutes;
      }, 0);
      currentMonthStats.totalDuration += dayDuration;
      currentMonthStats.longestWorkout = Math.max(currentMonthStats.longestWorkout, ...workout.meters);
      
      // Calculate pace (minutes per km) for each workout
      workout.meters.forEach((meters, i) => {
        const [hours, minutes] = workout.durations[i].split(':').map(Number);
        const durationMinutes = hours * 60 + minutes;
        const pace = (durationMinutes / (meters / 1000));
        if (currentMonthStats.fastestPace === 0) currentMonthStats.fastestPace = pace;
        else currentMonthStats.fastestPace = Math.min(currentMonthStats.fastestPace, pace);
      });
    }
  });

  currentMonthStats.averageDistance = currentMonthStats.totalDistance / currentMonthStats.totalWorkouts;
  currentMonthStats.averageDuration = currentMonthStats.totalDuration / currentMonthStats.totalWorkouts;

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
            <Link href="/dashboard" className="text-teal-500 flex items-center">
              <MdDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link href="/insights" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaChartLine className="h-5 w-5 mr-2" />
              Insights
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <MdPerson className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <button className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your swimming performance</p>
        </div>

        {/* Current Month Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 rounded-full">
                <FaSwimmer className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonthStats.totalWorkouts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaTrophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{formatToKm(currentMonthStats.totalDistance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaClock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(currentMonthStats.totalDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaFire className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fastest Pace</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(currentMonthStats.fastestPace)}min/km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Distance per Workout</span>
                <span className="font-medium text-gray-900">{formatToKm(currentMonthStats.averageDistance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Time per Workout</span>
                <span className="font-medium text-gray-900">{formatDuration(currentMonthStats.averageDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Longest Workout</span>
                <span className="font-medium text-gray-900">{formatToKm(currentMonthStats.longestWorkout)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Workouts This Month</span>
                <span className="font-medium text-gray-900">{currentMonthStats.totalWorkouts}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goals</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Distance Goal (100km)</span>
                  <span className="font-medium text-gray-900">{Math.round((currentMonthStats.totalDistance / 100000) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 rounded-full h-2" 
                    style={{ width: `${Math.min(100, (currentMonthStats.totalDistance / 100000) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Workout Goal (20 workouts)</span>
                  <span className="font-medium text-gray-900">{Math.round((currentMonthStats.totalWorkouts / 20) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 rounded-full h-2" 
                    style={{ width: `${Math.min(100, (currentMonthStats.totalWorkouts / 20) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Time Goal (40 hours)</span>
                  <span className="font-medium text-gray-900">{Math.round((currentMonthStats.totalDuration / 2400) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 rounded-full h-2" 
                    style={{ width: `${Math.min(100, (currentMonthStats.totalDuration / 2400) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;