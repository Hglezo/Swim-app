'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaMagic } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Define types for our workout data
interface WorkoutSummary {
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
    [key: string]: number; // Will store distances for each intensity dynamically
  };
}

type StrokeType = 'drill' | 'kick' | 'scull' | 'normal';
type IntensityType = 
  | { type: 'heartRate'; value: 150 | 155 | 160 | 165 | 170 | 175 | 180 | 185 | 190 }
  | { type: 'heartRateBy10'; value: 24 | 25 | 26 | 27 | 28 | 29 | 30 }
  | { type: 'standard'; value: 'easy' | 'moderate' | 'strong' | 'fast' }
  | { type: 'polarZones'; value: 'grey' | 'blue' | 'green' | 'orange' | 'red' }
  | { type: 'international'; value: 'yellow' | 'white' | 'pink' | 'red' | 'blue' | 'brown' | 'purple' }
  | null;

interface ParsedSet {
  distance: number;
  stroke: string;
  strokeType: StrokeType;
  intensity: IntensityType;
  strokeDistances?: { [key: string]: number };
}

export default function WriteWorkout() {
  // State for pool type and workout text
  const [poolType, setPoolType] = useState<'SCY' | 'SCM' | 'LCM'>('LCM');
  const [workoutText, setWorkoutText] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>({
    totalDistance: 0,
    strokeDistances: {
      freestyle: 0,
      backstroke: 0,
      breaststroke: 0,
      butterfly: 0,
      im: 0,
      choice: 0
    },
    intensityDistances: {}
  });
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsingWithGPT, setIsParsingWithGPT] = useState(false);
  const [gptParseError, setGptParseError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Add intensity system state
  const [intensitySystem, setIntensitySystem] = useState<'polar' | 'international'>('polar');

  // Helper function to identify stroke
  const getStroke = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('fr') || lowerText.includes('free')) return 'freestyle';
    if (lowerText.includes('bk') || lowerText.includes('back')) return 'backstroke';
    if (lowerText.includes('br') || lowerText.includes('breast')) return 'breaststroke';
    if (lowerText.includes('fl') || lowerText.includes('fly') || lowerText.includes('butterfly')) return 'butterfly';
    if (lowerText.includes('im') || lowerText.includes('medley')) return 'im';
    if (lowerText.includes('ch') || lowerText.includes('choice')) return 'choice';
    return 'freestyle'; // Default to freestyle if no stroke specified
  };

  // Helper function to identify stroke type modifiers
  const getStrokeType = (text: string): StrokeType => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('drill') || lowerText.includes('dr')) return 'drill';
    if (lowerText.includes('kick') || lowerText.includes('k')) return 'kick';
    if (lowerText.includes('scull')) return 'scull';
    return 'normal';
  };

  // Update getIntensity to use the selected system
  const getIntensity = (text: string): IntensityType => {
    const lowerText = text.toLowerCase();
    
    // Heart Rate
    const hrMatch = text.match(/hr(\d{3})/i);
    if (hrMatch) {
      const hr = parseInt(hrMatch[1]);
      if ([150, 155, 160, 165, 170, 175, 180, 185, 190].includes(hr)) {
        return { type: 'heartRate', value: hr as 150 | 155 | 160 | 165 | 170 | 175 | 180 | 185 | 190 };
      }
    }

    // Heart Rate by 10
    const hr10Match = text.match(/hr(\d{2})/i);
    if (hr10Match) {
      const hr = parseInt(hr10Match[1]);
      if ([24, 25, 26, 27, 28, 29, 30].includes(hr)) {
        return { type: 'heartRateBy10', value: hr as 24 | 25 | 26 | 27 | 28 | 29 | 30 };
      }
    }

    // Standard
    if (lowerText.includes('easy')) return { type: 'standard', value: 'easy' };
    if (lowerText.includes('moderate')) return { type: 'standard', value: 'moderate' };
    if (lowerText.includes('strong')) return { type: 'standard', value: 'strong' };
    if (lowerText.includes('fast')) return { type: 'standard', value: 'fast' };

    // Colors - check based on selected system
    if (intensitySystem === 'polar') {
      if (lowerText.includes('grey')) return { type: 'polarZones', value: 'grey' };
      if (lowerText.includes('blue')) return { type: 'polarZones', value: 'blue' };
      if (lowerText.includes('green')) return { type: 'polarZones', value: 'green' };
      if (lowerText.includes('orange')) return { type: 'polarZones', value: 'orange' };
      if (lowerText.includes('red')) return { type: 'polarZones', value: 'red' };
    } else {
      if (lowerText.includes('yellow')) return { type: 'international', value: 'yellow' };
      if (lowerText.includes('white')) return { type: 'international', value: 'white' };
      if (lowerText.includes('pink')) return { type: 'international', value: 'pink' };
      if (lowerText.includes('red')) return { type: 'international', value: 'red' };
      if (lowerText.includes('blue')) return { type: 'international', value: 'blue' };
      if (lowerText.includes('brown')) return { type: 'international', value: 'brown' };
      if (lowerText.includes('purple')) return { type: 'international', value: 'purple' };
    }

    return null;
  };

  // Helper function to parse numbers from text
  const parseDistance = (text: string): number => {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Helper function to parse bracket content
  const parseBracketContent = (content: string): { distance: number; parts: { distance: number; stroke: string }[] } => {
    console.log('Parsing bracket content:', content);
    // Remove brackets and clean up content
    const text = content
      .replace(/[\(\[\{]/g, '')  // Remove opening brackets
      .replace(/[\)\]\}]/g, '')  // Remove closing brackets
      .trim();

    console.log('Cleaned text:', text);

    if (!text) {
      console.log('Empty text, returning 0');
      return { distance: 0, parts: [] };
    }

    let totalDistance = 0;
    const parts: { distance: number; stroke: string }[] = [];
    
    // First split by newlines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('Split lines:', lines);

    // Process each line
    for (const line of lines) {
      // Split line by plus signs
      const segments = line.split(/\s*\+\s*/).map(s => s.trim()).filter(s => s.length > 0);
      console.log('Line segments:', segments);

      for (const segment of segments) {
        console.log('Processing segment:', segment);
        let segmentDistance = 0;
        
        // First, try to find a number at the start of the segment
        const numberMatch = segment.match(/^\d+/);
        if (numberMatch) {
          segmentDistance = parseInt(numberMatch[0]);
          console.log(`Found number: ${segmentDistance}`);
        }

        if (segmentDistance > 0) {
          totalDistance += segmentDistance;
          const stroke = getStroke(segment);
          parts.push({
            distance: segmentDistance,
            stroke
          });
          console.log(`Added segment: ${segmentDistance} ${stroke}`);
        }
      }
    }

    console.log('Final bracket result:', { distance: totalDistance, parts });
    return { distance: totalDistance, parts };
  };

  // Update parseLine to handle all cases correctly
  const parseLine = (line: string): ParsedSet => {
    console.log('\nParsing line:', line);
    const text = line.toLowerCase().trim();
    if (!text) return { distance: 0, stroke: 'freestyle', strokeType: 'normal', intensity: null, strokeDistances: {} };

    let distance = 0;
    let strokeDistances: { [key: string]: number } = {};
    
    // Check if the line contains a parentheses expression
    if (text.includes('(') || text.includes('[') || text.includes('{')) {
      console.log('Found bracket expression');
      // Extract multiplier if present (e.g., "5x" in "5x(100 + 100)")
      const multiplierMatch = text.match(/^(\d+)\s*[x×*]/);
      const multiplier = multiplierMatch ? parseInt(multiplierMatch[1]) : 1;
      console.log('Multiplier:', multiplier);
      
      // Get the bracket content and parse it
      const bracketStart = text.search(/[\(\[\{]/);
      const bracketContent = text.substring(bracketStart);
      console.log('Bracket content:', bracketContent);
      const { distance: bracketDistance, parts } = parseBracketContent(bracketContent);
      console.log('Parsed bracket result:', { bracketDistance, parts });
      distance = bracketDistance * multiplier;
      console.log('Total distance:', distance);
      
      // Multiply each part's distance by the multiplier and store by stroke
      parts.forEach(part => {
        const partTotalDistance = part.distance * multiplier;
        strokeDistances[part.stroke] = (strokeDistances[part.stroke] || 0) + partTotalDistance;
        console.log(`Added ${partTotalDistance} to ${part.stroke}`);
      });
    } else {
      // Original parsing logic for non-bracket lines
      const parts = text.split(/[\s+]+/);
      let i = 0;

      while (i < parts.length) {
        const part = parts[i].trim();
        if (!part) {
          i++;
          continue;
        }

        // Handle multiplier notation (e.g., "4x100")
        if (part.match(/^\d+\s*[x×*]\s*\d+$/)) {
          const [reps, dist] = part.split(/[x×*]/);
          if (reps && dist) {
            distance += parseInt(reps.trim()) * parseInt(dist.trim());
          }
          i++;
        }
        // Handle simple numbers
        else if (part.match(/^\d+$/)) {
          distance += parseInt(part);
          i++;
        } else {
          i++;
        }
      }
      
      // For non-bracket lines, all distance goes to the single stroke
      if (distance > 0) {
        strokeDistances[getStroke(text)] = distance;
      }
    }

    // Find the dominant stroke (the one with the most distance)
    let dominantStroke = 'freestyle';
    let maxDistance = 0;
    for (const [stroke, strokeDistance] of Object.entries(strokeDistances)) {
      if (strokeDistance > maxDistance) {
        maxDistance = strokeDistance;
        dominantStroke = stroke;
      }
    }

    const result = {
      distance,
      stroke: dominantStroke,
      strokeType: getStrokeType(text),
      intensity: getIntensity(text),
      strokeDistances
    };
    console.log('Parse line result:', result);
    return result;
  };

  // Helper function to get intensity display name
  const getIntensityDisplayName = (intensity: IntensityType): string | null => {
    if (!intensity) return null;
    
    switch (intensity.type) {
      case 'heartRate':
        return `HR ${intensity.value}`;
      case 'heartRateBy10':
        return `HR ${intensity.value}`;
      case 'standard':
        return intensity.value.charAt(0).toUpperCase() + intensity.value.slice(1);
      case 'polarZones':
      case 'international':
        return intensity.value.charAt(0).toUpperCase() + intensity.value.slice(1);
      default:
        return null;
    }
  };

  // Update the updateWorkoutSummary function to use strokeDistances
  const updateWorkoutSummary = (text: string) => {
    console.log('Starting workout summary update with text:', text);
    setParseError(null);
    
    try {
      let processedText = text;
      let bracketContent = '';
      let multiplier = 1;
      let pendingMultiplier = 1;  // Add this to track multiplier from previous line
      const newSummary: WorkoutSummary = {
        totalDistance: 0,
        strokeDistances: {
          freestyle: 0,
          backstroke: 0,
          breaststroke: 0,
          butterfly: 0,
          im: 0,
          choice: 0
        },
        intensityDistances: {}
      };

      // Split into lines and process
      const lines = processedText.split('\n');
      let collectingBracket = false;
      let bracketLines: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        if (!trimmedLine) continue;

        // Check for standalone multiplier
        const standaloneMultiplier = trimmedLine.match(/^(\d+)\s*[x×*]\s*$/);
        if (standaloneMultiplier) {
          pendingMultiplier = parseInt(standaloneMultiplier[1]);
          continue;
        }

        if (trimmedLine.includes('(') || trimmedLine.includes('[') || trimmedLine.includes('{')) {
          // Start collecting bracket content
          collectingBracket = true;
          // Check for multiplier on same line
          const multiplierMatch = trimmedLine.match(/^(\d+)\s*[x×*]/);
          if (multiplierMatch) {
            multiplier = parseInt(multiplierMatch[1]);
            pendingMultiplier = 1; // Reset pending multiplier if we find one on this line
          } else {
            multiplier = pendingMultiplier; // Use pending multiplier if no multiplier on this line
            pendingMultiplier = 1; // Reset pending multiplier
          }
          
          // Check if the line also contains the closing bracket
          const hasClosingBracket = trimmedLine.includes(')') || trimmedLine.includes(']') || trimmedLine.includes('}');
          if (hasClosingBracket) {
            // Single-line bracket content
            const bracketStart = trimmedLine.search(/[\(\[\{]/);
            const bracketEnd = trimmedLine.search(/[\)\]\}]/);
            if (bracketStart !== -1 && bracketEnd !== -1) {
              const bracketText = trimmedLine.substring(bracketStart, bracketEnd + 1);
              console.log('Processing single-line bracket content:', bracketText, 'with multiplier:', multiplier);
              const { distance: bracketDistance, parts } = parseBracketContent(bracketText);
              
              // Add the results to the summary
              const totalBracketDistance = bracketDistance * multiplier;
              newSummary.totalDistance += totalBracketDistance;
              
              parts.forEach(part => {
                const partTotalDistance = part.distance * multiplier;
                if (part.stroke in newSummary.strokeDistances) {
                  newSummary.strokeDistances[part.stroke as keyof typeof newSummary.strokeDistances] += partTotalDistance;
                }
              });

              // Reset bracket collection
              collectingBracket = false;
              bracketLines = [];
              multiplier = 1;
            }
          } else {
            // Multi-line bracket content
            const bracketStart = trimmedLine.search(/[\(\[\{]/);
            if (bracketStart !== -1) {
              bracketLines.push(trimmedLine.substring(bracketStart + 1));
            }
          }
          continue;
        }

        if (collectingBracket) {
          if (trimmedLine.includes(')') || trimmedLine.includes(']') || trimmedLine.includes('}')) {
            // End of bracket content
            const bracketEnd = trimmedLine.search(/[\)\]\}]/);
            if (bracketEnd !== -1) {
              bracketLines.push(trimmedLine.substring(0, bracketEnd));
            }
            
            // Parse the collected bracket content
            const bracketText = bracketLines.join('\n');
            console.log('Processing multi-line bracket content:', bracketText, 'with multiplier:', multiplier);
            const { distance: bracketDistance, parts } = parseBracketContent(bracketText);
            
            // Add the results to the summary
            const totalBracketDistance = bracketDistance * multiplier;
            newSummary.totalDistance += totalBracketDistance;
            
            parts.forEach(part => {
              const partTotalDistance = part.distance * multiplier;
              if (part.stroke in newSummary.strokeDistances) {
                newSummary.strokeDistances[part.stroke as keyof typeof newSummary.strokeDistances] += partTotalDistance;
              }
            });

            // Reset bracket collection
            collectingBracket = false;
            bracketLines = [];
            multiplier = 1;
          } else {
            // Continue collecting bracket content
            bracketLines.push(trimmedLine);
          }
        } else {
          // Process regular line
          const parsed = parseLine(trimmedLine);
          if (parsed.distance > 0) {
            newSummary.totalDistance += parsed.distance;
            if (parsed.strokeDistances) {
              for (const [stroke, distance] of Object.entries(parsed.strokeDistances)) {
                if (stroke in newSummary.strokeDistances) {
                  newSummary.strokeDistances[stroke as keyof typeof newSummary.strokeDistances] += distance;
                }
              }
            }
            const intensityName = getIntensityDisplayName(parsed.intensity);
            if (intensityName) {
              newSummary.intensityDistances[intensityName] = 
                (newSummary.intensityDistances[intensityName] || 0) + parsed.distance;
            }
          }
        }
      }

      console.log('Final workout summary:', newSummary);
      setWorkoutSummary(newSummary);
    } catch (error) {
      console.error('Error in updateWorkoutSummary:', error);
      setParseError(error instanceof Error ? error.message : 'Invalid workout format');
    }
  };

  // Update the textarea onChange handler
  const handleWorkoutTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setWorkoutText(newText);
    updateWorkoutSummary(newText);
  };

  // Add the GPT parsing function
  const parseWithGPT = async () => {
    setIsParsingWithGPT(true);
    setGptParseError(null);

    try {
      const response = await fetch('/api/parse-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout: workoutText,
          poolType,
          intensitySystem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse workout with GPT');
      }

      // Update the workout summary with the parsed data
      setWorkoutSummary({
        totalDistance: data.totalDistance,
        strokeDistances: data.strokeDistances,
        intensityDistances: data.intensityDistances,
      });
    } catch (error) {
      console.error('Error parsing workout with GPT:', error);
      setGptParseError(
        error instanceof Error 
          ? error.message 
          : 'Failed to parse workout. Please check your API key configuration.'
      );
    } finally {
      setIsParsingWithGPT(false);
    }
  };

  const handleSaveWorkout = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: workoutDate.toISOString(),
          text: workoutText,
          summary: workoutSummary,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save workout');
      }

      // Clear the form after successful save
      setWorkoutText('');
      setWorkoutSummary({
        totalDistance: 0,
        strokeDistances: {
          freestyle: 0,
          backstroke: 0,
          breaststroke: 0,
          butterfly: 0,
          im: 0,
          choice: 0
        },
        intensityDistances: {}
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save workout');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
            <FaSwimmer className="h-8 w-8 text-teal-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">SwimTracker</span>
          </Link>
          </div>
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
            <Link 
              href="/logout" 
              className="text-gray-700 hover:text-teal-500 transition-colors flex items-center"
            >
              <FaSignOutAlt className="h-5 w-5 mr-2" />
              Log Out
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left side - Input area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Pool Type Selector */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Pool Type</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPoolType('SCY')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      poolType === 'SCY' 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Short Course Yards
                  </button>
                  <button
                    onClick={() => setPoolType('SCM')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      poolType === 'SCM' 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Short Course Meters
                  </button>
                  <button
                    onClick={() => setPoolType('LCM')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      poolType === 'LCM' 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Long Course Meters
                  </button>
                </div>
              </div>

              {/* Intensity System Selector */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Intensity System</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIntensitySystem('polar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      intensitySystem === 'polar'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Polar Zones (Grey, Blue, Green, Orange, Red)
                  </button>
                  <button
                    onClick={() => setIntensitySystem('international')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      intensitySystem === 'international'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    International (Yellow, White, Pink, Red, Blue, Brown, Purple)
                  </button>
                </div>
              </div>

              {/* Workout Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Write Your Workout</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={parseWithGPT}
                      disabled={isParsingWithGPT || !workoutText.trim()}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${isParsingWithGPT || !workoutText.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                    >
                      <FaMagic className="h-4 w-4 mr-2" />
                      {isParsingWithGPT ? 'Parsing...' : 'Parse with GPT'}
                    </button>
                    <button
                      onClick={handleSaveWorkout}
                      disabled={isSaving || !workoutText.trim()}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${isSaving || !workoutText.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      {isSaving ? 'Saving...' : 'Save Workout'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your workout in free format. Use new lines to separate sets.
                  Click "Parse with GPT" to automatically structure your workout.
                </p>
                <div className="space-y-2">
                  <textarea
                    rows={20}
                    value={workoutText}
                    onChange={handleWorkoutTextChange}
                    placeholder="Example:
Warm up:
400 free
4x100 back
4x50 choice

Main Set:
4x (100 fly + 100 free)
2x[100 breast]"
                    className={`w-full rounded-md border ${parseError ? 'border-red-500' : 'border-gray-300'} shadow-sm px-4 py-3 font-mono text-gray-900 focus:ring-teal-500 focus:border-teal-500`}
                  />
                  {parseError && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">
                      ⚠️ {parseError}
                    </div>
                  )}
                  {gptParseError && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md">
                      ⚠️ {gptParseError}
                    </div>
                  )}
                  {saveError && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md mt-2">
                      ⚠️ {saveError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Summary */}
          <div className="w-80">
            {/* Date Selector */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Workout Date</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DatePicker
                      selected={workoutDate}
                      onChange={(date: Date | null) => date && setWorkoutDate(date)}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <button
                    onClick={() => setWorkoutDate(new Date())}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            {/* Workout Summary */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Workout Summary</h2>
              
              {/* Total Distance */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700">Total Distance</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {workoutSummary.totalDistance} {poolType === 'SCY' ? 'yards' : 'meters'}
                </p>
              </div>

              {/* Distance by Stroke */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Distance by Stroke</h3>
                <div className="space-y-2">
                  {Object.entries(workoutSummary.strokeDistances).map(([stroke, distance]) => (
                    distance > 0 && (
                      <div key={stroke} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{stroke}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {distance} {poolType === 'SCY' ? 'yards' : 'meters'}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Distance by Intensity */}
              {Object.keys(workoutSummary.intensityDistances).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Distance by Intensity</h3>
                  <div className="space-y-2">
                    {Object.entries(workoutSummary.intensityDistances).map(([intensity, distance]) => (
                      <div key={intensity} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{intensity}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {distance} {poolType === 'SCY' ? 'yards' : 'meters'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Format */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Format Examples:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Stroke Types: drill/dr, kick/k, scull</p>
                  <p>Heart Rate: hr150-hr190 (by 5)</p>
                  <p>Heart Rate by 10: hr24-hr30</p>
                  <p>Standard: Easy, Moderate, Strong, Fast</p>
                  {intensitySystem === 'polar' ? (
                    <p>Polar Zones: Grey, Blue, Green, Orange, Red</p>
                  ) : (
                    <p>International: Yellow, White, Pink, Red, Blue, Brown, Purple</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 