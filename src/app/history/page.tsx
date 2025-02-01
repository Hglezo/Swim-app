"use client";

import Link from 'next/link';
import { FaSwimmer, FaArrowLeft, FaArrowRight, FaHome, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaClock } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

type Workout = {
  id: string;
  text: string;
  summary: {
    totalDistance: number;
    strokeDistances: {
      freestyle: number;
      backstroke: number;
      breaststroke: number;
      butterfly: number;
      im: number;
      choice: number;
    };
    intensityDistances: {
      [key: string]: number;
    };
  };
  createdAt: string;
};

type WorkoutRecord = {
  [key: string]: Workout[];
};

type CalendarView = 'today' | 'day' | 'week' | 'month' | 'year';

interface UserPreferences {
  distanceUnit: 'kilometers' | 'miles';
  timeFormat: '24h' | '12h';
  weekStart: 'monday' | 'sunday';
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [workouts, setWorkouts] = useState<WorkoutRecord>({});
  const { preferences } = usePreferences();
  const [selectedWorkout, setSelectedWorkout] = useState<{
    workout: any;
    date: Date;
    position: { x: number; y: number };
  } | null>(null);

  // Load workouts for the current month
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const response = await fetch(`/api/workouts?date=${startDate.toISOString()}`);
        if (!response.ok) {
          throw new Error('Failed to load workouts');
        }
        
