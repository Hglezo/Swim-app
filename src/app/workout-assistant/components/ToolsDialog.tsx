'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import PaceCalculator from './PaceCalculator';
import HeartRateZones from './HeartRateZones';
import TechniqueAnalysis from './TechniqueAnalysis';

interface ToolsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: string;
}

export default function ToolsDialog({ isOpen, onClose, initialTool = 'pace' }: ToolsDialogProps) {
  const [activeTool, setActiveTool] = useState(initialTool);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Tool Selection */}
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTool('pace')}
                className={`pb-4 px-1 ${
                  activeTool === 'pace'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pace Calculator
              </button>
              <button
                onClick={() => setActiveTool('heartrate')}
                className={`pb-4 px-1 ${
                  activeTool === 'heartrate'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Heart Rate Zones
              </button>
              <button
                onClick={() => setActiveTool('technique')}
                className={`pb-4 px-1 ${
                  activeTool === 'technique'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Technique Analysis
              </button>
            </nav>
          </div>

          {/* Tool Content */}
          <div>
            {activeTool === 'pace' && <PaceCalculator />}
            {activeTool === 'heartrate' && <HeartRateZones />}
            {activeTool === 'technique' && <TechniqueAnalysis />}
          </div>
        </div>
      </div>
    </div>
  );
} 