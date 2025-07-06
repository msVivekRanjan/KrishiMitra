'use server';

/**
 * @fileOverview Converts spoken Kannada to text, sends the query to the Gemini model, and returns spoken replies using Text-to-Speech.
 *
 * - voiceBasedQuery - A function that handles the voice-based query process.
 * - VoiceBasedQueryInput - The input type for the voiceBasedQuery function.
 * - VoiceBasedQueryOutput - The return type for the voiceBasedQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceBasedQueryInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data in base64 format, recorded from the user's voice. Expected format: 'data:audio/webm;codecs=opus;base64,<encoded_data>'."
    ),
});
export type VoiceBasedQueryInput = z.infer<typeof VoiceBasedQueryInputSchema>;

const VoiceBasedQueryOutputSchema = z.object({
  spokenResponse: z.string().describe('The AI-generated spoken response in Kannada as a base64 encoded WAV audio data URI.'),
});
export type VoiceBasedQueryOutput = z.infer<typeof VoiceBasedQueryOutputSchema>;

export async function voiceBasedQuery(input: VoiceBasedQueryInput): Promise<VoiceBasedQueryOutput> {
  return voiceBasedQueryFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const voiceBasedQueryFlow = ai.defineFlow(
  {
    name: 'voiceBasedQueryFlow',
    inputSchema: VoiceBasedQueryInputSchema,
    outputSchema: VoiceBasedQueryOutputSchema,
  },
  async input => {
    // 1. Convert audio to text using the audioDataUri.
    // In a real application, you would use a Speech-to-Text API here.
    // For this example, we'll just use a placeholder text.
    const transcribedText = 'ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆ'; // Example: "Question related to agriculture" in Kannada

    // 2. Send the transcribed text to the Gemini model to get a response.
    const {text} = await ai.generate({
      prompt: `Respond to the following question in Kannada: ${transcribedText}`,
    });

    if (!text) {
      throw new Error('no text returned');
    }

    // 3. Convert the text response to speech using a Text-to-Speech API.
    // In a real application, you would use a Text-to-Speech API here.
    // For this example, we'll just use a placeholder audio data URI.

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const spokenResponse = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {spokenResponse};
  }
);
