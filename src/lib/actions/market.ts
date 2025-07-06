"use server"

import { getMarketPriceTrends as getMarketPriceTrendsFlow, GetMarketPriceTrendsInput, GetMarketPriceTrendsOutput } from "@/ai/flows/market-price-trends"

export async function getMarketPriceTrends(input: GetMarketPriceTrendsInput): Promise<GetMarketPriceTrendsOutput> {
  try {
    const result = await getMarketPriceTrendsFlow(input)
    if (!result) {
      throw new Error("AI failed to provide market price trends.")
    }
    return result
  } catch (error) {
    console.error("Error in getMarketPriceTrends action:", error)
    throw new Error("Failed to get market price trends. Please try again.")
  }
}
