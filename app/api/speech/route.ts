import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Text and voice ID are required' },
        { status: 400 }
      );
    }

    const audioBuffer = await generateSpeech(text, voiceId);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error('Speech API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}