        const data = await response.json();
        setWorkouts(data.workouts || {});
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };

    loadWorkouts();
  }, [currentDate]);

  // Helper function to get total distance for a workout
  const getTotalDistance = (workout: Workout): number => {
    return workout.summary.totalDistance;
  };

  // Helper function to get total duration for a workout (placeholder since we don't store duration yet)
  const getTotalDuration = (workout: Workout): number => {
    // For now, estimate duration based on distance (assuming 2min/100m pace)
    return Math.round((workout.summary.totalDistance / 100) * 2);
  };

  // Helper function to format distance according to user preference
  const formatDistance = (meters: number): string => {
    if (preferences.distanceUnit === 'kilometers') {
      return (meters / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'km';
    } else {
      return (meters / 1609.34).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'mi';
    }
  };

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  // Get workout stats for the current view
  const getWorkoutStats = () => {
    let longestDay = { date: '', meters: 0, duration: 0 };
    let shortestDay = { date: '', meters: Infinity, duration: Infinity };
    let totalMeters = 0;
    let totalWorkouts = 0;
    let totalDuration = 0;

    Object.entries(workouts).forEach(([date, dayWorkouts]) => {
      const dayMeters = dayWorkouts.reduce((sum, workout) => sum + getTotalDistance(workout), 0);
      const dayDuration = dayWorkouts.reduce((sum, workout) => sum + getTotalDuration(workout), 0);
      totalMeters += dayMeters;
      totalDuration += dayDuration;
      totalWorkouts += dayWorkouts.length;

      if (dayMeters > longestDay.meters) {
        longestDay = { date, meters: dayMeters, duration: dayDuration };
      }
      if (dayMeters < shortestDay.meters && dayMeters > 0) {
        shortestDay = { date, meters: dayMeters, duration: dayDuration };
      }
    });

    const averageMeters = totalWorkouts > 0 ? Math.round(totalMeters / totalWorkouts) : 0;
    const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    return {
      longestDay,
      shortestDay,
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
    averageDuration,
    totalWorkouts,
    totalMeters
  } = getWorkoutStats();

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
  const formatSingleDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
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
    return getTotalDistance(workout);
  };

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

    Object.entries(workouts).forEach(([date, dayWorkouts]) => {
      const workoutDate = new Date(date);
      // Only include workouts from the current month
      if (workoutDate.getMonth() === currentDate.getMonth() && 
          workoutDate.getFullYear() === currentDate.getFullYear()) {
        const weekNum = getMonthWeekNumber(workoutDate);
        if (!weeklyStats[weekNum]) {
          weeklyStats[weekNum] = { totalMeters: 0, totalDuration: 0, totalWorkouts: 0 };
        }
        
        weeklyStats[weekNum].totalMeters += dayWorkouts.reduce((total, workout) => total + getTotalDistance(workout), 0);
        weeklyStats[weekNum].totalWorkouts += dayWorkouts.length;
        weeklyStats[weekNum].totalDuration += dayWorkouts.reduce((total, workout) => total + getTotalDuration(workout), 0);
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

    Object.entries(workouts).forEach(([date, dayWorkouts]) => {
      const workoutDate = new Date(date);
      if (workoutDate.getFullYear() === year && workoutDate.getMonth() === month) {
        totalWorkouts += dayWorkouts.length;
        totalMeters += dayWorkouts.reduce((total, workout) => total + getTotalDistance(workout), 0);
        totalDuration += dayWorkouts.reduce((total, workout) => total + getTotalDuration(workout), 0);
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

  const handleWorkoutClick = (workout: any, date: Date, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectedWorkout({
      workout,
      date,
      position: { x: rect.left, y: rect.top }
    });
  };

  const WorkoutDetailView = ({ workout, date, onClose }: { workout: any; date: Date; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 bg-teal-500 text-white flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Workout Details - {date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaSwimmer className="h-5 w-5 text-teal-500 mr-2" />
                  <span className="text-lg font-medium text-gray-900">
                    {workout.summary.totalDistance.toLocaleString()}m
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(workout.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                  {workout.text}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Stroke Distribution</h4>
                  {Object.entries(workout.summary.strokeDistances).map(([stroke, distance]) => (
                    typeof distance === 'number' && distance > 0 && (
                      <div key={stroke} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{stroke}</span>
                        <span className="font-medium text-gray-900">{distance}m</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Intensity Distribution</h4>
                  {Object.entries(workout.summary.intensityDistances).map(([intensity, distance]) => (
                    typeof distance === 'number' && (
                      <div key={intensity} className="flex justify-between text-sm">
                        <span className="text-gray-600">{intensity}</span>
                        <span className="font-medium text-gray-900">{distance}m</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                {workouts[formatDateString(currentDate.getDate())]?.map((workout, index) => (
                  <div key={workout.id} className="bg-gray-50 rounded-lg p-4">
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
                            {workout.summary.totalDistance.toLocaleString()}m
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FaClock className="h-4 w-4 text-teal-500 mr-1.5" />
                          <span className="text-gray-600">Estimated Time:</span>
                          <span className="text-gray-500 ml-2">{formatDuration(getTotalDuration(workout))}</span>
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
                const workoutData = workouts[dateString];

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
                          {workoutData.length} {workoutData.length === 1 ? 'Workout' : 'Workouts'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 text-sm font-medium text-teal-100 bg-teal-500 rounded-full">
                          {formatToKm(getTotalMeters(workoutData[0]))}
                        </span>
                      </div>
                    )}
                    <div className="flex-grow">
                      {workoutData && workoutData.map((workout, i) => (
                        <div key={i} className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center space-x-2">
                            <FaSwimmer className="h-4 w-4 text-teal-500" />
                            <span className="text-teal-600 font-medium">{workout.summary.totalDistance.toLocaleString()}m</span>
                            <div className="flex items-center text-gray-500">
                              <FaClock className="h-4 w-4 mx-2" />
                              <span>{formatDuration(getTotalDuration(workout))}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end text-sm text-gray-500 mt-auto pt-2 border-t">
                      <div className="flex items-center">
                        <FaClock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span>{workoutData ? formatTotalDuration(workoutData.map(workout => formatDuration(getTotalDuration(workout)))) : '0h 0m'}</span>
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
                const workoutData = workouts[dateString];

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
                            {workoutData.length} workout{workoutData.length > 1 ? 's' : ''}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-sm font-medium leading-none ${
                            isCurrentMonth ? 'text-teal-100 bg-teal-500' : 'text-teal-100 bg-teal-400'
                          } rounded-full`}>
                            {formatToKm(workoutData.reduce((total, w) => total + w.summary.totalDistance, 0))}
                          </span>
                        </div>
                        <div className="space-y-1 flex-grow">
                          {workoutData.map((workout, i) => (
                            <div 
                              key={i} 
                              className="text-sm text-gray-500 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer transition-colors"
                              onClick={(e) => handleWorkoutClick(workout, date, e)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FaSwimmer className={`h-4 w-4 ${isCurrentMonth ? 'text-teal-500' : 'text-teal-400'} mr-2`} />
                                  <span className={`${isCurrentMonth ? 'text-teal-500' : 'text-teal-400'} font-medium`}>
                                    {workout.summary.totalDistance.toLocaleString()}m
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-2 pt-2 border-t">
                          <div className="flex items-center">
                            <FaSwimmer className="h-3 w-3 mr-1.5 flex-shrink-0 text-teal-500" />
                            <span>{formatToKm(workoutData.reduce((total, w) => total + w.summary.totalDistance, 0))}</span>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span>{formatDuration(workoutData.reduce((total, w) => total + getTotalDuration(w), 0))}</span>
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
                            
                            return Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .reduce((total, [_, workout]) => total + workout.length, 0);
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
                            
                            const totalMeters = Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .reduce((total, [_, workout]) => total + getTotalMeters(workout[0]), 0);
                            
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
                            
                            const totalMinutes = Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .reduce((total, [_, workout]) => {
                                return total + workout.reduce((sum, w) => sum + getTotalDuration(w), 0);
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
                            Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayMeters = getTotalMeters(workout[0]);
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
                            Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayMeters = getTotalMeters(workout[0]);
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
                            
                            Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([_, workout]) => {
                                totalMeters += getTotalMeters(workout[0]);
                                totalWorkouts += workout.length;
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
                            Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayDuration = workout.reduce((total, w) => total + getTotalDuration(w), 0);
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
                            Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([date, workout]) => {
                                const dayDuration = workout.reduce((total, w) => total + getTotalDuration(w), 0);
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
                            
                            Object.entries(workouts)
                              .filter(([date]) => {
                                const workoutDate = new Date(date);
                                return workoutDate >= weekStart && workoutDate <= weekEnd;
                              })
                              .forEach(([_, workout]) => {
                                totalMinutes += workout.reduce((sum, w) => sum + getTotalDuration(w), 0);
                                totalWorkouts += workout.length;
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
                    {Object.entries(workouts)
                      .filter(([date]) => {
                        const workoutDate = new Date(date);
                        return workoutDate.getMonth() === currentDate.getMonth() &&
                               workoutDate.getFullYear() === currentDate.getFullYear();
                      })
                      .reduce((total, [_, workout]) => total + workout.length, 0)}
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
                      const totalMinutes = Object.entries(workouts)
                        .filter(([date]) => {
                          const workoutDate = new Date(date);
                          return workoutDate.getMonth() === currentDate.getMonth() &&
                                 workoutDate.getFullYear() === currentDate.getFullYear();
                        })
                        .reduce((total, [_, workout]) => {
                          return total + workout.reduce((sum, w) => sum + getTotalDuration(w), 0);
                        }, 0);
                      return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                    })()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Longest Training Day</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {Math.floor(longestDay.duration / 60)}h {longestDay.duration % 60}m
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(longestDay.date).toLocaleString('default', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Shortest Training Day</p>
                  <p className="text-3xl font-bold text-teal-500">
                    {Math.floor(shortestDay.duration / 60)}h {shortestDay.duration % 60}m
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(shortestDay.date).toLocaleString('default', { month: 'long', day: 'numeric' })}
                  </p>
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

        {selectedWorkout && (
          <WorkoutDetailView
            workout={selectedWorkout.workout}
            date={selectedWorkout.date}
            onClose={() => setSelectedWorkout(null)}
          />
        )}
      </main>
    </div>
  );
} 
