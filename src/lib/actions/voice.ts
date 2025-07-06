"use server"

import { voiceBasedQuery as voiceBasedQueryFlow, VoiceBasedQueryInput, VoiceBasedQueryOutput } from "@/ai/flows/voice-based-query"

export async function voiceBasedQuery(input: VoiceBasedQueryInput): Promise<VoiceBasedQueryOutput> {
  try {
    const result = await voiceBasedQueryFlow(input)
    if (!result) {
      throw new Error("AI failed to provide a voice response.")
    }
    return result
  } catch (error) {
    console.error("Error in voiceBasedQuery action:", error)
    throw new Error("Failed to get voice response. Please try again.")
  }
}
