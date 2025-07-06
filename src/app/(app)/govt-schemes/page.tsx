"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Landmark, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import { explainGovernmentSchemes } from "@/lib/actions/schemes"
import { GovernmentSchemesExplanationOutput } from "@/ai/flows/government-schemes-explanation"

const formSchema = z.object({
  crop: z.string().min(2, "Crop name must be at least 2 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
})

type FormValues = z.infer<typeof formSchema>

export default function GovtSchemesPage() {
  const [result, setResult] = useState<GovernmentSchemesExplanationOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { crop: "", location: "" },
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await explainGovernmentSchemes(data)
      setResult(response)
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Government Schemes</h1>
        <p className="text-muted-foreground mt-1">Find relevant government schemes for your location and crop.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6 grid gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location (State)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Karnataka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Crop</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rice, Cotton" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end p-4 border-t bg-muted/50">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
                {isLoading ? 'Finding Schemes...' : 'Find Schemes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
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
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
)

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Failed to Find Schemes</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)

const ResultDisplay = ({ result }: { result: GovernmentSchemesExplanationOutput }) => (
  <Card className="animate-fade-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl">
        <Sparkles className="text-accent" />
        Available Schemes
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {result.schemes.length > 0 ? (
        <>
          <div>
            <h3 className="font-semibold text-lg mb-2">Relevant Schemes For You:</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.schemes.map((scheme, index) => (
                <li key={index}>{scheme}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Explanation & How to Apply:</h3>
            <p className="text-base whitespace-pre-wrap">{result.explanation}</p>
          </div>
        </>
      ) : (
        <p>No specific schemes found for the provided crop and location. Here is a general explanation:</p>
      )}
      {result.schemes.length === 0 && (
         <p className="text-base whitespace-pre-wrap">{result.explanation}</p>
      )}
    </CardContent>
  </Card>
)
