'use client';

import { FaSwimmer, FaChartLine } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearSummaryProps {
  workouts: {
    createdAt: string;
    summary: {
      totalDistance: number;
      strokeDistances: Record<string, number>;
      intensityDistances?: Record<string, number>;
    };
  }[];
  poolType: string;
  year: number;
  showStatsOnly?: boolean;
}

export default function YearSummary({ workouts, poolType, year, showStatsOnly = true }: YearSummaryProps) {
  // Calculate monthly data for chart
  const monthlyData = Array(12).fill(0);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  workouts.forEach(workout => {
    const month = new Date(workout.createdAt).getMonth();
    monthlyData[month] += workout.summary.totalDistance;
  });

  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: `Monthly Distance (${poolType === 'SCY' ? 'yards' : 'meters'})`,
        data: monthlyData,
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!showStatsOnly) {
    return <Bar data={chartData} options={chartOptions} />;
  }

  // Calculate total distance
  const totalDistance = workouts.reduce((sum, workout) => sum + workout.summary.totalDistance, 0);
  
  // Get unique workout days
  const uniqueDays = new Set(workouts.map(w => w.createdAt.split('T')[0])).size;
  
  // Calculate averages
  const avgDistancePerWorkout = workouts.length > 0 ? totalDistance / workouts.length : 0;
  const avgDistancePerDay = uniqueDays > 0 ? totalDistance / uniqueDays : 0;
  const workoutsPerDay = uniqueDays > 0 ? workouts.length / uniqueDays : 0;

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
      {/* Yearly Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Yearly Summary</h3>
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

      {/* Monthly Distance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 