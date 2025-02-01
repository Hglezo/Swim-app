'use client';

import { FaSwimmer } from 'react-icons/fa';

interface DailySummaryProps {
  workouts: {
    summary: {
      totalDistance: number;
      strokeDistances: Record<string, number>;
      intensityDistances?: Record<string, number>;
    };
  }[];
  poolType: string;
}

export default function DailySummary({ workouts, poolType }: DailySummaryProps) {
  // Calculate total distance
  const totalDistance = workouts.reduce((sum, workout) => sum + workout.summary.totalDistance, 0);
  
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
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Daily Summary</h3>
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

      {/* Workout Count */}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Workouts</span>
          <span className="text-lg font-semibold text-gray-900">{workouts.length}</span>
        </div>
      </div>
    </div>
  );
} 