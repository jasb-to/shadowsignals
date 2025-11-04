import { SUBSCRIPTION_TIERS, formatPrice } from "@/lib/subscription-tiers"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400">Unlock powerful on-chain analytics and whale tracking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBSCRIPTION_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-gray-800/50 rounded-xl p-6 flex flex-col ${
                tier.id === "pro"
                  ? "border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                  : "border border-gray-700"
              } hover:border-cyan-500/40 transition-all duration-300`}
            >
              {tier.id === "pro" && (
                <div className="text-xs font-semibold text-cyan-400 mb-2 bg-cyan-500/20 px-3 py-1 rounded-full w-fit">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
              <div className="text-3xl font-bold mb-4 text-cyan-400">{formatPrice(tier.priceInCents)}</div>
              <p className="text-sm text-gray-400 mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-6 flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.id === "free" ? (
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  asChild
                >
                  <Link href="/">Get Started</Link>
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  asChild
                >
                  <Link href={`/pricing/checkout?tier=${tier.id}`}>Subscribe Now</Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-400">
          <p>All plans include a 7-day money-back guarantee</p>
          <p className="mt-2">
            Need a custom plan?{" "}
            <Link href="/contact" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
