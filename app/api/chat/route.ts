import { NextRequest, NextResponse } from 'next/server';
import { generateMentorResponse } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { messages, mentorId, conversationId } = await request.json();

    // Get mentor details
    const { data: mentor, error: mentorError } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', mentorId)
      .single();

    if (mentorError || !mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Format messages for OpenAI
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate AI response
    const startTime = Date.now();
    const response = await generateMentorResponse(
      formattedMessages,
      mentor.system_prompt,
      mentor.personality
    );
    const responseTime = Date.now() - startTime;

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({
      content: response,
      responseTime,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}