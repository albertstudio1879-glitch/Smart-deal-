import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GroundingChunk {
  maps?: {
    placeId?: string;
    uri?: string;
    title?: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            snippet?: string;
            author?: string;
        }[]
    }
  }
}

export interface TripResponse {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const generateTripPlan = async (destination: string, days: string, interests: string): Promise<TripResponse> => {
  const prompt = `
    Plan a ${days}-day trip to ${destination}. 
    Interests: ${interests}.
    
    Structure the response clearly with Day 1, Day 2, etc. using Markdown.
    Suggest specific restaurants, museums, parks, or landmarks.
    
    CRITICAL: You MUST use the Google Maps tool to find the real locations of these places so I can show them to the user.
    Provide a brief description for each activity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // Note: responseMimeType and responseSchema are NOT allowed with googleMaps
      },
    });

    const text = response.text || "No itinerary generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return { text, groundingChunks };
  } catch (error) {
    console.error("Gemini Trip Generation Error:", error);
    throw error;
  }
};

export const generateDestinationImage = async (destination: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A beautiful, cinematic, high-quality travel postcard photo of ${destination}, sunny day, vibrant colors, 4k, realistic.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};

// Helper for audio decoding
async function decodeAudioData(
    base64Data: string, 
    ctx: AudioContext
): Promise<AudioBuffer> {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // For PCM, we need to construct the buffer manually if not using decodeAudioData (which expects headers)
    // However, the TTS endpoint typically returns raw PCM. 
    // Standard approach for raw PCM 24kHz:
    const dataInt16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(dataInt16.length);
    for(let i=0; i<dataInt16.length; i++) {
        float32[i] = dataInt16[i] / 32768; 
    }
    
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    return buffer;
}

export const generateAudioGuide = async (text: string): Promise<ArrayBuffer | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        // Play immediately for the demo
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const audioBuffer = await decodeAudioData(base64Audio, audioContext);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);

        return null; // We played it directly
    } catch (error) {
        console.error("Audio Gen Error:", error);
        return null;
    }
}
