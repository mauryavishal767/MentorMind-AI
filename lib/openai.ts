import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateMentorResponse = async (
  messages: ChatMessage[],
  systemPrompt: string,
  mentorPersonality: string
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nPersonality traits: ${mentorPersonality}. Always maintain a helpful, encouraging, and professional tone while staying true to your personality.`
        },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response. Please try again.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate mentor response');
  }
};

export const generateConversationTitle = async (firstMessage: string) => {
  try {
    const response = await openAI.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a short, descriptive title (5-8 words) for a mentoring conversation based on the user\'s first message. Make it engaging and specific to the topic.'
        },
        {
          role: 'user',
          content: firstMessage
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'Mentoring Session';
  } catch (error) {
    console.error('Failed to generate conversation title:', error);
    return 'New Conversation';
  }
};