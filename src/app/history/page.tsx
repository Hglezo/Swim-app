"use client";

import Link from 'next/link';
import { FaSwimmer, FaArrowLeft, FaArrowRight, FaHome, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaClock, FaTrash, FaTimes, FaEdit } from 'react-icons/fa';
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

type SelectedWorkout = {
  id: string;
  date: string;
  text: string;
  summary: {
    totalDistance: number;
    strokeDistances: {
      [key: string]: number;
    };
  };
} | null;

// Helper function to format to km
const formatToKm = (meters: number) => {
  return `${(meters / 1000).toFixed(1)}km`;
};

// Helper function to format date string
const formatDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const WorkoutDetailModal = ({ 
  workout, 
  onClose, 
  onDelete,
  poolType,
  setWorkouts,
  updateWorkoutInPlace 
}: { 
  workout: SelectedWorkout;
  onClose: () => void;
  onDelete: () => void;
  poolType: string;
  setWorkouts: (workouts: WorkoutRecord) => void;
  updateWorkoutInPlace: (date: string, id: string, text: string, summary: any) => void;
}) => {
  if (!workout) return null;

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(workout.text);
  const [currentSummary, setCurrentSummary] = useState(workout.summary);
  const [isParsingWorkout, setIsParsingWorkout] = useState(false);

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete();
    } else {
      setShowConfirmDelete(true);
    }
  };

  // Parse workout text and update summary
  const parseWorkout = async (text: string) => {
    try {
      setIsParsingWorkout(true);
      const response = await fetch('/api/parse-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout: text,
          poolType,
          intensitySystem: 'polar'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse workout');
      }

      const data = await response.json();
      const newSummary = {
        totalDistance: data.totalDistance,
        strokeDistances: data.strokeDistances
      };
      setCurrentSummary(newSummary);
      
      // Update the workout in the calendar view immediately
      updateWorkoutInPlace(workout.date, workout.id, text, newSummary);
    } catch (error) {
      console.error('Error parsing workout:', error);
    } finally {
      setIsParsingWorkout(false);
    }
  };

  // Debounce the parse function to avoid too many API calls
  useEffect(() => {
    if (isEditing) {
      const timeoutId = setTimeout(() => {
        parseWorkout(editedText);
      }, 500); // Wait 500ms after last edit before parsing

      return () => clearTimeout(timeoutId);
    }
  }, [editedText, isEditing, poolType]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/workouts?date=${workout.date}&id=${workout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editedText,
          summary: currentSummary
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update workout');
      }

      // Refresh workouts data
      const startDate = new Date(workout.date);
      const refreshResponse = await fetch(`/api/workouts?date=${startDate.toISOString()}`);
      if (!refreshResponse.ok) {
        throw new Error('Failed to reload workouts');
      }
      const data = await refreshResponse.json();
      
      // Update both the local workout text and the workouts state
      workout.text = editedText;
      workout.summary = currentSummary;
      setWorkouts(data.workouts || {});
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Workout Details
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Total Distance</span>
                <span className="text-lg font-semibold text-teal-600">
                  {currentSummary.totalDistance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                </span>
              </div>
              
              {/* Stroke distances */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Distance by Stroke</h4>
                <div className="space-y-2">
                  {Object.entries(currentSummary.strokeDistances)
                    .filter(([_, distance]) => distance > 0)
                    .map(([stroke, distance]) => (
                      <div key={stroke} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{stroke}</span>
                        <span className="font-medium text-gray-900">
                          {distance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Workout text */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Workout Details
                {isParsingWorkout && (
                  <span className="ml-2 text-xs text-gray-500">Updating summary...</span>
                )}
              </h4>
              <div className={`rounded-lg ${isEditing ? 'bg-white p-1' : 'bg-gray-50 p-4'}`}>
                {isEditing ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-48 p-3 text-sm font-mono text-gray-800 bg-white border-2 border-teal-500 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
                    placeholder="Enter your workout details here..."
                  />
                ) : (
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                    {workout.text}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Bottom actions bar with edit and delete buttons */}
          <div className="mt-6 flex justify-between items-center border-t pt-4">
            {/* Edit/Save button */}
            {isEditing ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(workout.text);
                    setCurrentSummary(workout.summary);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                >
                  <FaEdit className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
              >
                <FaEdit className="h-4 w-4 mr-2" />
                Edit Workout
              </button>
            )}

            {/* Delete button and confirmation */}
            {showConfirmDelete ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Are you sure?</span>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  <FaTrash className="h-4 w-4 mr-2" />
                  Confirm Delete
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                <FaTrash className="h-4 w-4 mr-2" />
                Delete Workout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [workouts, setWorkouts] = useState<WorkoutRecord>({});
  const { preferences } = usePreferences();
  const [selectedWorkout, setSelectedWorkout] = useState<SelectedWorkout>(null);
  const [poolType, setPoolType] = useState<'SCY' | 'SCM' | 'LCM'>('LCM');

  // Load workouts for the current month
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
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

  // Helper function to update a workout in place
  const updateWorkoutInPlace = (date: string, id: string, text: string, summary: any) => {
    setWorkouts(prevWorkouts => {
      const newWorkouts = { ...prevWorkouts };
      if (newWorkouts[date]) {
        const workoutIndex = newWorkouts[date].findIndex(w => w.id === id);
        if (workoutIndex !== -1) {
          newWorkouts[date] = [...newWorkouts[date]];
          newWorkouts[date][workoutIndex] = {
            ...newWorkouts[date][workoutIndex],
            text,
            summary
          };
        }
      }
      return newWorkouts;
    });
  };

  // Helper function to handle workout deletion
  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;

    try {
      const response = await fetch(
        `/api/workouts?date=${selectedWorkout.date}&id=${selectedWorkout.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      // Refresh workouts data
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const response2 = await fetch(`/api/workouts?date=${startDate.toISOString()}`);
      if (!response2.ok) {
        throw new Error('Failed to reload workouts');
      }
      const data = await response2.json();
      setWorkouts(data.workouts || {});

      // Close the modal
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  // Helper function to get total duration for a workout
  const getTotalDuration = (workout: Workout): number => {
    // For now, estimate duration based on distance (assuming 2min/100m pace)
    return Math.round((workout.summary.totalDistance / 100) * 2);
  };

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
  };

  // Calculate first day of month and number of weeks
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((firstDayOfMonth + lastDayOfMonth) / 7);

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Add the renderWorkout function
  const renderWorkout = (workout: Workout, isCurrentMonth: boolean, dateString: string) => (
    <div 
      key={workout.id} 
      className={`text-sm ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors`}
      onClick={() => setSelectedWorkout({ ...workout, date: dateString })}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FaSwimmer className={`h-4 w-4 ${isCurrentMonth ? 'text-teal-500' : 'text-teal-400'} mr-2`} />
          <span className={`${isCurrentMonth ? 'text-gray-600' : 'text-gray-400'}`}>
            {workout.summary.totalDistance.toLocaleString()}m
          </span>
        </div>
        <span className="text-sm text-gray-500">{formatDuration(getTotalDuration(workout))}</span>
      </div>
    </div>
  );

  // Render the appropriate view component
  const renderCalendarView = () => {
    switch (currentView) {
      case 'day':
        const dayWorkouts = workouts[formatDateString(currentDate)];
        return (
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {dayWorkouts?.map((workout) => renderWorkout(workout, true, formatDateString(currentDate)))}
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
                const dayWorkouts = workouts[dateString];

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
                    <div className="flex-grow space-y-2">
                      {dayWorkouts?.map((workout) => renderWorkout(workout, true, dateString))}
                    </div>
                    {dayWorkouts && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-500">
                        <div className="flex justify-between">
                          <span>{dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''}</span>
                          <span>{formatToKm(dayWorkouts.reduce((total, w) => total + w.summary.totalDistance, 0))}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default: // month view
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
                const dateString = formatDateString(date);
                const dayWorkouts = workouts[dateString];

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
                    {dayWorkouts && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-sm font-medium leading-none ${
                            isCurrentMonth ? 'text-teal-100 bg-teal-600' : 'text-teal-100 bg-teal-500'
                          } rounded-full`}>
                            {dayWorkouts.length} workout{dayWorkouts.length > 1 ? 's' : ''}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-sm font-medium leading-none ${
                            isCurrentMonth ? 'text-teal-100 bg-teal-500' : 'text-teal-100 bg-teal-400'
                          } rounded-full`}>
                            {formatToKm(dayWorkouts.reduce((total, w) => total + w.summary.totalDistance, 0))}
                          </span>
                        </div>
                        <div className="space-y-1 flex-grow">
                          {dayWorkouts.map((workout) => renderWorkout(workout, isCurrentMonth, dateString))}
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-2 pt-2 border-t">
                          <div className="flex items-center">
                            <FaSwimmer className="h-3 w-3 mr-1.5 flex-shrink-0 text-teal-500" />
                            <span>{formatToKm(dayWorkouts.reduce((total, w) => total + w.summary.totalDistance, 0))}</span>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            <span>{formatDuration(dayWorkouts.reduce((total, w) => total + getTotalDuration(w), 0))}</span>
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
            <Link href="/logout" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View selection buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('day')}
              className={`px-4 py-2 rounded-md ${
                currentView === 'day' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-4 py-2 rounded-md ${
                currentView === 'week' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-4 py-2 rounded-md ${
                currentView === 'month' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Calendar view */}
        {renderCalendarView()}

        {/* Workout detail modal */}
        {selectedWorkout && (
          <WorkoutDetailModal
            workout={selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
            onDelete={handleDeleteWorkout}
            poolType={poolType}
            setWorkouts={setWorkouts}
            updateWorkoutInPlace={updateWorkoutInPlace}
          />
        )}
      </main>
    </div>
  );
} 
