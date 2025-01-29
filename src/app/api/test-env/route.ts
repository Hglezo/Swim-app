import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 5),
    nodeEnv: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
} 