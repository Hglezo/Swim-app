'use client';

import { useState } from 'react';
import { MdTimer } from 'react-icons/md';

export default function PaceCalculator() {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState({ hours: '0', minutes: '0', seconds: '0' });
  const [pace, setPace] = useState<string | null>(null);

  const calculatePace = () => {
    const totalSeconds = 
      parseInt(time.hours) * 3600 + 
      parseInt(time.minutes) * 60 + 
      parseInt(time.seconds);
    
    const distanceNum = parseFloat(distance);

    if (distanceNum > 0 && totalSeconds > 0) {
      // Calculate pace per 100m
      const secondsPer100 = (totalSeconds / distanceNum) * 100;
      const paceMinutes = Math.floor(secondsPer100 / 60);
      const paceSeconds = Math.round(secondsPer100 % 60);
      
      setPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}/100m`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <MdTimer className="h-6 w-6 text-teal-500 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Pace Calculator</h2>
      </div>

      <div className="space-y-6">
        {/* Distance Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance (meters)
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter distance in meters"
          />
        </div>

        {/* Time Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                value={time.hours}
                onChange={(e) => setTime({ ...time, hours: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Hours"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                value={time.minutes}
                onChange={(e) => setTime({ ...time, minutes: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Minutes"
                min="0"
                max="59"
              />
            </div>
            <div>
              <input
                type="number"
                value={time.seconds}
                onChange={(e) => setTime({ ...time, seconds: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Seconds"
                min="0"
                max="59"
              />
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculatePace}
          className="w-full bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Calculate Pace
        </button>

        {/* Results */}
        {pace && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Pace</h3>
            <p className="text-3xl font-bold text-teal-600">{pace}</p>
          </div>
        )}
      </div>
    </div>
  );
} 