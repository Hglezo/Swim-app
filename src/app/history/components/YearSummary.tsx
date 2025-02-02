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
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis } from '@/components/ui/bar-chart';

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
  isDark?: boolean;
}

export default function YearSummary({ workouts, poolType, year, showStatsOnly = true, isDark = false }: YearSummaryProps) {
  // Calculate monthly data for chart
  const monthlyData = Array(12).fill(0);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  workouts.forEach(workout => {
    const date = new Date(workout.createdAt);
    if (date.getFullYear() === year) {
      monthlyData[date.getMonth()] += workout.summary.totalDistance;
    }
  });

  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Distance',
        data: monthlyData,
        backgroundColor: isDark ? '#2DD4BF' : '#0D9488',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#D1D5DB' : '#111827',
        bodyColor: isDark ? '#D1D5DB' : '#111827',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#4B5563',
        },
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#4B5563',
        },
      },
    },
  };

  if (!showStatsOnly) {
    return (
      <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  // Calculate total distance
  const totalDistance = monthlyData.reduce((sum, distance) => sum + distance, 0);
  
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>
            Total Distance
          </span>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
            {totalDistance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
          </span>
        </div>
      </div>

      {Object.keys(strokeDistances).length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-200`}>
            Distance by Stroke
          </h4>
          <div className="space-y-2">
            {Object.entries(strokeDistances)
              .filter(([_, distance]) => distance > 0)
              .map(([stroke, distance]) => (
                <div key={stroke} className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} capitalize transition-colors duration-200`}>
                    {stroke}
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                    {distance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {Object.keys(intensityDistances).length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-200`}>
            Distance by Intensity
          </h4>
          <div className="space-y-2">
            {Object.entries(intensityDistances).map(([intensity, distance]) => (
              <div key={intensity} className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                  {intensity}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                  {distance.toLocaleString()} {poolType === 'SCY' ? 'yards' : 'meters'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 