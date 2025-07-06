"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react"
import { voiceBasedQuery } from "@/lib/actions/voice"

export default function VoiceAssistantPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioResponseUrl, setAudioResponseUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioResponseUrl && audioRef.current) {
      audioRef.current.play()
    }
  }, [audioResponseUrl])

  const handleStartRecording = async () => {
    setError(null)
    setAudioResponseUrl(null)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }
        mediaRecorderRef.current.onstop = handleSendAudio
        audioChunksRef.current = []
        mediaRecorderRef.current.start()
        setIsRecording(true)
      } catch (err) {
        console.error("Error accessing microphone:", err)
        setError("Could not access microphone. Please check your browser permissions.")
      }
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSendAudio = async () => {
    setIsLoading(true)
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" })
    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    reader.onloadend = async () => {
      const base64Audio = reader.result as string
      try {
        const response = await voiceBasedQuery({ audioDataUri: base64Audio })
        setAudioResponseUrl(response.spokenResponse)
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-headline font-bold">Voice Assistant</h1>
        <p className="text-muted-foreground mt-1">Press the microphone to ask your question in Kannada. Press again to send.</p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-6">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading}
            className={`w-24 h-24 rounded-full transition-all duration-300 ${
              isRecording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-primary hover:bg-primary/90"
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isLoading ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-10 w-10" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Thinking..."
              : isRecording
              ? "Recording... Tap again to stop."
              : "Tap to start recording."}
          </p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {audioResponseUrl && (
        <audio ref={audioRef} src={audioResponseUrl} controls autoPlay className="w-full max-w-md" />
      )}
    </div>
  )
}
