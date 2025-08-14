import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Search className="h-4 w-4 mr-2" />
                Search Tokens
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Shadow Signals - AI-Powered Crypto Analysis</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
