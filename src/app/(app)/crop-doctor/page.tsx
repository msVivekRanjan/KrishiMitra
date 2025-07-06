"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm, SubmitHandler } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { UploadCloud, Leaf, AlertCircle, Sparkles, CheckCircle } from "lucide-react"
import { diagnoseCropDisease } from "@/lib/actions/diagnose"

type Inputs = {
  cropImage: FileList
}

type DiagnosisResult = {
  disease: string
  confidence: number
  treatment: string
}

export default function CropDoctorPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, watch, reset } = useForm<Inputs>()
  const watchedFile = watch("cropImage")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResult(null)
      setError(null)
    }
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!data.cropImage.length) return
    setIsLoading(true)
    setError(null)
    setResult(null)

    const file = data.cropImage[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const photoDataUri = reader.result as string
        const response = await diagnoseCropDisease({ photoDataUri })
        setResult(response.diagnosis)
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.")
      } finally {
        setIsLoading(false)
      }
    }
  }
  
  const handleReset = () => {
    reset();
    setPreview(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }


  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Crop Doctor</h1>
        <p className="text-muted-foreground mt-1">Upload an image of an affected crop to get an AI diagnosis.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
                <UploadCloud className="w-12 h-12 text-muted-foreground/50" />
                <Label htmlFor="cropImage" className="cursor-pointer text-center">
                  <span className="font-semibold text-primary">Click to upload an image</span>
                  <br />
                  <span className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 10MB</span>
                </Label>
                <Input 
                  id="cropImage" 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  {...register("cropImage", { required: true, onChange: handleFileChange })}
                />
              </div>

              {preview && (
                <div className="relative w-full max-w-sm mx-auto aspect-square rounded-lg overflow-hidden border shadow-sm">
                  <Image src={preview} alt="Crop preview" layout="fill" objectFit="cover" />
                </div>
              )}
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 p-4 border-t bg-muted/50">
            { (watchedFile && watchedFile.length > 0) && <Button type="button" variant="outline" onClick={handleReset}>Reset</Button> }
            <Button type="submit" disabled={isLoading || !preview}>
              {isLoading ? 'Diagnosing...' : 'Diagnose Disease'}
              <Leaf className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
      
      {isLoading && <LoadingSkeleton />}
      {error && <ErrorAlert message={error} />}
      {result && <ResultDisplay result={result} />}
    </div>
  )
}

const LoadingSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </CardContent>
  </Card>
)

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Diagnosis Failed</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)

const ResultDisplay = ({ result }: { result: DiagnosisResult }) => (
  <Card className="bg-gradient-to-br from-card to-background animate-fade-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl">
        <Sparkles className="text-accent" />
        Diagnosis Result
      </CardTitle>
      <CardDescription>
        Here's what our AI thinks about your crop.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 text-base">
       <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
          <Leaf className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Identified Disease</h3>
            <p className="text-foreground/80">{result.disease}</p>
          </div>
        </div>
       <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
          <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Confidence</h3>
            <p className="text-foreground/80">{(result.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>
       <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
          <Leaf className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Suggested Treatment</h3>
            <p className="text-foreground/80 whitespace-pre-wrap">{result.treatment}</p>
          </div>
        </div>
    </CardContent>
  </Card>
)
