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
import { LineChart, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import { getMarketPriceTrends } from "@/lib/actions/market"

const formSchema = z.object({
  crop: z.string().min(2, "Crop name must be at least 2 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
})

type FormValues = z.infer<typeof formSchema>

export default function MarketWatchPage() {
  const [result, setResult] = useState<string | null>(null)
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
      const response = await getMarketPriceTrends(data)
      setResult(response.marketPrices)
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold">Market Watch</h1>
        <p className="text-muted-foreground mt-1">Get the latest market price trends for your crop.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6 grid gap-4">
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rice, Wheat, Tomato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bengaluru, Hubli" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end p-4 border-t bg-muted/50">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LineChart className="mr-2 h-4 w-4" />}
                {isLoading ? 'Getting Trends...' : 'Get Trends'}
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
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
)

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Failed to Get Trends</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
)

const ResultDisplay = ({ result }: { result: string }) => (
  <Card className="animate-fade-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl">
        <Sparkles className="text-accent" />
        Market Price Summary
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-base whitespace-pre-wrap">{result}</p>
    </CardContent>
  </Card>
)
