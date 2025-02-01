"use client";

import Link from 'next/link';
import { FaSwimmer, FaArrowLeft, FaArrowRight, FaHome, FaCalendarAlt, FaChartLine, FaSignOutAlt, FaClock, FaTrash, FaTimes, FaEdit } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
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
      updateWorkoutInPlace(workout.date, workout.id, text, newSummary);
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
                <span className="text-2xl font-bold text-gray-900">
                  {currentSummary.totalDistance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                </span>
              </div>
              
              {/* Stroke distances */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Distance by Stroke</h3>
                <div className="space-y-2">
                  {Object.entries(currentSummary.strokeDistances)
                    .filter(([_, distance]) => distance > 0)
                    .map(([stroke, distance]) => (
                      <div key={stroke} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{stroke}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {distance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Distance by Intensity */}
              {Object.keys(currentSummary.intensityDistances || {}).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Distance by Intensity</h3>
                  <div className="space-y-2">
                    {Object.entries(currentSummary.intensityDistances || {}).map(([intensity, distance]) => (
                      <div key={intensity} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{intensity}</span>
                        <span className="text-sm font-medium text-gray-900">
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
              {parseError && (
                <div className="mt-2 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">
                  ⚠️ {parseError}
                </div>
              )}
            </div>

            {/* Format Examples */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Format Examples:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Stroke Types: drill/dr, kick/k, scull</p>
                  <p>Heart Rate: hr150-hr190 (by 5)</p>
                  <p>Heart Rate by 10: hr24-hr30</p>
                  <p>Standard: Easy, Moderate, Strong, Fast</p>
                  <p>Polar Zones: Grey, Blue, Green, Orange, Red</p>
                </div>
              </div>
            )}
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
                    setParseError(null);
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
          <span className="text-gray-500">
            {formatDuration(getTotalDuration(workout))}
          </span>
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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [workouts, setWorkouts] = useState<WorkoutRecord>({});
  const { preferences } = usePreferences();
  const [selectedWorkout, setSelectedWorkout] = useState<SelectedWorkout>(null);
  const [poolType, setPoolType] = useState<'SCY' | 'SCM' | 'LCM'>('LCM');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

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

  // Add navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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
    switch (currentView) {
      case 'today':
      case 'day': {
        const dayWorkouts = workouts[formatDateString(currentDate)] || [];
        const isTodays = currentView === 'today' && isToday(currentDate);
        
        return (
          <div className="space-y-6">
            {/* Day Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 w-fit mx-auto">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() - 1);
                  setCurrentDate(newDate);
                  if (currentView === 'today') {
                    setCurrentView('day');
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mx-4">
                {isTodays ? 'Today' : currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() + 1);
                  setCurrentDate(newDate);
                  if (currentView === 'today') {
                    setCurrentView('day');
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Workouts List with Expandable Details */}
            <div className="space-y-4">
              {dayWorkouts.map((workout) => (
                <ExpandableWorkout
                  key={workout.id}
                  workout={workout}
                  date={formatDateString(currentDate)}
                  isExpanded={expandedWorkoutId === workout.id}
                  onToggle={() => {
                    setExpandedWorkoutId(expandedWorkoutId === workout.id ? null : workout.id);
                  }}
                  onEdit={() => setSelectedWorkout({ ...workout, date: formatDateString(currentDate) })}
                  onDelete={() => {
                    setSelectedWorkout({ ...workout, date: formatDateString(currentDate) });
                    handleDeleteWorkout();
                  }}
                />
              ))}
            </div>

            {/* Daily Summary */}
            {dayWorkouts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Total Distance</div>
                    <div className="text-2xl font-bold text-teal-600">
                      {formatToKm(dayWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Total Time</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDuration(dayWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Workouts</div>
                    <div className="text-2xl font-bold text-gray-900">{dayWorkouts.length}</div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Distance by Stroke</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(
                      dayWorkouts.reduce((acc, workout) => {
                        Object.entries(workout.summary.strokeDistances).forEach(([stroke, distance]) => {
                          acc[stroke] = (acc[stroke] || 0) + distance;
                        });
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .filter(([_, distance]) => distance > 0)
                      .map(([stroke, distance]) => (
                        <div key={stroke} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{stroke}:</span>
                          <span className="font-medium text-gray-900">{distance}m</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'week': {
        const weekWorkouts = Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() - currentDate.getDay() + index + 1);
          const dateString = formatDateString(date);
          return workouts[dateString] || [];
        }).flat();

        return (
          <div className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 w-fit mx-auto">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mx-4">
                {`Week of ${currentDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Week View Grid */}
            <div className="grid grid-cols-12 gap-4">
              {/* Main Week View */}
              <div className="col-span-9 bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-1 divide-y">
                  {Array.from({ length: 7 }).map((_, index) => {
                    const date = new Date(currentDate);
                    date.setDate(currentDate.getDate() - currentDate.getDay() + index + 1);
                    const dateString = formatDateString(date);
                    const dayWorkouts = workouts[dateString] || [];

                    return (
                      <div key={index} className={`p-4 ${
                        isToday(date) ? 'bg-teal-50' : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`font-medium ${
                            isToday(date) ? 'text-teal-600' : 'text-gray-900'
                          }`}>
                            {date.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {dayWorkouts?.map((workout) => renderWorkout(workout, true, dateString))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Summaries */}
              <div className="col-span-3 space-y-4">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = new Date(currentDate);
                  date.setDate(currentDate.getDate() - currentDate.getDay() + index + 1);
                  const dateString = formatDateString(date);
                  const dayWorkouts = workouts[dateString] || [];

                  if (dayWorkouts.length === 0) return null;

                  const totalDistance = dayWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0);
                  const totalTime = dayWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0);

                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        {date.toLocaleDateString('default', { weekday: 'short' })}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Workouts:</span>
                          <span className="font-medium text-gray-900">{dayWorkouts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium text-teal-600">{formatToKm(totalDistance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium text-gray-900">{formatDuration(totalTime)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'year': {
        const yearWorkouts = Object.values(workouts).flat();
        return (
          <div className="space-y-6">
            {/* Year Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 w-fit mx-auto">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mx-4">
                {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Year Calendar Grid */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-6">
                {Array.from({ length: 12 }).map((_, monthIndex) => {
                  const monthStart = new Date(currentDate.getFullYear(), monthIndex, 1);
                  const monthWorkouts = yearWorkouts.filter(workout => {
                    const workoutDate = new Date(workout.createdAt);
                    return workoutDate.getMonth() === monthIndex && 
                           workoutDate.getFullYear() === currentDate.getFullYear();
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
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <h3 className="font-medium text-gray-900 mb-3 hover:text-teal-600 cursor-pointer"
                          onClick={() => {
                            setCurrentDate(monthStart);
                            setCurrentView('month');
                          }}>
                        {monthStart.toLocaleDateString('default', { month: 'long' })}
                      </h3>
                      {monthWorkouts.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Workouts:</span>
                            <span className="font-medium text-gray-900">{monthWorkouts.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-medium text-teal-600">{formatToKm(totalDistance)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium text-gray-900">{formatDuration(totalTime)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Avg Dist:</span>
                            <span className="font-medium text-gray-900">{formatToKm(avgDistance)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Avg Time:</span>
                            <span className="font-medium text-gray-900">{formatDuration(avgTime)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No workouts</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Yearly Summary */}
            <YearSummary 
              workouts={yearWorkouts} 
              poolType={poolType} 
              year={currentDate.getFullYear()} 
            />
          </div>
        );
      }

      default: { // month view
        const monthWorkouts = Object.values(workouts).flat();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const weeksInMonth = Math.ceil((firstDayOfMonth + new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) / 7);

        return (
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 w-fit mx-auto">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mx-4">
                {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid with Weekly Summaries */}
            <div className="grid grid-cols-12 gap-4">
              {/* Main Calendar */}
              <div className="col-span-9 bg-white rounded-lg shadow overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {Array.from({ length: weeksInMonth * 7 }).map((_, index) => {
                    const dayNumber = index - firstDayOfMonth + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const dateString = formatDateString(date);
                    const dayWorkouts = workouts[dateString] || [];

                    return (
                      <div
                        key={index}
                        className={`bg-white min-h-[120px] p-2 flex flex-col ${
                          isCurrentMonth ? 'hover:bg-gray-50' : 'bg-gray-50/50'
                        } ${isToday(date) ? 'ring-2 ring-teal-500' : ''}`}
                      >
                        <div className={`font-medium mb-1 text-sm ${
                          isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                        } ${isToday(date) ? 'text-teal-600' : ''}`}>
                          {date.getDate()}
                        </div>
                        {dayWorkouts.length > 0 && (
                          <div className="flex-1 flex flex-col space-y-1">
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium ${
                                isCurrentMonth ? 'text-teal-100 bg-teal-600' : 'text-teal-100 bg-teal-500'
                              } rounded-full`}>
                                {dayWorkouts.length}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium ${
                                isCurrentMonth ? 'text-teal-100 bg-teal-500' : 'text-teal-100 bg-teal-400'
                              } rounded-full`}>
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
                                  className="text-xs bg-gray-50 rounded p-1.5 cursor-pointer hover:bg-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      {formatToKm(workout.summary.totalDistance)}
                                    </span>
                                    <span className="text-gray-500">
                                      {formatDuration(getTotalDuration(workout))}
                                    </span>
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
                {Array.from({ length: weeksInMonth }).map((_, weekIndex) => {
                  const weekStart = new Date(monthStart);
                  weekStart.setDate(weekStart.getDate() - firstDayOfMonth + (weekIndex * 7));
                  const weekWorkouts = getWeekWorkouts(weekStart);
                  
                  if (weekWorkouts.length === 0) return null;

                  const totalDistance = weekWorkouts.reduce((sum, w) => sum + w.summary.totalDistance, 0);
                  const totalTime = weekWorkouts.reduce((sum, w) => sum + getTotalDuration(w), 0);
                  const avgDistance = totalDistance / weekWorkouts.length;
                  const avgTime = totalTime / weekWorkouts.length;

                  return (
                    <div key={weekIndex} className="bg-white rounded-lg shadow-sm p-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Week {weekIndex + 1}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Workouts:</span>
                          <span className="font-medium text-gray-900">{weekWorkouts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span className="font-medium text-teal-600">{formatToKm(totalDistance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium text-gray-900">{formatDuration(totalTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Distance:</span>
                          <span className="font-medium text-gray-900">{formatToKm(avgDistance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Time:</span>
                          <span className="font-medium text-gray-900">{formatDuration(avgTime)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
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
              onClick={() => {
                setCurrentDate(new Date());
                setCurrentView('today');
              }}
              className={`px-4 py-2 rounded-md ${
                currentView === 'today' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            {(['day', 'week', 'month', 'year'] as const).map((view) => (
              <button 
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-2 rounded-md ${
                  currentView === view ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
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
} 
