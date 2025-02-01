import { NextResponse } from 'next/server';

const GPT_API_KEY = process.env.OPENAI_API_KEY;
const GPT_MODEL = 'gpt-4-0125-preview'; // Using GPT-4 Turbo model

export async function POST(request: Request) {
  // Debug logging
  console.log('Environment variables:', {
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 5),
    nodeEnv: process.env.NODE_ENV
  });

  // Check for API key
  if (!GPT_API_KEY) {
    console.error('OpenAI API key is not configured');
    return NextResponse.json(
      { 
        error: 'OpenAI API key is not configured in environment variables',
        debug: {
          hasApiKey: !!process.env.OPENAI_API_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }

  // Verify API key format
  if (!GPT_API_KEY.startsWith('sk-')) {
    console.error('Invalid OpenAI API key format');
    return NextResponse.json(
      { error: 'Invalid OpenAI API key format. Key should start with "sk-"' },
      { status: 500 }
    );
  }

  try {
    const { workout, poolType, intensitySystem } = await request.json();

    if (!workout) {
      return NextResponse.json(
        { error: 'No workout text provided' },
        { status: 400 }
      );
    }

    console.log('Attempting to parse workout:', { poolType, intensitySystem });

    const prompt = `Parse the following swimming workout and return a JSON object with the following structure:
{
  "totalDistance": number,
  "strokeDistances": {
    "freestyle": number,
    "backstroke": number,
    "breaststroke": number,
    "butterfly": number,
    "im": number,
    "choice": number
  },
  "intensityDistances": {
    [intensityName: string]: number
  },
  "sets": [
    {
      "distance": number,
      "stroke": string,
      "strokeType": "drill" | "kick" | "scull" | "normal",
      "intensity": string | null,
      "repetitions": number
    }
  ]
}

Pool type: ${poolType}
Intensity system: ${intensitySystem}

Workout:
${workout}

Rules for parsing:
1. Handle multipliers (e.g., "4x100" means 4 repetitions of 100)
2. Handle brackets/parentheses for grouped sets
3. Recognize stroke types (freestyle/free/fr, backstroke/back/bk, breaststroke/breast/br, butterfly/fly/fl)
4. Recognize intensity markers based on the selected system (${intensitySystem === 'polar' ? 'Grey, Blue, Green, Orange, Red' : 'Yellow, White, Pink, Red, Blue, Brown, Purple'})
5. Default to freestyle if no stroke is specified
6. Parse heart rate intensities (hr150-hr190)
7. Parse standard intensities (easy, moderate, strong, fast)

Return only the JSON object with no additional text.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GPT_API_KEY}`,
        },
        body: JSON.stringify({
          model: GPT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a swimming workout parser that converts free-form text into structured JSON data. You only respond with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1, // Low temperature for more consistent parsing
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API');
      }

      // Clean up the response content by removing markdown code blocks if present
      let content = data.choices[0].message.content;
      content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      
      try {
        const parsedWorkout = JSON.parse(content);
        console.log('Successfully parsed workout');
        return NextResponse.json(parsedWorkout);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }
    } catch (error) {
      console.error('Error in OpenAI request:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error parsing workout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse workout' },
      { status: 500 }
    );
  }
} 