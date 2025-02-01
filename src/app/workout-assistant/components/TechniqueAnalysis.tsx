'use client';

import { useState } from 'react';
import { FaVideo, FaPlay, FaPause, FaUndo, FaRedo } from 'react-icons/fa';

interface StrokeGuide {
  name: string;
  keyPoints: string[];
  commonErrors: string[];
  drills: string[];
}

export default function TechniqueAnalysis() {
  const [selectedStroke, setSelectedStroke] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const strokes: Record<string, StrokeGuide> = {
    freestyle: {
      name: "Freestyle",
      keyPoints: [
        "Body position: Keep horizontal with head in line with spine",
        "Arm movement: High elbow catch and pull",
        "Leg kick: Continuous flutter kick from hips",
        "Breathing: Bilateral breathing every 3 strokes"
      ],
      commonErrors: [
        "Crossing the centerline during pull",
        "Dropping elbow during catch",
        "Looking forward instead of down",
        "Lifting head too high to breathe"
      ],
      drills: [
        "Catch-up drill",
        "Single-arm freestyle",
        "Side-kicking drill",
        "Fingertip drag"
      ]
    },
    butterfly: {
      name: "Butterfly",
      keyPoints: [
        "Body movement: Dolphin undulation",
        "Arm recovery: Arms clear water together",
        "Leg action: Two dolphin kicks per arm cycle",
        "Timing: Kicks coordinate with arm entry and exit"
      ],
      commonErrors: [
        "Lifting head too early",
        "Arms entering too wide",
        "Weak dolphin kick",
        "Poor timing between arms and legs"
      ],
      drills: [
        "Single-arm butterfly",
        "Two-kick-one-pull",
        "Underwater dolphin",
        "Body dolphin"
      ]
    },
    backstroke: {
      name: "Backstroke",
      keyPoints: [
        "Body position: Head steady, ears in water",
        "Arm movement: Straight arm recovery",
        "Leg kick: Continuous flutter kick",
        "Hip rotation: Roll with each arm stroke"
      ],
      commonErrors: [
        "Sitting in the water",
        "Over-rotating shoulders",
        "Bending arms during recovery",
        "Knees breaking surface during kick"
      ],
      drills: [
        "6-kick-switch drill",
        "One-arm backstroke",
        "Head-lead balance",
        "Shoulder shimmy"
      ]
    },
    breaststroke: {
      name: "Breaststroke",
      keyPoints: [
        "Body position: Streamline glide phase",
        "Arm movement: Out-sweep, in-sweep, shoot",
        "Leg kick: Whip kick with feet turned out",
        "Timing: Pull, breathe, kick, glide"
      ],
      commonErrors: [
        "Lifting head too high",
        "Asymmetrical kick",
        "No glide phase",
        "Hands pulling past shoulders"
      ],
      drills: [
        "2-kicks-1-pull",
        "Breaststroke arms with flutter kick",
        "Pull-down drill",
        "Separation drill"
      ]
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <FaVideo className="h-6 w-6 text-teal-500 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Technique Analysis</h2>
      </div>

      <div className="space-y-6">
        {/* Stroke Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Stroke
          </label>
          <select
            value={selectedStroke}
            onChange={(e) => setSelectedStroke(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 bg-white"
          >
            <option value="">Choose a stroke...</option>
            {Object.keys(strokes).map((stroke) => (
              <option key={stroke} value={stroke}>
                {strokes[stroke].name}
              </option>
            ))}
          </select>
        </div>

        {/* Video Controls (Placeholder) */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
            <div className="flex items-center justify-center text-gray-500">
              Video player placeholder
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <FaUndo />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <FaRedo />
            </button>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>

        {/* Technique Guide */}
        {selectedStroke && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Key Points</h3>
              <ul className="list-disc pl-5 space-y-2">
                {strokes[selectedStroke].keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Common Errors</h3>
              <ul className="list-disc pl-5 space-y-2">
                {strokes[selectedStroke].commonErrors.map((error, index) => (
                  <li key={index} className="text-gray-700">{error}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recommended Drills</h3>
              <ul className="list-disc pl-5 space-y-2">
                {strokes[selectedStroke].drills.map((drill, index) => (
                  <li key={index} className="text-gray-700">{drill}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 