import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Activity } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Activity className="h-12 w-12 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading Shadow Signals</h2>
            <p className="text-muted-foreground">Preparing your crypto analysis dashboard...</p>
          </div>

          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">AI-Powered Trading Analysis Platform</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
