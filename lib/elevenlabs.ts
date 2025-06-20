// ElevenLabs API integration for voice synthesis
export const generateSpeech = async (text: string, voiceId: string) => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw new Error('Failed to generate speech');
  }
};

export const getAvailableVoices = async () => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return { voices: [] };
  }
};