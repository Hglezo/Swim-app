export type StrokeType = 'drill' | 'kick' | 'scull' | 'normal';

export type IntensityType = 
  | { type: 'heartRate'; value: 150 | 155 | 160 | 165 | 170 | 175 | 180 | 185 | 190 }
  | { type: 'heartRateBy10'; value: 24 | 25 | 26 | 27 | 28 | 29 | 30 }
  | { type: 'standard'; value: 'easy' | 'moderate' | 'strong' | 'fast' }
  | { type: 'polarZones'; value: 'grey' | 'blue' | 'green' | 'orange' | 'red' }
  | { type: 'international'; value: 'yellow' | 'white' | 'pink' | 'red' | 'blue' | 'brown' | 'purple' }
  | null;

export interface WorkoutSummary {
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
    [key: string]: number;
  };
}

interface ParsedSet {
  distance: number;
  stroke: string;
  strokeType: StrokeType;
  intensity: IntensityType;
  strokeDistances?: { [key: string]: number };
}

// Helper function to identify stroke
export const getStroke = (text: string): string => {
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
export const getStrokeType = (text: string): StrokeType => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('drill') || lowerText.includes('dr')) return 'drill';
  if (lowerText.includes('kick') || lowerText.includes('k')) return 'kick';
  if (lowerText.includes('scull')) return 'scull';
  return 'normal';
};

// Helper function to get intensity
export const getIntensity = (text: string, intensitySystem: 'polar' | 'international'): IntensityType => {
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

// Helper function to get intensity key for summary
const getIntensityKey = (intensity: IntensityType): string | null => {
  if (!intensity) return null;
  
  switch (intensity.type) {
    case 'heartRate':
      return `HR${intensity.value}`;
    case 'heartRateBy10':
      return `HR${intensity.value}0`;
    case 'standard':
    case 'polarZones':
    case 'international':
      return intensity.value;
    default:
      return null;
  }
};

// Helper function to parse bracket content
const parseBracketContent = (content: string): { distance: number; parts: { distance: number; stroke: string }[] } => {
  // Remove brackets and clean up content
  const text = content
    .replace(/[\(\[\{]/g, '')  // Remove opening brackets
    .replace(/[\)\]\}]/g, '')  // Remove closing brackets
    .trim();

  if (!text) {
    return { distance: 0, parts: [] };
  }

  let totalDistance = 0;
  const parts: { distance: number; stroke: string }[] = [];
  
  // First split by newlines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Process each line
  for (const line of lines) {
    // Split line by plus signs
    const segments = line.split(/\s*\+\s*/).map(s => s.trim()).filter(s => s.length > 0);

    for (const segment of segments) {
      let segmentDistance = 0;
      
      // First, try to find a number at the start of the segment
      const numberMatch = segment.match(/^\d+/);
      if (numberMatch) {
        segmentDistance = parseInt(numberMatch[0]);
      }

      if (segmentDistance > 0) {
        totalDistance += segmentDistance;
        const stroke = getStroke(segment);
        parts.push({
          distance: segmentDistance,
          stroke
        });
      }
    }
  }

  return { distance: totalDistance, parts };
};

// Helper function to parse a single line
const parseLine = (line: string, intensitySystem: 'polar' | 'international'): ParsedSet => {
  const text = line.toLowerCase().trim();
  if (!text) return { distance: 0, stroke: 'freestyle', strokeType: 'normal', intensity: null, strokeDistances: {} };

  let distance = 0;
  let strokeDistances: { [key: string]: number } = {};
  
  // Check if the line contains a parentheses expression
  if (text.includes('(') || text.includes('[') || text.includes('{')) {
    // Extract multiplier if present (e.g., "5x" in "5x(100 + 100)")
    const multiplierMatch = text.match(/^(\d+)\s*[x×*]/);
    const multiplier = multiplierMatch ? parseInt(multiplierMatch[1]) : 1;
    
    // Get the bracket content and parse it
    const bracketStart = text.search(/[\(\[\{]/);
    const bracketContent = text.substring(bracketStart);
    const { distance: bracketDistance, parts } = parseBracketContent(bracketContent);
    distance = bracketDistance * multiplier;
    
    // Multiply each part's distance by the multiplier and store by stroke
    parts.forEach(part => {
      const partTotalDistance = part.distance * multiplier;
      strokeDistances[part.stroke] = (strokeDistances[part.stroke] || 0) + partTotalDistance;
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

  return {
    distance,
    stroke: dominantStroke,
    strokeType: getStrokeType(text),
    intensity: getIntensity(text, intensitySystem),
    strokeDistances
  };
};

// Helper function to parse workout text
export const parseWorkoutText = (text: string, intensitySystem: 'polar' | 'international'): WorkoutSummary => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid workout text provided');
  }

  if (!['polar', 'international'].includes(intensitySystem)) {
    throw new Error('Invalid intensity system provided');
  }

  try {
    let processedText = text;
    let bracketContent = '';
    let multiplier = 1;
    let pendingMultiplier = 1;
    const summary: WorkoutSummary = {
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

      // Check for inline multiplier at start of line (e.g., "4x100")
      const inlineMultiplier = trimmedLine.match(/^(\d+)\s*[x×*](?!\s*$)/);
      if (inlineMultiplier) {
        // If we find an inline multiplier, reset the pending multiplier
        pendingMultiplier = 1;
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
        bracketLines.push(trimmedLine);
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
          const { distance: bracketDistance, parts } = parseBracketContent(bracketText);
          
          // Add the results to the summary
          const totalBracketDistance = bracketDistance * multiplier;
          summary.totalDistance += totalBracketDistance;
          
          parts.forEach(part => {
            const partTotalDistance = part.distance * multiplier;
            if (part.stroke in summary.strokeDistances) {
              summary.strokeDistances[part.stroke as keyof typeof summary.strokeDistances] += partTotalDistance;
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
        const parsed = parseLine(trimmedLine, intensitySystem);
        if (parsed.distance > 0) {
          // Apply pending multiplier to the line's distance
          const totalDistance = parsed.distance * pendingMultiplier;
          summary.totalDistance += totalDistance;
          
          if (parsed.strokeDistances) {
            for (const [stroke, distance] of Object.entries(parsed.strokeDistances)) {
              if (stroke in summary.strokeDistances) {
                // Apply pending multiplier to each stroke distance
                summary.strokeDistances[stroke as keyof typeof summary.strokeDistances] += distance * pendingMultiplier;
              }
            }
          }
          if (parsed.intensity) {
            const intensityKey = getIntensityKey(parsed.intensity);
            if (intensityKey) {
              // Apply pending multiplier to intensity distances
              summary.intensityDistances[intensityKey] = (summary.intensityDistances[intensityKey] || 0) + totalDistance;
            }
          }
        }
      }
    }

    return summary;
  } catch (error) {
    console.error('Error in parseWorkoutText:', error);
    throw new Error(`Failed to parse workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 