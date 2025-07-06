"use server"

import { diagnoseCropDisease as diagnoseCropDiseaseFlow, DiagnoseCropDiseaseInput, DiagnoseCropDiseaseOutput } from "@/ai/flows/diagnose-crop-disease"

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  try {
    const result = await diagnoseCropDiseaseFlow(input)
    if (!result) {
      throw new Error("AI failed to provide a diagnosis.")
    }
    return result
  } catch (error) {
    console.error("Error in diagnoseCropDisease action:", error)
    throw new Error("Failed to get diagnosis. Please try again.")
  }
}
