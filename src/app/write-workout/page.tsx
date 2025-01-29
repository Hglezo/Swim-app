'use client';

import Link from 'next/link';
import { FaSwimmer, FaChartLine, FaSignOutAlt, FaCalendarAlt, FaHome, FaPlus, FaTrash } from 'react-icons/fa';
import { MdDashboard, MdPerson } from 'react-icons/md';
import React, { useState } from 'react';

interface Set {
  id: string;
  repetitions: number;
  distance: number;
  stroke: string;
  type: string;
  intensityMethod: string;
  intensity: string;
  description: string;
}

interface WorkoutSection {
  id: string;
  title: string;
  sets: Set[];
}

// Add new interfaces for bracket validation
interface BracketError {
  lineNumber: number;
  bracketType: string;
  message: string;
}

export default function WriteWorkout() {
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutText, setWorkoutText] = useState('');
  const [workoutSections, setWorkoutSections] = useState<WorkoutSection[]>([
    {
      id: '1',
      title: 'Warm Up',
      sets: [],
    }
  ]);
  const [bracketErrors, setBracketErrors] = useState<BracketError[]>([]);

  // Helper function to preprocess multi-line brackets
  const preprocessMultiLineBrackets = (text: string): string => {
    // First split into sections (separated by empty lines)
    const sections = text.split(/\n\s*\n/).filter(section => section.trim()).map(section => {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      let processedLines: string[] = [];
      let currentSetContent: string[] = [];
      let isInSet = false;
      let currentSetTitle = '';
      
      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        
        // Check if this is a set header
        const setHeaderMatch = currentLine.match(/^(warm\s*up|first\s*set|ups\s*set|second\s*set|third\s*set|hey\s*set|main\s*set|warm\s*down)(:)?$/i);
        if (setHeaderMatch) {
          // If we were in a set, process and add its content
          if (isInSet && currentSetContent.length > 0) {
            processedLines.push(currentSetTitle);
            processedLines.push(...processSetContent(currentSetContent));
          }
          
          // Start a new set
          currentSetTitle = currentLine.replace(/:$/, '');
          currentSetContent = [];
          isInSet = true;
          continue;
        }

        // If we're in a set, add the line to current set content
        if (isInSet) {
          if (currentLine.trim()) {
            currentSetContent.push(currentLine);
          }
        } else {
          processedLines.push(currentLine);
        }
      }

      // Process any remaining set content
      if (isInSet && currentSetContent.length > 0) {
        processedLines.push(currentSetTitle);
        processedLines.push(...processSetContent(currentSetContent));
      }
      
      return processedLines.join('\n');
    });
    
    // Join sections back together
    let processedText = sections.join('\n\n');
    console.log('Preprocessed text:', processedText);
    return processedText;
  };

  // Helper function to process set content
  const processSetContent = (lines: string[]): string[] => {
    let processedLines: string[] = [];
    let i = 0;
    let currentBracketContent: string[] = [];
    let bracketDepth = 0;
    let currentMultiplier = '';
    
    while (i < lines.length) {
      const currentLine = lines[i].trim();
      
      // Skip empty lines
      if (!currentLine) {
        i++;
        continue;
      }

      // Check if current line is just a multiplier
      const multiplierMatch = currentLine.match(/^(\d+)[x*]$/);
      if (multiplierMatch) {
        currentMultiplier = multiplierMatch[1];
        i++;
        continue;
      }

      // Count brackets in the current line
      for (const char of currentLine) {
        if (char === '[' || char === '{' || char === '(') bracketDepth++;
        if (char === ']' || char === '}' || char === ')') bracketDepth--;
      }

      // If we're collecting bracket content
      if (bracketDepth > 0 || currentLine.includes('[') || currentLine.includes('(') || currentLine.includes('{')) {
        currentBracketContent.push(currentLine);
      } else if (bracketDepth === 0 && currentBracketContent.length > 0) {
        // If we've finished collecting bracket content
        currentBracketContent.push(currentLine);
        const joinedContent = currentBracketContent
          .map(line => line.trim())
          .join('+')
          .replace(/\+\s*\+/g, '+');
        
        if (currentMultiplier) {
          processedLines.push(`${currentMultiplier}x${joinedContent}`);
          currentMultiplier = '';
        } else {
          processedLines.push(joinedContent);
        }
        currentBracketContent = [];
      } else {
        // Regular line
        if (currentMultiplier) {
          processedLines.push(`${currentMultiplier}x[${currentLine}]`);
          currentMultiplier = '';
        } else {
          processedLines.push(currentLine);
        }
      }
      i++;
    }

    // Handle any remaining bracket content
    if (currentBracketContent.length > 0) {
      const joinedContent = currentBracketContent
        .map(line => line.trim())
        .join('+')
        .replace(/\+\s*\+/g, '+');
      
      if (currentMultiplier) {
        processedLines.push(`${currentMultiplier}x${joinedContent}`);
      } else {
        processedLines.push(joinedContent);
      }
    }
    
    console.log('Processed set content:', processedLines);
    return processedLines;
  };

  // Helper function to parse nested sets and calculate multipliers
  const parseNestedSets = (line: string): { line: string, multiplier: number } => {
    let multiplier = 1;
    let processedLine = line.trim();
    
    // Handle nested brackets and multipliers
    const bracketPattern = /(\d+)?[x*]?\s*[\[\{\(](.*?)[\]\}\)]/g;
    let match;
    
    while ((match = bracketPattern.exec(line)) !== null) {
      const [fullMatch, mult, content] = match;
      const localMultiplier = mult ? parseInt(mult) : 1;
      
      // Handle additions within brackets
      const parts = content.split('+').map(part => {
        const innerResult = parseNestedSets(part.trim());
        return innerResult.line;
      });
      
      // Apply the multiplier to this level only
      multiplier *= localMultiplier;
      
      // Replace the bracket expression with the content
      processedLine = processedLine.replace(fullMatch, parts.join('+'));
    }

    // If there's no bracket but there's a multiplier at the start
    const simpleMultMatch = processedLine.match(/^(\d+)[x*]/);
    if (simpleMultMatch) {
      multiplier *= parseInt(simpleMultMatch[1]);
      processedLine = processedLine.replace(/^\d+[x*]\s*/, '');
    }

    console.log(`Parsed nested set: "${processedLine}" with multiplier ${multiplier}`);
    return { line: processedLine, multiplier };
  };

  const calculateTotalDistance = (text: string): number => {
    // Preprocess text to handle multi-line brackets
    const preprocessedText = preprocessMultiLineBrackets(text);
    console.log('Preprocessed text:', preprocessedText);

    let totalDistance = 0;
    let currentSetDistance = 0;
    let isInSet = false;
    let currentSetTitle = '';

    const lines = preprocessedText.split('\n').filter((line: string) => line.trim());

    lines.forEach((line: string) => {
      // Check if this is a set header
      const setHeaderMatch = line.match(/^(warm\s*up|first\s*set|ups\s*set|second\s*set|third\s*set|hey\s*set|main\s*set|warm\s*down)(:)?$/i);
      if (setHeaderMatch) {
        // If we were in a set, log its total
        if (isInSet) {
          console.log(`${currentSetTitle} total: ${currentSetDistance}m`);
        }
        
        // Start a new set
        currentSetTitle = line.replace(/:$/, '').trim();
        currentSetDistance = 0;
        isInSet = true;
        return;
      }

      // Skip empty lines
      if (!line.trim()) {
        return;
      }

      // Handle sets joined by '+'
      const sets = line.split('+').map((set: string) => set.trim());
      
      sets.forEach((set: string) => {
        // First check for nested sets with brackets
        const nestedResult = parseNestedSets(set);
        set = nestedResult.line;
        let setMultiplier = nestedResult.multiplier;

        // Now parse the individual set
        const repMatch = set.match(/^(\d+)?(?:[x*])?\s*(\d+)\s*(?:(?:drill|dr|kick|k|swim|sw|ch|choice|free|fr|back|bk|breast|br|fly|fl)\b)?/i);
        
        if (repMatch) {
          const [, reps, distance] = repMatch;
          const setDistance = parseInt(distance);
          const repetitions = reps ? parseInt(reps) : 1;
          
          const lineDistance = setDistance * repetitions * setMultiplier;
          console.log(`Adding distance for set "${set}": ${lineDistance}m (${setDistance} * ${repetitions} * ${setMultiplier})`);
          
          if (isInSet) {
            currentSetDistance += lineDistance;
          }
          totalDistance += lineDistance;
        }
      });
    });

    // Log the last set's total if we were in one
    if (isInSet) {
      console.log(`${currentSetTitle} total: ${currentSetDistance}m`);
    }

    console.log('Total distance:', totalDistance);
    return totalDistance;
  };

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
              repetitions: 1,
              distance: 100,
              stroke: 'freestyle',
              type: 'swim',
              intensityMethod: 'standard',
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

  const handleWorkoutTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setWorkoutText(newText);
    validateBrackets(newText);
  };

  // Helper function to validate brackets
  const validateBrackets = (text: string) => {
    const lines = text.split('\n');
    const errors: BracketError[] = [];
    const bracketStack: { char: '[' | '{' | '(', line: number }[] = [];
    
    const bracketPairs: { [key in '[' | '{' | '(']: string } = {
      '[': ']',
      '{': '}',
      '(': ')',
    };

    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '[' || char === '{' || char === '(') {
          bracketStack.push({ char, line: lineNumber });
        } else if (char === ']' || char === '}' || char === ')') {
          const lastBracket = bracketStack.pop();
          
          if (!lastBracket) {
            errors.push({
              lineNumber,
              bracketType: char,
              message: 'Unexpected closing bracket'
            });
          } else if (bracketPairs[lastBracket.char] !== char) {
            errors.push({
              lineNumber,
              bracketType: char,
              message: `Mismatched bracket: expected ${bracketPairs[lastBracket.char]} but found ${char}`
            });
          }
        }
      }
    });

    // Add errors for any remaining unclosed brackets
    bracketStack.forEach(({ char, line }) => {
      errors.push({
        lineNumber: line,
        bracketType: char,
        message: 'Unclosed bracket'
      });
    });

    setBracketErrors(errors);
  };

  // Helper function to get line classes
  const getLineClasses = (lineNumber: number) => {
    const hasError = bracketErrors.some(error => error.lineNumber === lineNumber);
    return `relative ${hasError ? 'bg-red-100' : ''}`;
  };

  // Helper function to get error message for a line
  const getLineErrorMessage = (lineNumber: number) => {
    const error = bracketErrors.find(error => error.lineNumber === lineNumber);
    return error?.message || '';
  };

  // Helper function to identify stroke type
  const getStrokeType = (s: string): string | null => {
    switch (s.toLowerCase()) {
      case 'fl':
      case 'fly':
      case 'butterfly':
        return 'butterfly';
      case 'bk':
      case 'back':
      case 'backstroke':
        return 'backstroke';
      case 'br':
      case 'breast':
      case 'breaststroke':
        return 'breaststroke';
      case 'fr':
      case 'free':
      case 'freestyle':
        return 'freestyle';
      case 'im':
      case 'medley':
        return 'im';
      case 'ch':
      case 'choice':
        return 'choice';
      default:
        return null;
    }
  };

  // Helper function to identify activity type
  const getActivityType = (s: string): string | null => {
    switch (s.toLowerCase()) {
      case 'dr':
      case 'drill':
        return 'drill';
      case 'k':
      case 'kick':
        return 'kick';
      case 'scull':
        return 'scull';
      case 'swim':
        return 'swim';
      default:
        return null;
    }
  };

  // Helper function to normalize stroke types and determine activity
  const normalizeStrokeType = (stroke: string): { type: string, activityType: string } => {
    stroke = stroke.trim();
    
    // Handle compound types (stroke + activity or activity + stroke)
    if (stroke.includes(' ')) {
      const parts = stroke.split(' ').map(p => p.trim());
      
      // Try both orders for each part
      for (const [first, second] of [[parts[0], parts[1]], [parts[1], parts[0]]]) {
        const strokeType = getStrokeType(first);
        const activityType = getActivityType(second);
        
        if (strokeType && activityType) {
          return { type: strokeType, activityType };
        }
      }

      // If no valid combination found, try each part individually
      for (const part of parts) {
        const strokeType = getStrokeType(part);
        if (strokeType) return { type: strokeType, activityType: 'swim' };
        
        const activityType = getActivityType(part);
        if (activityType) return { type: 'freestyle', activityType };
      }
    }

    // Handle single word types
    const singleStrokeType = getStrokeType(stroke);
    if (singleStrokeType) return { type: singleStrokeType, activityType: 'swim' };

    const singleActivityType = getActivityType(stroke);
    if (singleActivityType) return { type: 'freestyle', activityType: singleActivityType };

    return { type: stroke.toLowerCase(), activityType: 'swim' }; // Default to swim if no activity specified
  };

  const parseWorkoutText = () => {
    try {
      // Preprocess text to handle multi-line brackets
      const preprocessedText = preprocessMultiLineBrackets(workoutText);
      console.log('Preprocessed text:', preprocessedText);
      
      // Split the preprocessed text into sections
      const sections = preprocessedText.split(/\n\s*\n/).filter(section => section.trim());
      
      const parsedSections: WorkoutSection[] = sections.map(sectionText => {
        const lines = sectionText.split('\n').filter(line => line.trim());
        const title = lines[0].replace(/:$/, '').trim();
        
        // Parse each line after the title into a set
        const sets = lines.slice(1).flatMap(line => {
          // Skip empty lines and section headers
          if (!line.trim() || line.match(/^(warm\s*up|first\s*set|ups\s*set|second\s*set|third\s*set|hey\s*set|main\s*set|warm\s*down)(:)?$/i)) {
            return [];
          }

          // Parse nested sets first
          const { line: processedLine, multiplier } = parseNestedSets(line);
          console.log(`After parseNestedSets: "${line}" => "${processedLine}" with multiplier ${multiplier}`);
          
          // Split by '+' to handle multiple sets in one line
          const parts = processedLine.split('+')
            .map(part => part.trim())
            .filter(part => part.length > 0);
          
          console.log(`Split parts:`, parts);
          
          return parts.map(part => {
            // Check if the part itself has a multiplier
            const partResult = parseNestedSets(part);
            const finalMultiplier = partResult.multiplier * multiplier;
            console.log(`Processing part: "${part}" => "${partResult.line}" with final multiplier ${finalMultiplier}`);
            const set = parseSetLine(partResult.line, finalMultiplier);
            console.log(`Created set:`, set);
            return set;
          });
        });

        console.log(`Parsed section "${title}" with ${sets.length} sets:`, sets);
        const workoutSection: WorkoutSection = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title,
          sets
        };
        const sectionTotal = calculateSectionTotal(workoutSection);
        console.log(`Section "${title}" total: ${sectionTotal}m`);
        return workoutSection;
      });

      console.log('Final parsed sections:', parsedSections);
      setWorkoutSections(parsedSections);
    } catch (error) {
      console.error('Error parsing workout text:', error);
    }
  };

  // Helper function to parse a single set line
  const parseSetLine = (line: string, multiplier: number): Set => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Default values if parsing fails
    let distance = 0;
    let repetitions = 1;
    let stroke = 'freestyle';
    let type = 'swim';
    let intensityMethod = 'standard';
    let intensity = 'moderate';

    // First try to match the multiplier format
    const multMatch = line.match(/^(\d+)[x*]/);
    if (multMatch) {
      repetitions = parseInt(multMatch[1]);
      line = line.slice(multMatch[0].length).trim();
    }

    // Then match the rest of the line
    const match = line.match(/^(\d+)\s*([^@\s]*\s*[^@\s]*)?(?:\s+@([\d:]+))?\s*(?:hr\s*(\d+)|(\w+))?$/i);
    if (match) {
      const [_, dist, swimType, interval, heartRate, standardIntensity] = match;
      distance = parseInt(dist);
      if (swimType) {
        const normalized = normalizeStrokeType(swimType.trim());
        stroke = normalized.type;
        type = normalized.activityType;
      }
      
      if (heartRate) {
        const hr = parseInt(heartRate);
        intensityMethod = hr >= 100 ? 'heart-rate' : 'heart-rate-10';
        intensity = `hr${heartRate}`;
      } else if (standardIntensity) {
        intensityMethod = 'standard';
        intensity = standardIntensity.toLowerCase();
      }
    } else {
      // Try to match just the distance
      const distMatch = line.match(/^(\d+)/);
      if (distMatch) {
        distance = parseInt(distMatch[1]);
      }
    }

    // Apply the passed multiplier at the end
    repetitions *= multiplier;

    const totalDistance = repetitions * distance;
    console.log(`Parsed set line: "${line}" with multiplier ${multiplier} => ${repetitions}x${distance}m ${stroke} ${type} = ${totalDistance}m`);
    
    // Create the structured set
    const set: Set = {
      id,
      repetitions,
      distance,
      stroke,
      type,
      intensityMethod,
      intensity,
      description: `${repetitions}x${distance}m ${stroke} ${type}`
    };
    
    console.log('Created structured set:', set);
    return set;
  };

  // Helper function to calculate section total
  const calculateSectionTotal = (section: WorkoutSection) => {
    const total = section.sets.reduce((total, set) => {
      const setTotal = set.distance * set.repetitions;
      console.log(`Calculating set total for ${set.repetitions}x${set.distance}m ${set.stroke} = ${setTotal}m`);
      return total + setTotal;
    }, 0);
    console.log(`Total for section "${section.title}": ${total}m`);
    return total;
  };

  const handleSaveWorkout = () => {
    // Here you would typically save the workout to your backend
    const workout = {
      title: workoutTitle,
      date: workoutDate,
      sections: workoutSections,
      totalDistance: calculateTotalDistance(workoutText),
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
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                placeholder="Morning Practice"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Date</label>
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Free-form Workout Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Write Workout</h2>
            <p className="text-sm text-gray-600">Enter your workout details in a free format. Use a new line for each set.</p>
          </div>
          <div className="mb-4 relative">
            <div className="relative">
              <pre className="absolute inset-0 overflow-hidden pointer-events-none">
                {workoutText.split('\n').map((line, index) => (
                  <div key={index} className={getLineClasses(index + 1)}>
                    {line}
                    {getLineErrorMessage(index + 1) && (
                      <div className="absolute right-0 top-0 bottom-0 flex items-center">
                        <div className="hidden group-hover:block absolute right-full mr-2 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap">
                          {getLineErrorMessage(index + 1)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </pre>
              <textarea
                rows={15}
                value={workoutText}
                onChange={handleWorkoutTextChange}
                placeholder="Example:
Warm Up:
4x[100 Free @1:45 Easy]
4x(50 Kick w/board @1:00)

Main Set:
8x{200 Free @3:00 Build}
4x[100 IM @2:00 Hard]"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors font-mono relative z-10"
                style={{ caretColor: 'auto' }}
              />
            </div>
            {bracketErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                Please fix bracket errors before converting
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button 
              onClick={parseWorkoutText}
              disabled={bracketErrors.length > 0}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                bracketErrors.length > 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              Convert to Structured Format
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Structured Input (Optional)</h2>
          <button
            onClick={addSection}
            className="text-teal-500 hover:text-teal-600 transition-colors flex items-center"
          >
            <FaPlus className="h-5 w-5 mr-2" />
            Add Section
          </button>
        </div>

        {/* Workout Sections */}
        {workoutSections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline">
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                className="text-lg font-semibold text-gray-900 border-none focus:ring-0 bg-transparent"
              />
                <span className="ml-2 text-sm text-gray-500">
                  {calculateSectionTotal(section)}m
                </span>
              </div>
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
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-7 gap-4">
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
                      <label className="block text-sm font-medium text-gray-600">Distance</label>
                      <input
                        type="number"
                        value={set.distance}
                        onChange={(e) => updateSet(section.id, set.id, 'distance', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Stroke</label>
                      <select
                        value={set.stroke}
                        onChange={(e) => updateSet(section.id, set.id, 'stroke', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      >
                        <option value="freestyle">Freestyle</option>
                        <option value="backstroke">Backstroke</option>
                        <option value="breaststroke">Breaststroke</option>
                        <option value="butterfly">Butterfly</option>
                        <option value="im">IM</option>
                        <option value="choice">Choice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Type</label>
                      <select
                        value={set.type}
                        onChange={(e) => updateSet(section.id, set.id, 'type', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      >
                        <option value="swim">Swim</option>
                        <option value="drill">Drill</option>
                        <option value="kick">Kick</option>
                        <option value="scull">Scull</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Intensity Method</label>
                      <select
                        value={set.intensityMethod}
                        onChange={(e) => updateSet(section.id, set.id, 'intensityMethod', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      >
                        <option value="standard">Standard</option>
                        <option value="heart-rate">Heart Rate</option>
                        <option value="heart-rate-10">Heart Rate by 10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Intensity</label>
                      <select
                        value={set.intensity}
                        onChange={(e) => updateSet(section.id, set.id, 'intensity', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400 transition-colors"
                      >
                        {set.intensityMethod === 'heart-rate' ? (
                          <>
                            <option value="hr150">Heart Rate 150</option>
                            <option value="hr155">Heart Rate 155</option>
                            <option value="hr160">Heart Rate 160</option>
                            <option value="hr165">Heart Rate 165</option>
                            <option value="hr170">Heart Rate 170</option>
                            <option value="hr175">Heart Rate 175</option>
                            <option value="hr180">Heart Rate 180</option>
                            <option value="hr185">Heart Rate 185</option>
                            <option value="hr190">Heart Rate 190</option>
                          </>
                        ) : set.intensityMethod === 'heart-rate-10' ? (
                          <>
                            <option value="hr24">Heart Rate 24</option>
                            <option value="hr25">Heart Rate 25</option>
                            <option value="hr26">Heart Rate 26</option>
                            <option value="hr27">Heart Rate 27</option>
                            <option value="hr28">Heart Rate 28</option>
                            <option value="hr29">Heart Rate 29</option>
                            <option value="hr30">Heart Rate 30</option>
                          </>
                        ) : (
                          <>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="hard">Hard</option>
                        <option value="sprint">Sprint</option>
                          </>
                        )}
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

        {/* Summary and Save */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Workout Summary</h2>
              <p className="text-gray-600">Total Distance: {calculateTotalDistance(workoutText)} meters</p>
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
} 