"use server"

import { explainGovernmentSchemes as explainGovernmentSchemesFlow, GovernmentSchemesExplanationInput, GovernmentSchemesExplanationOutput } from "@/ai/flows/government-schemes-explanation"

export async function explainGovernmentSchemes(input: GovernmentSchemesExplanationInput): Promise<GovernmentSchemesExplanationOutput> {
  try {
    const result = await explainGovernmentSchemesFlow(input)
    if (!result) {
      throw new Error("AI failed to provide an explanation.")
    }
    return result
  } catch (error) {
    console.error("Error in explainGovernmentSchemes action:", error)
    throw new Error("Failed to get government schemes. Please try again.")
  }
}
