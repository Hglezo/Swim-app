'use client';

import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

interface HeartRateZone {
  name: string;
  color: string;
  range: [number, number];
  description: string;
}

export default function HeartRateZones() {
  const [age, setAge] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [zones, setZones] = useState<HeartRateZone[]>([]);
  const [calculatedMaxHR, setCalculatedMaxHR] = useState<number | null>(null);

  const calculateZones = () => {
    const ageNum = parseInt(age);
    const restingHRNum = parseInt(restingHR);
    const maxHRNum = maxHR ? parseInt(maxHR) : null;

    if (ageNum > 0 && restingHRNum > 0) {
      // Use provided max HR or calculate it using the Tanaka formula
      const finalMaxHR = maxHRNum || Math.round(208 - (0.7 * ageNum));
      setCalculatedMaxHR(finalMaxHR);

      // Calculate heart rate reserve (HRR)
      const hrr = finalMaxHR - restingHRNum;

      // Define zones using Karvonen formula
      const calculateZoneHR = (percentage: number) => 
        Math.round(restingHRNum + (hrr * percentage));

      const newZones: HeartRateZone[] = [
        {
          name: "Zone 1 - Recovery",
          color: "bg-gray-200",
          range: [restingHRNum, calculateZoneHR(0.6)],
          description: "Very light intensity, active recovery"
        },
        {
          name: "Zone 2 - Endurance",
          color: "bg-blue-200",
          range: [calculateZoneHR(0.6), calculateZoneHR(0.7)],
          description: "Light intensity, improves basic endurance"
        },
        {
          name: "Zone 3 - Tempo",
          color: "bg-green-200",
          range: [calculateZoneHR(0.7), calculateZoneHR(0.8)],
          description: "Moderate intensity, improves aerobic capacity"
        },
        {
          name: "Zone 4 - Threshold",
          color: "bg-yellow-200",
          range: [calculateZoneHR(0.8), calculateZoneHR(0.9)],
          description: "Hard intensity, improves anaerobic threshold"
        },
        {
          name: "Zone 5 - Maximum",
          color: "bg-red-200",
          range: [calculateZoneHR(0.9), finalMaxHR],
          description: "Maximum intensity, improves speed and power"
        }
      ];

      setZones(newZones);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <FaHeart className="h-6 w-6 text-teal-500 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Heart Rate Zones Calculator</h2>
      </div>

      <div className="space-y-6">
        {/* Age Input */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Enter your age"
            min="0"
            max="120"
          />
        </div>

        {/* Resting Heart Rate Input */}
        <div>
          <label htmlFor="restingHR" className="block text-sm font-medium text-gray-700 mb-2">
            Resting Heart Rate (bpm)
          </label>
          <input
            id="restingHR"
            type="number"
            value={restingHR}
            onChange={(e) => setRestingHR(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Enter your resting heart rate"
            min="30"
            max="120"
          />
        </div>

        {/* Max Heart Rate Input (Optional) */}
        <div>
          <label htmlFor="maxHR" className="block text-sm font-medium text-gray-700 mb-2">
            Max Heart Rate (bpm) - Optional
          </label>
          <input
            id="maxHR"
            type="number"
            value={maxHR}
            onChange={(e) => setMaxHR(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="Enter your max heart rate (or leave blank to calculate)"
            min="100"
            max="220"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateZones}
          className="w-full bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Calculate Zones
        </button>

        {/* Results */}
        {calculatedMaxHR && zones.length > 0 && (
          <div className="mt-6">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Maximum Heart Rate</h3>
              <p className="text-3xl font-bold text-teal-600">{calculatedMaxHR} bpm</p>
              {!maxHR && (
                <p className="text-sm text-gray-600 mt-2">
                  Calculated using Tanaka formula: 208 - (0.7 × age)
                </p>
              )}
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">Training Zones</h3>
            <div className="space-y-4">
              {zones.map((zone, index) => (
                <div key={index} className={`p-4 rounded-lg ${zone.color}`}>
                  <h4 className="font-medium text-gray-900">{zone.name}</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {zone.range[0]} - {zone.range[1]} bpm
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 