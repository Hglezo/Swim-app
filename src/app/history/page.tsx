"use client";

import Link from 'next/link';
import { FaSwimmer, FaArrowLeft, FaArrowRight, FaHome, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaClock } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

type Workout = {
  count: number;
  durations: string[]; // Format: "HH:MM:SS"
  meters: number[];    // Meters per workout
};

type WorkoutRecord = {
  [key: string]: Workout;
};

type CalendarView = 'today' | 'day' | 'week' | 'month' | 'year';

interface UserPreferences {
  distanceUnit: 'kilometers' | 'miles';
  timeFormat: '24h' | '12h';
  weekStart: 'monday' | 'sunday';
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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2)); // March 2024
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const { preferences } = usePreferences();

  // Replace mockWorkouts with generated data
  const mockWorkouts = generateAllWorkouts();

  // Helper function to convert meters to user's preferred unit
  const formatDistance = (meters: number): string => {
    if (preferences.distanceUnit === 'kilometers') {
      return (meters / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'km';
    } else {
      // Convert to miles (1 mile = 1609.34 meters)
      return (meters / 1609.34).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'mi';
    }
  };

  // Helper function to format time according to user's preference
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    if (preferences.timeFormat === '24h') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    }
  };

  // Helper function to get first day of month based on user's preference
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    if (preferences.weekStart === 'monday') {
      return day === 0 ? 6 : day - 1; // Convert Sunday = 0 to Sunday = 6
    } else {
      return day; // Keep Sunday as 0
    }
  };

  // Helper function to format total duration with user's time preference
  const formatTotalDuration = (durations: string[]): string => {
    const totalSeconds = durations.reduce((total, duration) => {
      const [hours, minutes] = duration.split(':').map(Number);
      return total + hours * 3600 + minutes * 60;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (preferences.timeFormat === '24h') {
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } else {
      if (hours > 0) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}h ${minutes}m ${period}`;
      }
      return `${minutes}m`;
    }
  };

  // Helper function to format single duration with user's time preference
  const formatDuration = (duration: string): string => {
    const [hours, minutes] = duration.split(':').map(Number);
    if (preferences.timeFormat === '24h') {
      return Number(hours) > 0 ? `${Number(hours)}h ${Number(minutes)}m` : `${Number(minutes)}m`;
    } else {
      if (Number(hours) > 0) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}h ${Number(minutes)}m ${period}`;
      }
      return `${Number(minutes)}m`;
    }
  };

  // Replace all instances of formatToKm with formatDistance
  const formatToKm = formatDistance;

  const handlePreviousMonth = () => {
    if (currentView === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    } else if (currentView === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (currentView === 'year') {
      const newDate = new Date(currentDate);
      newDate.setFullYear(currentDate.getFullYear() - 1);
      setCurrentDate(newDate);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };

  const handleNextMonth = () => {
    if (currentView === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    } else if (currentView === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (currentView === 'year') {
      const newDate = new Date(currentDate);
      newDate.setFullYear(currentDate.getFullYear() + 1);
      setCurrentDate(newDate);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    }
  };

  // Update navigation button labels based on view
  const getNavigationLabels = () => {
    switch (currentView) {
      case 'day':
        return {
          previous: 'Previous Day',
          next: 'Next Day'
        };
      case 'week':
        return {
          previous: 'Previous Week',
          next: 'Next Week'
        };
      case 'year':
        return {
          previous: 'Previous Year',
          next: 'Next Year'
        };
      default:
        return {
          previous: 'Previous',
          next: 'Next'
        };
    }
  };

  const navigationLabels = getNavigationLabels();

  // Helper function to format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Helper function to get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7);

  // Helper function to format date string
  const formatDateString = (date: Date | number): string => {
    if (typeof date === 'number') {
      // For month view (existing behavior)
      return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    } else {
      // For week view and other views (new behavior)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  };

  // Helper function to get total meters for a day
  const getTotalMeters = (workout: Workout): number => {
    return workout.meters.reduce((total, meters) => total + meters, 0);
  };

  // Find the longest and shortest days and calculate average
  const getWorkoutStats = () => {
    let longestDay = { date: '', meters: 0 };
    let shortestDay = { date: '', meters: Infinity };
    let longestTimeDay = { date: '', duration: 0 };
    let shortestTimeDay = { date: '', duration: Infinity };
    let totalMeters = 0;
    let totalWorkouts = 0;
    let totalDuration = 0;

    Object.entries(mockWorkouts).forEach(([date, workout]) => {
      const dayMeters = getTotalMeters(workout);
      totalMeters += dayMeters;
      totalWorkouts += workout.count;
      
      // Calculate day's duration in minutes
      const dayDuration = workout.durations.reduce((total, duration) => {
        const [hours, minutes] = duration.split(':').map(Number);
        return total + hours * 60 + minutes;
      }, 0);
      
      totalDuration += dayDuration;
      
      if (dayMeters > longestDay.meters) {
        longestDay = { date, meters: dayMeters };
      }
      if (dayMeters < shortestDay.meters) {
        shortestDay = { date, meters: dayMeters };
      }
      if (dayDuration > longestTimeDay.duration) {
        longestTimeDay = { date, duration: dayDuration };
      }
      if (dayDuration < shortestTimeDay.duration) {
        shortestTimeDay = { date, duration: dayDuration };
      }
    });

    const averageMeters = Math.round(totalMeters / totalWorkouts);
    const averageDuration = Math.round(totalDuration / totalWorkouts);

    return {
      longestDay,
      shortestDay,
      longestTimeDay,
      shortestTimeDay,
      averageMeters,
      averageDuration,
      totalWorkouts,
      totalMeters
    };
  };

  const { 
    longestDay, 
    shortestDay, 
    averageMeters, 
    longestTimeDay,
    shortestTimeDay,
    averageDuration  } = getWorkoutStats();

  // Helper function to get month week number (1-5)
  const getMonthWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Adjust Sunday to be 6
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + dayOffset) / 7);
  };

  // Helper function to calculate weekly stats
  const getWeeklyStats = () => {
    const weeklyStats: { [key: number]: { totalMeters: number; totalDuration: number; totalWorkouts: number } } = {};

    Object.entries(mockWorkouts).forEach(([date, workout]) => {
      const workoutDate = new Date(date);
      // Only include workouts from the current month
      if (workoutDate.getMonth() === currentDate.getMonth() && 
          workoutDate.getFullYear() === currentDate.getFullYear()) {
        const weekNum = getMonthWeekNumber(workoutDate);
        if (!weeklyStats[weekNum]) {
          weeklyStats[weekNum] = { totalMeters: 0, totalDuration: 0, totalWorkouts: 0 };
        }
        
        weeklyStats[weekNum].totalMeters += getTotalMeters(workout);
        weeklyStats[weekNum].totalWorkouts += workout.count;
        weeklyStats[weekNum].totalDuration += workout.durations.reduce((total, duration) => {
          const [hours, minutes] = duration.split(':').map(Number);
          return total + hours * 60 + minutes;
        }, 0);
      }
    });

    return weeklyStats;
  };

  const weeklyStats = getWeeklyStats();

  // View switching handlers
  const handleViewChange = (newView: CalendarView) => {
    if (newView === 'today') {
      setCurrentDate(new Date());
      setCurrentView('day');
    } else {
      setCurrentView(newView);
    }
  };

  // Helper function to get ISO week number

  // Helper function to format display text based on view
  const getDisplayText = () => {
    switch (currentView) {
      case 'day':
        return currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'week':
        return `Week ${getMonthWeekNumber(currentDate)}, ${formatMonthYear(currentDate)}`;
      case 'year':
        return currentDate.getFullYear().toString();
      default:
        return formatMonthYear(currentDate);
    }
  };

  // Helper function to get monthly stats
  const getMonthlyStats = (year: number, month: number) => {
    let totalWorkouts = 0;
    let totalMeters = 0;
    let totalDuration = 0;

    Object.entries(mockWorkouts).forEach(([date, workout]) => {
      const workoutDate = new Date(date);
      if (workoutDate.getFullYear() === year && workoutDate.getMonth() === month) {
        totalWorkouts += workout.count;
        totalMeters += getTotalMeters(workout);
        totalDuration += workout.durations.reduce((total, duration) => {
          const [hours, minutes] = duration.split(':').map(Number);
          return total + hours * 60 + minutes;
        }, 0);
      }
    });

    return {
      totalWorkouts,
      totalMeters,
      totalDuration
    };
  };

  // Helper function to get date string for any day in the calendar grid
  const getGridDateString = (index: number) => {
    const dayNumber = index - firstDayOfMonth + 1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Helper function to check if a month is current month
  const isCurrentMonth = (year: number, month: number) => {
    const today = new Date();
    return month === today.getMonth() && year === today.getFullYear();
  };

  // Render the appropriate view component
  const renderCalendarView = () => {
    switch (currentView) {
      case 'day':
        return (
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              {/* Day view content */}
              <div className="space-y-4">
                {mockWorkouts[formatDateString(currentDate.getDate())]?.durations.map((duration, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 text-base font-medium text-teal-100 bg-teal-600 rounded-full">
                          Workout {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                          <span className="text-gray-600">Total Distance:</span>
                          <span className="text-teal-500 font-medium ml-2">
                            {mockWorkouts[formatDateString(currentDate.getDate())]?.meters[index].toLocaleString()}m
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FaClock className="h-4 w-4 text-teal-500 mr-1.5" />
                          <span className="text-gray-600">Total Time:</span>
                          <span className="text-gray-500 ml-2">{formatDuration(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'week':
        return (
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-7 gap-4 p-4">
              {Array.from({ length: 7 }).map((_, index) => {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - currentDate.getDay() + index + 1);
                const dateString = formatDateString(date);
                const workoutData = mockWorkouts[dateString];

                return (
                  <div key={index} className={`bg-gray-50 rounded-lg p-4 flex flex-col ${
                    isToday(date) ? 'ring-2 ring-teal-500' : ''
                  }`}>
                    <div className="mb-2">
                      <h4 className={`font-medium ${
                        isToday(date) ? 'text-teal-600' : 'text-gray-900'
                      }`}>
                        {date.toLocaleDateString('default', { weekday: 'short', day: 'numeric' })}
                      </h4>
                    </div>
                    {workoutData && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="inline-flex items-center px-2 py-0.5 text-sm font-medium text-teal-100 bg-teal-600 rounded-full">
                          {workoutData.count} {workoutData.count === 1 ? 'Workout' : 'Workouts'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 text-sm font-medium text-teal-100 bg-teal-500 rounded-full">
                          {formatToKm(getTotalMeters(workoutData))}
                        </span>
                      </div>
                    )}
                    <div className="flex-grow">
                      {workoutData && workoutData.durations.map((duration, i) => (
                        <div key={i} className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center space-x-2">
                            <FaSwimmer className="h-4 w-4 text-teal-500" />
                            <span className="text-teal-600 font-medium">{workoutData.meters[i].toLocaleString()}m</span>
                            <div className="flex items-center text-gray-500">
                              <FaClock className="h-4 w-4 mx-2" />
                              <span>{formatDuration(duration)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end text-sm text-gray-500 mt-auto pt-2 border-t">
                      <div className="flex items-center">
                        <FaClock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span>{workoutData ? formatTotalDuration(workoutData.durations) : '0h 0m'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'year':
        return (
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6 p-6">
              {Array.from({ length: 12 }).map((_, index) => {
                const monthDate = new Date(currentDate.getFullYear(), index);
                const stats = getMonthlyStats(currentDate.getFullYear(), index);
                return (
                  <div key={index} className={`bg-gray-50 rounded-lg p-4 ${
                    isCurrentMonth(currentDate.getFullYear(), index) ? 'ring-2 ring-teal-500' : ''
                  }`}>
                    <h4 className={`text-xl font-bold mb-4 pb-2 border-b ${
                      isCurrentMonth(currentDate.getFullYear(), index) ? 'text-teal-600' : 'text-gray-900'
                    }`}>
                      {monthDate.toLocaleString('default', { month: 'long' })}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Workouts</span>
                        <span className="font-medium text-teal-500">{stats.totalWorkouts}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Distance</span>
                        <span className="font-medium text-teal-500">{formatToKm(stats.totalMeters)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium text-teal-500">
                          {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="bg-gray-50 py-1.5 text-center text-xs font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {Array.from({ length: weeks * 7 }).map((_, index) => {
                const dayNumber = index - firstDayOfMonth + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const dateString = getGridDateString(index);
                const workoutData = mockWorkouts[dateString];

                return (
                  <div
                    key={index}
                    className={`bg-white h-[160px] p-3 flex flex-col ${
                      isCurrentMonth ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50/50'
                    } ${isToday(date) ? 'ring-2 ring-teal-500' : ''}`}
                  >
                    <div className={`font-medium mb-1 text-base ${
                      isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                    } ${isToday(date) ? 'text-teal-600' : ''}`}>
                      {date.getDate()}
                    </div>
                    {workoutData && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-sm font-medium leading-none ${
                            isCurrentMonth ? 'text-teal-100 bg-teal-600' : 'text-teal-100 bg-teal-500'
                          } rounded-full`}>
                            {workoutData.count} workout{workoutData.count > 1 ? 's' : ''}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-sm font-medium leading-none ${
                            isCurrentMonth ? 'text-teal-100 bg-teal-500' : 'text-teal-100 bg-teal-400'
                          } rounded-full`}>
                            {formatToKm(getTotalMeters(workoutData))}
                          </span>
                        </div>
                        <div className="space-y-1 flex-grow">
                          {workoutData.durations.map((duration, i) => (
                            <div key={i} className="text-sm text-gray-500 flex items-center whitespace-nowrap">
                              <div className="w-6 flex-shrink-0 flex items-center">
                                <FaSwimmer className={`h-4 w-4 ${isCurrentMonth ? 'text-teal-500' : 'text-teal-400'}`} />
                              </div>
                              <span className={`mr-2 ${isCurrentMonth ? 'text-teal-500' : 'text-teal-400'}`}>
                                {workoutData.meters[i].toLocaleString()}m
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end text-sm text-gray-500 mt-auto">
                          <div className="flex items-center">
                            <FaClock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span>{formatTotalDuration(workoutData.durations)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
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
            <Link href="/history" className="text-teal-500 flex items-center">
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
        {/* Month Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePreviousMonth}
              className="flex items-center text-gray-600 hover:text-teal-500 transition-colors"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              {navigationLabels.previous}
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {getDisplayText()}
            </h2>
            <button 
              onClick={handleNextMonth}
              className="flex items-center text-gray-600 hover:text-teal-500 transition-colors"
            >
              {navigationLabels.next}
              <FaArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {(['today', 'day', 'week', 'month', 'year'] as const).map((view) => (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`px-4 py-2 text-sm font-medium ${
                  (currentView === view || (view === 'today' && currentView === 'day' && currentDate.toDateString() === new Date().toDateString()))
                    ? 'text-white bg-teal-500'
                    : 'text-gray-600 hover:text-teal-500 hover:bg-gray-50'
                } transition-colors ${view !== 'today' ? 'border-l border-gray-200' : ''}`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar and Weekly Summary Layout */}
        <div className="flex gap-8">
          {renderCalendarView()}
          
          {/* Weekly Summary in Month View */}
          {currentView === 'month' && (
            <div className="w-80 bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 py-3 px-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Summary</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {Object.entries(weeklyStats).map(([week, stats]) => (
                  <div key={week} className="p-4 hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{`Week ${week}`}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Workouts:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {stats.totalWorkouts}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Distance:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {formatToKm(stats.totalMeters)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaClock className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-auto font-medium text-gray-500">
                          {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Summary in Week View */}
          {currentView === 'week' && (
            <div className="w-80 bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 py-3 px-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Summary</h3>
              </div>
              <div className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Total Workouts:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            return Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .reduce((total, [_, workout]) => total + workout.count, 0);
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Total Distance:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            const totalMeters = Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .reduce((total, [_, workout]) => total + getTotalMeters(workout), 0);
                            
                            return formatToKm(totalMeters);
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaClock className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600">Total Duration:</span>
                        <span className="ml-auto font-medium text-gray-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            const totalMinutes = Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .reduce((total, [_, workout]) => {
                                return total + workout.durations.reduce((sum, duration) => {
                                  const [hours, minutes] = duration.split(':').map(Number);
                                  return sum + hours * 60 + minutes;
                                }, 0);
                              }, 0);
                            
                            return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                          })()}
                        </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Distance Records</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Longest Day:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            let longestDay = { date: '', meters: 0 };
                            Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayMeters = getTotalMeters(workout);
                                if (dayMeters > longestDay.meters) {
                                  longestDay = { date, meters: dayMeters };
                                }
                              });
                            
                            return `${formatToKm(longestDay.meters)} (${new Date(longestDay.date).toLocaleString('default', { weekday: 'short' })})`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Shortest Day:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            let shortestDay = { date: '', meters: Infinity };
                            Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayMeters = getTotalMeters(workout);
                                if (dayMeters < shortestDay.meters) {
                                  shortestDay = { date, meters: dayMeters };
                                }
                              });
                            
                            return `${formatToKm(shortestDay.meters)} (${new Date(shortestDay.date).toLocaleString('default', { weekday: 'short' })})`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaSwimmer className="h-4 w-4 text-teal-500 mr-1.5" />
                        <span className="text-gray-600">Average Distance:</span>
                        <span className="ml-auto font-medium text-teal-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            let totalMeters = 0;
                            let totalWorkouts = 0;
                            
                            Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([_, workout]) => {
                                totalMeters += getTotalMeters(workout);
                                totalWorkouts += workout.count;
                              });
                            
                            return totalWorkouts > 0 ? formatToKm(Math.round(totalMeters / totalWorkouts)) : '0km';
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Time Records</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaClock className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600">Longest Day:</span>
                        <span className="ml-auto font-medium text-gray-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            let longestDay = { date: '', duration: 0 };
                            Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayDuration = workout.durations.reduce((total, duration) => {
                                  const [hours, minutes] = duration.split(':').map(Number);
                                  return total + hours * 60 + minutes;
                                }, 0);
                                if (dayDuration > longestDay.duration) {
                                  longestDay = { date, duration: dayDuration };
                                }
                              });
                            
                            return `${Math.floor(longestDay.duration / 60)}h ${longestDay.duration % 60}m (${new Date(longestDay.date).toLocaleString('default', { weekday: 'short' })})`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaClock className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600">Shortest Day:</span>
                        <span className="ml-auto font-medium text-gray-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            let shortestDay = { date: '', duration: Infinity };
                            Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayDuration = workout.durations.reduce((total, duration) => {
                                  const [hours, minutes] = duration.split(':').map(Number);
                                  return total + hours * 60 + minutes;
                                }, 0);
                                if (dayDuration < shortestDay.duration) {
                                  shortestDay = { date, duration: dayDuration };
                                }
                              });
                            
                            return `${Math.floor(shortestDay.duration / 60)}h ${shortestDay.duration % 60}m (${new Date(shortestDay.date).toLocaleString('default', { weekday: 'short' })})`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaClock className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className="text-gray-600">Average Time:</span>
                        <span className="ml-auto font-medium text-gray-500">
                          {(() => {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            
                            let totalMinutes = 0;
                            let totalWorkouts = 0;
                            
                            Object.entries(mockWorkouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([_, workout]) => {
                                totalMinutes += workout.durations.reduce((sum, duration) => {
                                  const [hours, minutes] = duration.split(':').map(Number);
                                  return sum + hours * 60 + minutes;
                                }, 0);
                                totalWorkouts += workout.count;
                              });
                            
                            const avgMinutes = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
                            return `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Summary - Only show for month view */}
        {currentView === 'month' && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Summary</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Workouts</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {Object.entries(mockWorkouts)
                      .filter(([date]) => {
                        const workoutDate = new Date(date);
                        return workoutDate.getMonth() === currentDate.getMonth() &&
                               workoutDate.getFullYear() === currentDate.getFullYear();
                      })
                      .reduce((total, [_, workout]) => total + workout.count, 0)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Longest Day</p>
                  <p className="text-3xl font-bold text-teal-500">{formatToKm(longestDay.meters)}</p>
                  <p className="text-sm text-gray-500">{new Date(longestDay.date).toLocaleString('default', { month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Shortest Day</p>
                  <p className="text-3xl font-bold text-teal-500">{formatToKm(shortestDay.meters)}</p>
                  <p className="text-sm text-gray-500">{new Date(shortestDay.date).toLocaleString('default', { month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Average per Workout</p>
                  <p className="text-3xl font-bold text-teal-500">{formatToKm(averageMeters)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Training Time</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {(() => {
                      const totalMinutes = Object.entries(mockWorkouts)
                        .filter(([date]) => {
                          const workoutDate = new Date(date);
                          return workoutDate.getMonth() === currentDate.getMonth() &&
                                 workoutDate.getFullYear() === currentDate.getFullYear();
                        })
                        .reduce((total, [_, workout]) => {
                          return total + workout.durations.reduce((sum, duration) => {
                            const [hours, minutes] = duration.split(':').map(Number);
                            return sum + hours * 60 + minutes;
                          }, 0);
                        }, 0);
                      return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                    })()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Longest Training Day</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {Math.floor(longestTimeDay.duration / 60)}h {longestTimeDay.duration % 60}m
                  </p>
                  <p className="text-sm text-gray-500">March {longestTimeDay.date.split('-')[2]}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Shortest Training Day</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {Math.floor(shortestTimeDay.duration / 60)}h {shortestTimeDay.duration % 60}m
                  </p>
                  <p className="text-sm text-gray-500">March {shortestTimeDay.date.split('-')[2]}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Average Time per Workout</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {Math.floor(averageDuration / 60)}h {averageDuration % 60}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
