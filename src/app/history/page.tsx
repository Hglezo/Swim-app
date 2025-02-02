"use client";

import Link from 'next/link';
import { FaSwimmer, FaArrowLeft, FaArrowRight, FaHome, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaClock, FaTrash, FaTimes, FaEdit } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import DailySummary from './components/DailySummary';
import WeeklySummary from './components/WeeklySummary';
import MonthSummary from './components/MonthSummary';
import YearSummary from './components/YearSummary';

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

type SelectedWorkout = (Workout & { date: string }) | null;

// Helper function to format to km
const formatToKm = (meters: number) => {
  return `${(meters / 1000).toFixed(1)}km`;
};

// Helper function to format date string
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Add helper functions for duration
const getTotalDuration = (workout: Workout): number => {
  // Assuming each workout takes about 2 minutes per 100m on average
  return Math.round((workout.summary.totalDistance / 100) * 2 * 60);
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
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
  const { isDark } = useTheme();
  if (!workout) return null;

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(workout.text);
  const [currentSummary, setCurrentSummary] = useState(workout.summary);
  const [isParsingWorkout, setIsParsingWorkout] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [intensitySystem] = useState<'polar' | 'international'>('polar');

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
      // Don't attempt to parse if text is empty
      if (!text.trim()) {
        setCurrentSummary({
          totalDistance: 0,
          strokeDistances: {
            freestyle: 0,
            backstroke: 0,
            breaststroke: 0,
            butterfly: 0,
            im: 0,
            choice: 0
          },
          intensityDistances: {}
        });
        setParseError(null);
        return;
      }

      setIsParsingWorkout(true);
      setParseError(null);
      const response = await fetch('/api/parse-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout: text,
          poolType,
          intensitySystem
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse workout');
      }

      const data = await response.json();
      const newSummary = {
        totalDistance: data.totalDistance,
        strokeDistances: data.strokeDistances,
        intensityDistances: data.intensityDistances || {}
      };
      setCurrentSummary(newSummary);
      
      // Update the workout in the calendar view immediately
      if (workout.id) { // Only update if it's an existing workout
        updateWorkoutInPlace(workout.date, workout.id, text, newSummary);
      }
    } catch (error) {
      console.error('Error parsing workout:', error);
      setParseError(error instanceof Error ? error.message : 'Failed to parse workout');
    } finally {
      setIsParsingWorkout(false);
    }
  };

  // Debounce the parse function to avoid too many API calls
  useEffect(() => {
    if (isEditing) {
      const timeoutId = setTimeout(() => {
        parseWorkout(editedText);
      }, 200); // Wait 200ms after last edit before parsing

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
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full mx-4 relative transition-colors duration-200`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
        >
          <FaTimes className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
              Workout Details
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>Total Distance</span>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                  {currentSummary.totalDistance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                </span>
              </div>
              
              {/* Stroke distances */}
              <div className="mb-6">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-200`}>Distance by Stroke</h3>
                <div className="space-y-2">
                  {Object.entries(currentSummary.strokeDistances)
                    .filter(([_, distance]) => distance > 0)
                    .map(([stroke, distance]) => (
                      <div key={stroke} className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} capitalize transition-colors duration-200`}>{stroke}:</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                          {distance}m
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Distance by Intensity */}
              {Object.keys(currentSummary.intensityDistances || {}).length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-200`}>Distance by Intensity</h3>
                  <div className="space-y-2">
                    {Object.entries(currentSummary.intensityDistances || {}).map(([intensity, distance]) => (
                      <div key={intensity} className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>{intensity}:</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                          {(distance as number).toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workout text */}
            <div>
              <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
                Workout Details
                {isParsingWorkout && (
                  <span className="ml-2 text-xs text-gray-500">Updating summary...</span>
                )}
              </h4>
              <div className={`rounded-lg ${isEditing ? (isDark ? 'bg-gray-700' : 'bg-white') : (isDark ? 'bg-gray-700' : 'bg-gray-50')} p-4 transition-colors duration-200`}>
                {isEditing ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className={`w-full h-48 p-3 text-sm font-mono rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y ${
                      isDark 
                        ? 'bg-gray-800 text-gray-100 border-2 border-gray-600' 
                        : 'text-gray-800 bg-white border-2 border-teal-500'
                    }`}
                    placeholder="Enter your workout details here..."
                  />
                ) : (
                  <pre className={`text-sm whitespace-pre-wrap font-mono ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {workout.text}
                  </pre>
                )}
              </div>
              {parseError && (
                <div className={`mt-2 text-sm font-medium p-3 rounded-md ${
                  isDark ? 'text-red-400 bg-red-900/50' : 'text-red-500 bg-red-50'
                }`}>
                  ⚠️ {parseError}
                </div>
              )}
            </div>

            {/* Format Examples */}
            {isEditing && (
              <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>Format Examples:</h3>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                  <p>Stroke Types: drill/dr, kick/k, scull</p>
                  <p>Heart Rate: hr150-hr190 (by 5)</p>
                  <p>Heart Rate by 10: hr24-hr30</p>
                  <p>Standard: Easy, Moderate, Strong, Fast</p>
                  <p>Polar Zones: Grey, Blue, Green, Orange, Red</p>
                </div>
              </div>
            )}

            {/* Bottom actions bar with edit and delete buttons */}
            <div className={`mt-6 flex justify-between items-center border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Edit/Save button */}
              {isEditing ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedText(workout.text);
                      setCurrentSummary(workout.summary);
                      setParseError(null);
                    }}
                    className={`flex items-center px-4 py-2 text-sm font-medium ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-600 hover:text-gray-800'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isDark 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <FaEdit className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isDark 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <FaEdit className="h-4 w-4 mr-2" />
                  Edit Workout
                </button>
              )}

              {/* Delete button and confirmation */}
              {showConfirmDelete ? (
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>Are you sure?</span>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className={`px-4 py-2 text-sm font-medium ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isDark 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <FaTrash className="h-4 w-4 mr-2" />
                    Confirm Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <FaTrash className="h-4 w-4 mr-2" />
                  Delete Workout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add a new component for expandable workout
const ExpandableWorkout = ({ 
  workout, 
  date,
  isExpanded,
  onToggle,
  onEdit,
  onDelete 
}: { 
  workout: Workout;
  date: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <FaSwimmer className="h-5 w-5 text-teal-500" />
          <span className="font-medium text-gray-900">
            {formatToKm(workout.summary.totalDistance)}
          </span>
          <div className="flex items-center text-gray-500">
            <FaClock className="h-4 w-4 mr-1" />
            {formatDuration(getTotalDuration(workout))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-teal-600"
          >
            <FaEdit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
        isExpanded ? 'max-h-[500px] border-t' : 'max-h-0'
      }`}>
        <div className="p-4 bg-gray-50">
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
            {workout.text}
          </pre>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Distance by Stroke</h4>
              <div className="space-y-1">
                {Object.entries(workout.summary.strokeDistances)
                  .filter(([_, distance]) => distance > 0)
                  .map(([stroke, distance]) => (
                    <div key={stroke} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{stroke}:</span>
                      <span className="font-medium text-gray-900">{distance}m</span>
                    </div>
                  ))
                }
              </div>
            </div>
            {Object.keys(workout.summary.intensityDistances || {}).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Distance by Intensity</h4>
                <div className="space-y-1">
                  {Object.entries(workout.summary.intensityDistances || {}).map(([intensity, distance]) => (
                    <div key={intensity} className="flex justify-between text-sm">
                      <span className="text-gray-600">{intensity}:</span>
                      <span className="font-medium text-gray-900">{distance}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const { preferences } = usePreferences();
  const { isDark } = useTheme();
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<WorkoutRecord>({});
  const [selectedWorkout, setSelectedWorkout] = useState<SelectedWorkout>(null);
  const [poolType, setPoolType] = useState('SCM'); // SCM = Short Course Meters
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Load workouts for the current month
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
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
  }, [selectedDate]);

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
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
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

  // Calculate first day of month and number of weeks
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
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
        <div className="flex items-center text-gray-500">
          <FaClock className="h-3 w-3 mr-0.5" />
          {formatDuration(getTotalDuration(workout))}
        </div>
      </div>
    </div>
  );

  // Add navigation functions
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  // Helper function to get workouts for a specific week
  const getWeekWorkouts = (weekStartDate: Date) => {
    const weekWorkouts = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + index);
      const dateString = formatDateString(date);
      return workouts[dateString] || [];
    }).flat();
    return weekWorkouts;
  };

  // Modify the renderCalendarView function to handle 'today' view
  const renderCalendarView = () => {
    switch (view) {
      case 'today':
      case 'day': {
        const dayWorkouts = workouts[formatDateString(selectedDate)] || [];
        const isTodays = view === 'today' && isToday(selectedDate);
        
        return (
          <div className="space-y-6">
            {/* Day Navigation */}
            <div className={`flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 w-fit mx-auto transition-colors duration-200`}>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() - 1);
                  setSelectedDate(newDate);
                  if (view === 'today') {
                    setView('day');
                  }
                }}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowLeft className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mx-4 transition-colors duration-200`}>
                {isTodays ? 'Today' : selectedDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() + 1);
                  setSelectedDate(newDate);
                  if (view === 'today') {
                    setView('day');
                  }
                }}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowRight className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
            </div>

            {/* Workouts List with Expandable Details */}
            <div className="space-y-4">
              {dayWorkouts.map((workout) => (
                <div key={workout.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 transition-colors duration-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaSwimmer className={`h-4 w-4 text-teal-500 mr-2`} />
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {workout.summary.totalDistance.toLocaleString()}m
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FaClock className="h-3 w-3 mr-0.5" />
                      {formatDuration(getTotalDuration(workout))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Workout Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedWorkout({ 
                  id: '', 
                  text: '', 
                  summary: {
                    totalDistance: 0,
                    strokeDistances: {
                      freestyle: 0,
                      backstroke: 0,
                      breaststroke: 0,
                      butterfly: 0,
                      im: 0,
                      choice: 0
                    },
                    intensityDistances: {}
                  },
                  createdAt: new Date().toISOString(),
                  date: formatDateString(selectedDate)
                })}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'text-teal-400 hover:text-teal-300' 
                    : 'text-teal-600 hover:text-teal-500'
                } transition-colors duration-200`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Workout
              </button>
            </div>

            {/* Daily Summary */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 transition-colors duration-200`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Daily Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Distance</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>
                    {dayWorkouts.length ? formatToKm(dayWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0)) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Time</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>
                    {dayWorkouts.length ? formatDuration(dayWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0)) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Workouts</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{dayWorkouts.length || '0'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'week': {
        const weekWorkouts = Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(selectedDate);
          date.setDate(selectedDate.getDate() - selectedDate.getDay() + index + 1);
          const dateString = formatDateString(date);
          return workouts[dateString] || [];
        }).flat();

        return (
          <div className="space-y-6">
            {/* Week Navigation */}
            <div className={`flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 w-fit mx-auto transition-colors duration-200`}>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowLeft className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mx-4 transition-colors duration-200`}>
                {(() => {
                  const weekStart = new Date(selectedDate);
                  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  const weekNumber = Math.ceil((weekStart.getDate() - weekStart.getDay() + 1) / 7);
                  return `${weekStart.toLocaleDateString('default', { month: 'long' })} Week ${weekNumber} (${
                    weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} – ${
                    weekEnd.toLocaleDateString('default', { month: 'short', day: 'numeric' })})`
                })()}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowRight className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* Main Week View */}
              <div className={`col-span-9 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden transition-colors duration-200`}>
                <div className="grid grid-cols-1">
                  {Array.from({ length: 7 }).map((_, index) => {
                    const date = new Date(selectedDate);
                    date.setDate(selectedDate.getDate() - selectedDate.getDay() + index + 1);
                    const dateString = formatDateString(date);
                    const dayWorkouts = workouts[dateString] || [];

                    return (
                      <div key={index} 
                        className={`${
                          isToday(date) ? isDark ? 'bg-teal-900/20' : 'bg-teal-50' : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        } relative group transition-colors duration-200 p-4 ${
                          index !== 6 ? isDark ? 'border-b border-gray-700/50' : 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-medium ${
                            isToday(date) ? isDark ? 'text-teal-400' : 'text-teal-600' : isDark ? 'text-white' : 'text-gray-900'
                          } transition-colors duration-200`}>
                            {date.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h4>
                          {/* Add Workout Button */}
                          <button
                            onClick={() => setSelectedWorkout({ 
                              id: '', 
                              text: '', 
                              summary: {
                                totalDistance: 0,
                                strokeDistances: {
                                  freestyle: 0,
                                  backstroke: 0,
                                  breaststroke: 0,
                                  butterfly: 0,
                                  im: 0,
                                  choice: 0
                                },
                                intensityDistances: {}
                              },
                              createdAt: new Date().toISOString(),
                              date: dateString
                            })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-teal-50 rounded-full text-teal-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        {dayWorkouts.length > 0 && (
                          <div className="flex-1 flex flex-col space-y-1">
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-teal-100 ${isDark ? 'bg-teal-600' : 'bg-teal-500'} rounded-full transition-colors duration-200`}>
                                {dayWorkouts.length}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-teal-100 ${isDark ? 'bg-teal-500' : 'bg-teal-400'} rounded-full transition-colors duration-200`}>
                                {formatToKm(dayWorkouts.reduce((total, w) => total + w.summary.totalDistance, 0))}
                              </span>
                            </div>
                            {/* Workouts List */}
                            <div className="space-y-1 overflow-y-auto max-h-[80px]">
                              {dayWorkouts.map((workout) => (
                                <div
                                  key={workout.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkout({ ...workout, date: dateString });
                                  }}
                                  className={`text-xs ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded p-1.5 cursor-pointer transition-colors duration-200`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                                      {formatToKm(workout.summary.totalDistance)}
                                    </span>
                                    <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                                      <FaClock className="h-3 w-3 mr-0.5" />
                                      {formatDuration(getTotalDuration(workout))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Summaries */}
              <div className="col-span-3 space-y-4">
                <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} border-b ${isDark ? 'border-gray-700' : 'border-teal-100'} pb-1 px-3 transition-colors duration-200`}>
                  Daily Summary
                </div>
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = new Date(selectedDate);
                  date.setDate(selectedDate.getDate() - selectedDate.getDay() + index + 1);
                  const dateString = formatDateString(date);
                  const dayWorkouts = workouts[dateString] || [];

                  const totalDistance = dayWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0);
                  const totalTime = dayWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0);

                  return (
                    <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-3 transition-colors duration-200`}>
                      <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 transition-colors duration-200`}>
                        {date.toLocaleDateString('default', { weekday: 'short' })}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Workouts:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{dayWorkouts.length || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Distance:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{dayWorkouts.length ? formatToKm(totalDistance) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Time:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{dayWorkouts.length ? formatDuration(totalTime) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Week Summary */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 transition-colors duration-200`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>
                {(() => {
                  const weekStart = new Date(selectedDate);
                  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  const weekNumber = Math.ceil((weekStart.getDate() - weekStart.getDay() + 1) / 7);
                  return `${weekStart.toLocaleDateString('default', { month: 'long' })} Week ${weekNumber} (${
                    weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} – ${
                    weekEnd.toLocaleDateString('default', { month: 'short', day: 'numeric' })}) Summary`
                })()}
              </h3>
              <div className="grid grid-cols-5 gap-6">
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Workouts</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{weekWorkouts.length}</div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Distance</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>
                    {formatToKm(weekWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0))}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Time</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {formatDuration(weekWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0))}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Avg Distance/Workout</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {weekWorkouts.length ? formatToKm(weekWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0) / weekWorkouts.length) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Avg Time/Workout</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {weekWorkouts.length ? formatDuration(weekWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0) / weekWorkouts.length) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'year': {
        const yearWorkouts = Object.values(workouts).flat();
        const currentYearWorkouts = yearWorkouts.filter(workout => {
          const workoutDate = new Date(workout.createdAt);
          return workoutDate.getFullYear() === selectedDate.getFullYear();
        });

        // Calculate yearly stats
        const totalDistance = currentYearWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0);
        const totalTime = currentYearWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0);
        const avgDistance = currentYearWorkouts.length > 0 ? totalDistance / currentYearWorkouts.length : 0;
        const avgTime = currentYearWorkouts.length > 0 ? totalTime / currentYearWorkouts.length : 0;
        const daysWithWorkouts = new Set(currentYearWorkouts.map(w => w.createdAt.split('T')[0])).size;
        const daysInYear = new Date(selectedDate.getFullYear(), 11, 31).getDate() + 
                          new Date(selectedDate.getFullYear(), 10, 30).getDate() + 
                          new Date(selectedDate.getFullYear(), 9, 31).getDate() + 
                          new Date(selectedDate.getFullYear(), 8, 30).getDate() + 
                          new Date(selectedDate.getFullYear(), 7, 31).getDate() + 
                          new Date(selectedDate.getFullYear(), 6, 31).getDate() + 
                          new Date(selectedDate.getFullYear(), 5, 30).getDate() + 
                          new Date(selectedDate.getFullYear(), 4, 31).getDate() + 
                          new Date(selectedDate.getFullYear(), 3, 30).getDate() + 
                          new Date(selectedDate.getFullYear(), 2, 31).getDate() + 
                          new Date(selectedDate.getFullYear(), 1, new Date(selectedDate.getFullYear(), 2, 0).getDate()).getDate() + 
                          new Date(selectedDate.getFullYear(), 0, 31).getDate();

        return (
          <div className="space-y-6">
            {/* Year Navigation */}
            <div className={`flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 w-fit mx-auto transition-colors duration-200`}>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate.getFullYear() - 1, selectedDate.getMonth(), 1);
                  setSelectedDate(newDate);
                }}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowLeft className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mx-4 transition-colors duration-200`}>
                {selectedDate.getFullYear()}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate.getFullYear() + 1, selectedDate.getMonth(), 1);
                  setSelectedDate(newDate);
                }}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowRight className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
            </div>

            {/* Year Calendar Grid */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden transition-colors duration-200`}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-6">
                {Array.from({ length: 12 }).map((_, monthIndex) => {
                  const monthStart = new Date(selectedDate.getFullYear(), monthIndex, 1);
                  const monthWorkouts = yearWorkouts.filter(workout => {
                    const workoutDate = new Date(workout.createdAt);
                    return workoutDate.getMonth() === monthIndex && 
                           workoutDate.getFullYear() === selectedDate.getFullYear();
                  });
                  
                  const totalDistance = monthWorkouts.reduce((sum, workout) => 
                    sum + workout.summary.totalDistance, 0
                  );
                  
                  const totalTime = monthWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0);
                  const avgDistance = monthWorkouts.length > 0 ? totalDistance / monthWorkouts.length : 0;
                  const avgTime = monthWorkouts.length > 0 ? totalTime / monthWorkouts.length : 0;

                  return (
                    <div
                      key={monthIndex}
                      className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 transition-colors duration-200`}
                    >
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white hover:text-teal-400' : 'text-gray-900 hover:text-teal-600'} mb-3 cursor-pointer transition-colors duration-200`}
                          onClick={() => {
                            setSelectedDate(monthStart);
                            setView('month');
                          }}>
                        {monthStart.toLocaleDateString('default', { month: 'long' })}
                      </h3>
                      <div className="space-y-2">
                        <div className={`text-sm font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'} border-b ${isDark ? 'border-gray-600' : 'border-teal-100'} pb-1 transition-colors duration-200`}>Summary</div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Workouts:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{monthWorkouts.length || '0'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Distance:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{monthWorkouts.length ? formatToKm(totalDistance) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Time:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{monthWorkouts.length ? formatDuration(totalTime) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Avg Distance:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{monthWorkouts.length ? formatToKm(avgDistance) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Avg Time:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{monthWorkouts.length ? formatDuration(avgTime) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Year Summary and Chart */}
            <div className="grid grid-cols-12 gap-6">
              {/* Year Summary */}
              <div className={`col-span-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 transition-colors duration-200`}>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>{selectedDate.getFullYear()} Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Total Workouts</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{currentYearWorkouts.length}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Total Distance</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{formatToKm(totalDistance)}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Total Time</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{formatDuration(totalTime)}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Days with Workouts</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{daysWithWorkouts}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Days without Workouts</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{daysInYear - daysWithWorkouts}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Avg Distance/Workout</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{formatToKm(avgDistance)}</div>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>Avg Time/Workout</div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                        {formatDuration(avgTime)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Distance Chart */}
              <div className={`col-span-8 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 transition-colors duration-200`}>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>Monthly Swimming Distance</h3>
                <div className="h-[300px]">
                  <YearSummary 
                    workouts={currentYearWorkouts} 
                    poolType={poolType} 
                    year={selectedDate.getFullYear()} 
                    showStatsOnly={false}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      default: { // month view
        const monthWorkouts = Object.values(workouts).flat();
        const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const weeksInMonth = Math.ceil((firstDayOfMonth + new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()) / 7);

        return (
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className={`flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 w-fit mx-auto transition-colors duration-200`}>
              <button
                onClick={goToPreviousMonth}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowLeft className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mx-4 transition-colors duration-200`}>
                {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToNextMonth}
                className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
              >
                <FaArrowRight className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`} />
              </button>
            </div>

            {/* Calendar Grid with Weekly Summaries */}
            <div className="grid grid-cols-12 gap-4">
              {/* Main Calendar */}
              <div className={`col-span-9 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden transition-colors duration-200`}>
                {/* Day Headers */}
                <div className={`grid grid-cols-7 gap-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} py-2 text-center text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className={`grid grid-cols-7 gap-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-200`}>
                  {Array.from({ length: weeksInMonth * 7 }).map((_, index) => {
                    const dayNumber = index - firstDayOfMonth + 1;
                    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNumber);
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                    const dateString = formatDateString(date);
                    const dayWorkouts = workouts[dateString] || [];

                    return (
                      <div
                        key={index}
                        className={`${isDark ? 'bg-gray-800' : 'bg-white'} min-h-[120px] p-2 flex flex-col relative group ${
                          isCurrentMonth ? 'hover:bg-gray-700' : 'bg-gray-50/50'
                        } ${isToday(date) ? 'ring-2 ring-teal-500' : ''}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className={`font-medium text-sm ${
                            isCurrentMonth 
                              ? isDark ? 'text-gray-300' : 'text-gray-700'
                              : isDark ? 'text-gray-500' : 'text-gray-400'
                          } ${isToday(date) ? isDark ? 'text-teal-400' : 'text-teal-600' : ''} transition-colors duration-200`}>
                            {date.getDate()}
                          </div>
                          {/* Add Workout Button - Only visible on hover */}
                          {isCurrentMonth && (
                            <button
                              onClick={() => setSelectedWorkout({ 
                                id: '', 
                                text: '', 
                                summary: {
                                  totalDistance: 0,
                                  strokeDistances: {
                                    freestyle: 0,
                                    backstroke: 0,
                                    breaststroke: 0,
                                    butterfly: 0,
                                    im: 0,
                                    choice: 0
                                  },
                                  intensityDistances: {}
                                },
                                createdAt: new Date().toISOString(),
                                date: dateString
                              })}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-teal-50 rounded-full text-teal-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {dayWorkouts.length > 0 && (
                          <div className="flex-1 flex flex-col space-y-1">
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-teal-100 ${isDark ? 'bg-teal-600' : 'bg-teal-500'} rounded-full transition-colors duration-200`}>
                                {dayWorkouts.length}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-teal-100 ${isDark ? 'bg-teal-500' : 'bg-teal-400'} rounded-full transition-colors duration-200`}>
                                {formatToKm(dayWorkouts.reduce((total, w) => total + w.summary.totalDistance, 0))}
                              </span>
                            </div>
                            {/* Workouts List */}
                            <div className="space-y-1 overflow-y-auto max-h-[80px]">
                              {dayWorkouts.map((workout) => (
                                <div
                                  key={workout.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkout({ ...workout, date: dateString });
                                  }}
                                  className={`text-xs ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded p-1.5 cursor-pointer transition-colors duration-200`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                                      {formatToKm(workout.summary.totalDistance)}
                                    </span>
                                    <div className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                                      <FaClock className="h-3 w-3 mr-0.5" />
                                      {formatDuration(getTotalDuration(workout))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Summaries */}
              <div className="col-span-3 space-y-4">
                <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} border-b ${isDark ? 'border-gray-700' : 'border-teal-100'} pb-1 px-3 transition-colors duration-200`}>Weekly Summary</div>
                {Array.from({ length: weeksInMonth }).map((_, weekIndex) => {
                  const weekStart = new Date(monthStart);
                  weekStart.setDate(weekStart.getDate() - firstDayOfMonth + (weekIndex * 7));
                  const weekWorkouts = getWeekWorkouts(weekStart);
                  
                  const totalDistance = weekWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0);
                  const totalTime = weekWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0);
                  const avgDistance = weekWorkouts.length > 0 ? totalDistance / weekWorkouts.length : 0;
                  const avgTime = weekWorkouts.length > 0 ? totalTime / weekWorkouts.length : 0;

                  return (
                    <div key={weekIndex} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-3 transition-colors duration-200`}>
                      <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 transition-colors duration-200`}>
                        Week {weekIndex + 1}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Workouts:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{weekWorkouts.length || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Distance:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{weekWorkouts.length ? formatToKm(totalDistance) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Time:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{weekWorkouts.length ? formatDuration(totalTime) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Avg Distance:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{weekWorkouts.length ? formatToKm(avgDistance) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>Avg Time:</span>
                          <span className={`font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'} transition-colors duration-200`}>{weekWorkouts.length ? formatDuration(avgTime) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Month Summary */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 transition-colors duration-200`}>
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4 transition-colors duration-200`}>
                {selectedDate.toLocaleDateString('default', { month: 'long' })} Summary
              </h3>
              <div className="grid grid-cols-5 gap-6">
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Workouts</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>{monthWorkouts.length}</div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Distance</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {formatToKm(monthWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0))}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Total Time</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {formatDuration(monthWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0))}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Avg Distance/Workout</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {monthWorkouts.length ? formatToKm(monthWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0) / monthWorkouts.length) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} mb-2 transition-colors duration-200`}>Avg Time/Workout</div>
                  <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {monthWorkouts.length 
                      ? formatDuration(monthWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0) / monthWorkouts.length)
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
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
            <Link href="/history" className={`${isDark ? 'text-teal-400' : 'text-teal-500'} transition-colors flex items-center`}>
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

      <main className={`flex-1 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Calendar</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>View and manage your swimming workouts</p>
        </div>

        {/* View selection buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                setSelectedDate(new Date());
                setView('today');
              }}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                view === 'today' 
                  ? 'bg-teal-500 text-white' 
                  : `${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} hover:bg-gray-700`
              }`}
            >
              Today
            </button>
            {(['day', 'week', 'month', 'year'] as const).map((viewOption) => (
              <button 
                key={viewOption}
                onClick={() => setView(viewOption)}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  view === viewOption 
                    ? 'bg-teal-500 text-white' 
                    : `${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} hover:bg-gray-700`
                }`}
              >
                {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
              </button>
            ))}
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
};

export default HistoryPage; 
