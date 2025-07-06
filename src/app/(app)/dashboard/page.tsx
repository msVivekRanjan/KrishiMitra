import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Voicemail, LineChart, Landmark } from "lucide-react"

const features = [
  {
    title: "Crop Doctor",
    description: "Upload an image of your crop to diagnose diseases and get treatment advice.",
    href: "/crop-doctor",
    icon: <Leaf className="w-8 h-8 text-primary" />,
  },
  {
    title: "Voice Assistant",
    description: "Ask questions in Kannada using your voice and get instant spoken answers.",
    href: "/voice-assistant",
    icon: <Voicemail className="w-8 h-8 text-primary" />,
  },
  {
    title: "Market Watch",
    description: "Get the latest market price trends for your crops to sell at the right time.",
    href: "/market-watch",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
  {
    title: "Government Schemes",
    description: "Find and understand government schemes that can benefit you and your farm.",
    href: "/govt-schemes",
    icon: <Landmark className="w-8 h-8 text-primary" />,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline font-bold">Welcome to KrishiMitra</h1>
        <p className="text-muted-foreground mt-1">Your AI-powered farming assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={feature.href} 
            className="flex flex-col justify-between transition-transform transform hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-start gap-4">
              {feature.icon}
              <div className="flex-1">
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                <CardDescription className="mt-1">{feature.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full group">
                <Link href={feature.href}>
                  Go to {feature.title}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
