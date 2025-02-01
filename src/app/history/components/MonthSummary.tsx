'use client';

import { FaSwimmer, FaChartLine } from 'react-icons/fa';

interface WorkoutSummary {
  totalDistance: number;
  strokeDistances: {
    [key: string]: number;
  };
  intensityDistances: {
    [key: string]: number;
  };
}

interface Workout {
  id: string;
  text: string;
  summary: WorkoutSummary;
  createdAt: string;
}

interface MonthSummaryProps {
  workouts: Workout[];
  poolType: string;
  daysInMonth: number;
}

export default function MonthSummary({ workouts, poolType, daysInMonth }: MonthSummaryProps) {
  // Calculate total distance and time
  const totalDistance = workouts.reduce((sum, workout) => sum + workout.summary.totalDistance, 0);
  
  // Calculate averages
  const avgDistancePerWorkout = workouts.length > 0 ? totalDistance / workouts.length : 0;
  const workoutsPerDay = workouts.length / daysInMonth;
  const avgDistancePerDay = totalDistance / daysInMonth;

  // Get unique workout days
  const uniqueDays = new Set(workouts.map(w => w.createdAt.split('T')[0])).size;

  // Aggregate stroke distances
  const strokeDistances = workouts.reduce((acc, workout) => {
    Object.entries(workout.summary.strokeDistances).forEach(([stroke, distance]) => {
      acc[stroke] = (acc[stroke] || 0) + (distance as number);
    });
    return acc;
  }, {} as Record<string, number>);

  // Aggregate intensity distances
  const intensityDistances = workouts.reduce((acc, workout) => {
    Object.entries(workout.summary.intensityDistances || {}).forEach(([intensity, distance]) => {
      acc[intensity] = (acc[intensity] || 0) + (distance as number);
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
          <FaSwimmer className="h-6 w-6 text-teal-500" />
        </div>

        {/* Total Distance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Distance</span>
            <span className="text-2xl font-bold text-gray-900">
              {totalDistance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
            </span>
          </div>
        </div>

        {/* Stroke Distances */}
        {Object.keys(strokeDistances).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Distance by Stroke</h4>
            <div className="space-y-2">
              {Object.entries(strokeDistances)
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
        )}

        {/* Intensity Distances */}
        {Object.keys(intensityDistances).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Distance by Intensity</h4>
            <div className="space-y-2">
              {Object.entries(intensityDistances).map(([intensity, distance]) => (
                <div key={intensity} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{intensity}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {distance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Stats</h3>
          <FaChartLine className="h-6 w-6 text-teal-500" />
        </div>

        <div className="space-y-4">
          {/* Total Workouts */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Workouts</span>
            <span className="text-lg font-semibold text-gray-900">{workouts.length}</span>
          </div>

          {/* Days with Workouts */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Days with Workouts</span>
            <span className="text-lg font-semibold text-gray-900">{uniqueDays}</span>
          </div>

          {/* Average Distance per Workout */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Distance/Workout</span>
            <span className="text-lg font-semibold text-gray-900">
              {avgDistancePerWorkout.toLocaleString(undefined, { maximumFractionDigits: 0 })} {poolType === 'SCY' ? 'yards' : 'meters'}
            </span>
          </div>

          {/* Average Distance per Day */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Distance/Day</span>
            <span className="text-lg font-semibold text-gray-900">
              {avgDistancePerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })} {poolType === 'SCY' ? 'yards' : 'meters'}
            </span>
          </div>

          {/* Workouts per Day */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Workouts/Day</span>
            <span className="text-lg font-semibold text-gray-900">
              {workoutsPerDay.toFixed(1)}
            </span>
          </div>

          {/* Most Common Stroke */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Most Common Stroke</span>
            <span className="text-lg font-semibold text-gray-900 capitalize">
              {Object.entries(strokeDistances)
                .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 