'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaPlus, FaTrash } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React, { useState } from 'react';

interface Set {
  id: string;
  distance: number;
  repetitions: number;
  type: string;
  intensity: string;
  description: string;
}

interface WorkoutSection {
  id: string;
  title: string;
  sets: Set[];
}

const WriteWorkoutPage: React.FC = () => {
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDate, setWorkoutDate] = useState('');
  const [workoutSections, setWorkoutSections] = useState<WorkoutSection[]>([
    {
      id: '1',
      title: 'Warm Up',
      sets: [],
    }
  ]);

  const addSection = () => {
    setWorkoutSections([
      ...workoutSections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        sets: [],
      }
    ]);
  };

  const addSet = (sectionId: string) => {
    setWorkoutSections(workoutSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          sets: [
            ...section.sets,
            {
              id: Date.now().toString(),
              distance: 100,
              repetitions: 1,
              type: 'freestyle',
              intensity: 'moderate',
              description: '',
            }
          ]
        };
      }
      return section;
    }));
  };

  const removeSet = (sectionId: string, setId: string) => {
    setWorkoutSections(workoutSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          sets: section.sets.filter(set => set.id !== setId)
        };
      }
      return section;
    }));
  };

  const updateSet = (sectionId: string, setId: string, field: keyof Set, value: string | number) => {
    setWorkoutSections(workoutSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          sets: section.sets.map(set => {
            if (set.id === setId) {
              return { ...set, [field]: value };
            }
            return set;
          })
        };
      }
      return section;
    }));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setWorkoutSections(workoutSections.map(section => {
      if (section.id === sectionId) {
        return { ...section, title };
      }
      return section;
    }));
  };

  const calculateTotalDistance = () => {
    return workoutSections.reduce((total, section) => {
      return total + section.sets.reduce((sectionTotal, set) => {
        return sectionTotal + (set.distance * set.repetitions);
      }, 0);
    }, 0);
  };

  const handleSaveWorkout = () => {
    // Here you would typically save the workout to your backend
    const workout = {
      title: workoutTitle,
      date: workoutDate,
      sections: workoutSections,
      totalDistance: calculateTotalDistance(),
    };
    console.log('Saving workout:', workout);
    // TODO: Implement actual save functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <Link href="/history" className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
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
            <button className="text-gray-700 hover:text-teal-500 transition-colors flex items-center">
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Write Workout</h1>
          <p className="text-gray-600">Create a new swimming workout for your athletes</p>
        </div>

        {/* Workout Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Workout Title</label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                placeholder="Morning Practice"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Date</label>
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Workout Sections */}
        {workoutSections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                className="text-lg font-semibold text-gray-900 border-none focus:ring-0 bg-transparent"
              />
              <button
                onClick={() => addSet(section.id)}
                className="text-teal-500 hover:text-teal-600 transition-colors"
              >
                <FaPlus className="h-5 w-5" />
              </button>
            </div>

            {/* Sets */}
            <div className="space-y-4">
              {section.sets.map((set) => (
                <div key={set.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Distance</label>
                      <input
                        type="number"
                        value={set.distance}
                        onChange={(e) => updateSet(section.id, set.id, 'distance', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Reps</label>
                      <input
                        type="number"
                        value={set.repetitions}
                        onChange={(e) => updateSet(section.id, set.id, 'repetitions', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Type</label>
                      <select
                        value={set.type}
                        onChange={(e) => updateSet(section.id, set.id, 'type', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      >
                        <option value="freestyle">Freestyle</option>
                        <option value="backstroke">Backstroke</option>
                        <option value="breaststroke">Breaststroke</option>
                        <option value="butterfly">Butterfly</option>
                        <option value="im">IM</option>
                        <option value="drill">Drill</option>
                        <option value="kick">Kick</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Intensity</label>
                      <select
                        value={set.intensity}
                        onChange={(e) => updateSet(section.id, set.id, 'intensity', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      >
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="hard">Hard</option>
                        <option value="sprint">Sprint</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Description</label>
                      <input
                        type="text"
                        value={set.description}
                        onChange={(e) => updateSet(section.id, set.id, 'description', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                        placeholder="Add notes or instructions..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeSet(section.id, set.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <button
          onClick={addSection}
          className="w-full bg-gray-100 text-gray-600 py-4 rounded-lg hover:bg-gray-200 transition-colors mb-6 flex items-center justify-center"
        >
          <FaPlus className="h-5 w-5 mr-2" />
          Add Section
        </button>

        {/* Summary and Save */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Workout Summary</h2>
              <p className="text-gray-600">Total Distance: {calculateTotalDistance()} meters</p>
            </div>
            <button
              onClick={handleSaveWorkout}
              className="bg-teal-500 text-white py-2 px-6 rounded-md hover:bg-teal-600 transition-colors"
            >
              Save Workout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WriteWorkoutPage; 