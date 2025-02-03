import { NextResponse } from 'next/server';
import { parseWorkoutText } from '@/utils/workoutParser';

export async function POST(request: Request) {
  try {
    const { workout, poolType, intensitySystem } = await request.json();

    // Debug logging
    console.log('Received workout request:', {
      workoutLength: workout?.length,
      poolType,
      intensitySystem,
      workoutPreview: workout?.substring(0, 100)
    });

    if (!workout || !poolType || !intensitySystem) {
      console.log('Missing required fields:', {
        hasWorkout: !!workout,
        hasPoolType: !!poolType,
        hasIntensitySystem: !!intensitySystem
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const summary = parseWorkoutText(workout, intensitySystem);
      console.log('Successfully parsed workout:', summary);
      return NextResponse.json(summary);
    } catch (parseError) {
      console.error('Error in parseWorkoutText:', parseError);
      return NextResponse.json(
        { error: parseError instanceof Error ? parseError.message : 'Error parsing workout text' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in request handling:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse workout' },
      { status: 500 }
    );
  }
} 