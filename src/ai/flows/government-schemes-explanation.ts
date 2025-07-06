'use server';
/**
 * @fileOverview Explains government schemes relevant to a farmer's location and crops.
 *
 * - explainGovernmentSchemes - A function that initiates the government schemes explanation process.
 * - GovernmentSchemesExplanationInput - The input type for the explainGovernmentSchemes function.
 * - GovernmentSchemesExplanationOutput - The return type for the explainGovernmentSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovernmentSchemesExplanationInputSchema = z.object({
  location: z.string().describe('The location of the farmer.'),
  crop: z.string().describe('The crop the farmer is growing.'),
});
export type GovernmentSchemesExplanationInput = z.infer<typeof GovernmentSchemesExplanationInputSchema>;

const GovernmentSchemesExplanationOutputSchema = z.object({
  schemes: z.array(z.string()).describe('The list of relevant government schemes.'),
  explanation: z.string().describe('The explanation of the schemes and how to apply.'),
});
export type GovernmentSchemesExplanationOutput = z.infer<typeof GovernmentSchemesExplanationOutputSchema>;

// Define a tool to fetch government schemes based on location and crop
const getGovernmentSchemes = ai.defineTool({
  name: 'getGovernmentSchemes',
  description: 'Fetches a list of government schemes relevant to a specific location and crop.',
  inputSchema: z.object({
    location: z.string().describe('The location of the farmer.'),
    crop: z.string().describe('The crop the farmer is growing.'),
  }),
  outputSchema: z.array(z.string()).describe('A list of relevant government schemes.'),
}, async (input) => {
  // In a real application, this would fetch data from a database or external API.
  // For this example, return dummy data.
  const {
    location,
    crop
  } = input;
  console.log('location: ' + location + ', crop: ' + crop);
  if (location.toLowerCase().includes('karnataka') && crop.toLowerCase().includes('rice')) {
    return [
      'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      'Paramparagat Krishi Vikas Yojana (PKVY)',
    ];
  } else {
    return [];
  }
});

export async function explainGovernmentSchemes(input: GovernmentSchemesExplanationInput): Promise<GovernmentSchemesExplanationOutput> {
  return explainGovernmentSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'governmentSchemesExplanationPrompt',
  tools: [getGovernmentSchemes],
  input: {schema: GovernmentSchemesExplanationInputSchema},
  output: {schema: GovernmentSchemesExplanationOutputSchema},
  prompt: `You are an AI assistant for farmers.  Your job is to explain what government schemes are available to them based on their location and what they are growing.

  First use the getGovernmentSchemes tool to discover the list of schemes available to the farmer, based on their location and crop.
  Then, explain the schemes to the farmer in a clear and concise way, including information on how to apply for them. Be conversational and encouraging.

  Location: {{{location}}}
  Crop: {{{crop}}}
  `,
});

const explainGovernmentSchemesFlow = ai.defineFlow(
  {
    name: 'explainGovernmentSchemesFlow',
    inputSchema: GovernmentSchemesExplanationInputSchema,
    outputSchema: GovernmentSchemesExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
