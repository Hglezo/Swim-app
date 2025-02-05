import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to ensure the data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  return dataDir;
};

// Helper function to load workouts
const loadWorkouts = (): { [key: string]: any[] } => {
  const dataDir = ensureDataDir();
  const filePath = path.join(dataDir, 'workouts.json');
  
  // If file doesn't exist, create it with an empty object
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}', 'utf8');
    return {};
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(data);
    // Ensure we return a valid object
    return typeof parsedData === 'object' && parsedData !== null ? parsedData : {};
  } catch (error) {
    console.error('Error loading workouts:', error);
    // If there's an error reading/parsing, reset the file
    fs.writeFileSync(filePath, '{}', 'utf8');
    return {};
  }
};

// Helper function to save workouts
const saveWorkouts = (workouts: { [key: string]: any[] }): boolean => {
  const dataDir = ensureDataDir();
  const filePath = path.join(dataDir, 'workouts.json');
  
  try {
    // Ensure we're saving a valid object
    if (typeof workouts !== 'object' || workouts === null) {
      throw new Error('Invalid workouts object');
    }
    
    // Format JSON with indentation for readability
    fs.writeFileSync(filePath, JSON.stringify(workouts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving workouts:', error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const { date, text, summary } = await request.json();

    if (!date || !text || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Load existing workouts
    const workouts = loadWorkouts();
    const dateKey = new Date(date).toISOString().split('T')[0];

    // Add new workout
    if (!workouts[dateKey]) {
      workouts[dateKey] = [];
    }

    // Create new workout entry
    const newWorkout = {
      id: Date.now().toString(),
      text,
      summary,
      createdAt: new Date().toISOString()
    };

    // Add to workouts array for this date
    workouts[dateKey].push(newWorkout);

    // Save updated workouts
    if (!saveWorkouts(workouts)) {
      throw new Error('Failed to save workout');
    }

    return NextResponse.json({ success: true, workout: newWorkout });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save workout' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const workouts = loadWorkouts();
    const queryDate = new Date(date);
    const monthStart = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1);
    const monthEnd = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 0);

    // Filter workouts for the entire month
    const monthWorkouts: { [key: string]: any[] } = {};
    Object.entries(workouts).forEach(([dateKey, dateWorkouts]) => {
      const workoutDate = new Date(dateKey);
      if (workoutDate >= monthStart && workoutDate <= monthEnd) {
        monthWorkouts[dateKey] = dateWorkouts;
      }
    });

    return NextResponse.json({ workouts: monthWorkouts });
  } catch (error) {
    console.error('Error loading workouts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load workouts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const workoutId = searchParams.get('id');

    if (!date || !workoutId) {
      return NextResponse.json(
        { error: 'Date and workout ID are required' },
        { status: 400 }
      );
    }

    // Load existing workouts
    const workouts = loadWorkouts();
    const dateKey = new Date(date).toISOString().split('T')[0];

    // Check if we have workouts for this date
    if (!workouts[dateKey]) {
      return NextResponse.json(
        { error: 'No workouts found for this date' },
        { status: 404 }
      );
    }

    // Filter out the workout with the matching ID
    const filteredWorkouts = workouts[dateKey].filter(
      workout => workout.id !== workoutId
    );

    // If no workouts left for this date, remove the date entry
    if (filteredWorkouts.length === 0) {
      delete workouts[dateKey];
    } else {
      workouts[dateKey] = filteredWorkouts;
    }

    // Save updated workouts
    if (!saveWorkouts(workouts)) {
      throw new Error('Failed to save updated workouts');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete workout' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const workoutId = searchParams.get('id');
    const { text, summary } = await request.json();

    if (!date || !workoutId || !text || !summary) {
      return NextResponse.json(
        { error: 'Date, workout ID, text, and summary are required' },
        { status: 400 }
      );
    }

    // Load existing workouts
    const workouts = loadWorkouts();
    const dateKey = new Date(date).toISOString().split('T')[0];

    // Check if we have workouts for this date
    if (!workouts[dateKey]) {
      return NextResponse.json(
        { error: 'No workouts found for this date' },
        { status: 404 }
      );
    }

    // Find and update the workout
    const workoutIndex = workouts[dateKey].findIndex(
      workout => workout.id === workoutId
    );

    if (workoutIndex === -1) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Update the workout text and summary while preserving other properties
    workouts[dateKey][workoutIndex] = {
      ...workouts[dateKey][workoutIndex],
      text,
      summary,
      updatedAt: new Date().toISOString()
    };

    // Save updated workouts
    if (!saveWorkouts(workouts)) {
      throw new Error('Failed to save updated workout');
    }

    return NextResponse.json({ 
      success: true,
      workout: workouts[dateKey][workoutIndex]
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update workout' },
      { status: 500 }
    );
  }
} 