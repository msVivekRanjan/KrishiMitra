// 'use server';

/**
 * @fileOverview Fetches and summarizes the latest market prices for crops.
 *
 * - getMarketPriceTrends - A function that handles fetching and summarizing market price trends.
 * - GetMarketPriceTrendsInput - The input type for the getMarketPriceTrends function.
 * - GetMarketPriceTrendsOutput - The return type for the getMarketPriceTrends function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMarketPriceTrendsInputSchema = z.object({
  crop: z.string().describe('The crop to get market prices for.'),
  location: z.string().describe('The location to get market prices for.'),
});
export type GetMarketPriceTrendsInput = z.infer<typeof GetMarketPriceTrendsInputSchema>;

const GetMarketPriceTrendsOutputSchema = z.object({
  marketPrices: z.string().describe('The latest market prices for the specified crop and location.'),
});
export type GetMarketPriceTrendsOutput = z.infer<typeof GetMarketPriceTrendsOutputSchema>;

export async function getMarketPriceTrends(input: GetMarketPriceTrendsInput): Promise<GetMarketPriceTrendsOutput> {
  return marketPriceTrendsFlow(input);
}

const getMarketPrices = ai.defineTool({
  name: 'getMarketPrices',
  description: 'Returns the current market price of a crop in a specific location.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to get the market price for.'),
    location: z.string().describe('The location to get the market price from.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // TODO: Implement the logic to fetch market prices from an external API or data source.
  // This is just a placeholder implementation.
  return `The current market price for ${input.crop} in ${input.location} is $100 per unit.`;
});

const prompt = ai.definePrompt({
  name: 'marketPriceTrendsPrompt',
  tools: [getMarketPrices],
  input: {schema: GetMarketPriceTrendsInputSchema},
  output: {schema: GetMarketPriceTrendsOutputSchema},
  prompt: `You are an expert agricultural advisor.

  The user is a farmer who wants to know the latest market prices for their crops.
  If the user asks about a specific crop and location, use the getMarketPrices tool to get the current price.
  Summarize the information in a way that is easy for the farmer to understand.

  Crop: {{{crop}}}
  Location: {{{location}}}
  `,
});

const marketPriceTrendsFlow = ai.defineFlow(
  {
    name: 'marketPriceTrendsFlow',
    inputSchema: GetMarketPriceTrendsInputSchema,
    outputSchema: GetMarketPriceTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
