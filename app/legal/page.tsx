import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, Mail, AlertTriangle } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Shadow Signals</h1>
              <p className="text-slate-400 text-sm">Legal Information & Privacy Policy</p>
            </div>
            <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
        {/* Privacy Policy */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-cyan-400">Privacy Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString("en-GB")}
            </p>

            <h3 className="text-white font-semibold text-base">1. Information We Collect</h3>
            <p>
              Shadow Signals operates as a cryptocurrency analysis platform. We collect minimal data necessary to
              provide our services:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Search queries for cryptocurrency tokens</li>
              <li>Usage analytics to improve our platform performance</li>
              <li>Technical data such as IP addresses for security purposes</li>
            </ul>

            <h3 className="text-white font-semibold text-base">2. How We Use Your Information</h3>
            <p>We use collected information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide cryptocurrency analysis and trading signals</li>
              <li>Improve our AI algorithms and platform functionality</li>
              <li>Monitor platform security and prevent abuse</li>
              <li>Comply with legal obligations under UK law</li>
            </ul>

            <h3 className="text-white font-semibold text-base">3. Data Protection (UK GDPR)</h3>
            <p>Under the UK General Data Protection Regulation (UK GDPR), you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Erase your personal data</li>
              <li>Restrict processing of your personal data</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>

            <h3 className="text-white font-semibold text-base">4. Data Retention</h3>
            <p>
              We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy or
              as required by UK law. Search queries and usage data are typically retained for 12 months for analytical
              purposes.
            </p>

            <h3 className="text-white font-semibold text-base">5. Third-Party Services</h3>
            <p>
              Our platform integrates with third-party cryptocurrency data providers (CoinGecko, CoinPaprika) and AI
              services (Hugging Face). These services have their own privacy policies and data handling practices.
            </p>

            <h3 className="text-white font-semibold text-base">6. Contact Information</h3>
            <p>
              For any privacy-related inquiries or to exercise your rights under UK GDPR, please contact us at:{" "}
              <a href="mailto:info@shadowsignals.live" className="text-cyan-400 hover:text-cyan-300">
                info@shadowsignals.live
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-blue-400">Terms of Service</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString("en-GB")}
            </p>

            <h3 className="text-white font-semibold text-base">1. Acceptance of Terms</h3>
            <p>
              By accessing and using Shadow Signals, you accept and agree to be bound by the terms and provision of this
              agreement. This service is operated under UK law.
            </p>

            <h3 className="text-white font-semibold text-base">2. Description of Service</h3>
            <p>
              Shadow Signals provides AI-powered cryptocurrency analysis, trading signals, and market insights for
              educational and informational purposes only. We do not provide financial advice or investment
              recommendations.
            </p>

            <h3 className="text-white font-semibold text-base">3. User Responsibilities</h3>
            <p>Users agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use the service for lawful purposes only</li>
              <li>Not attempt to manipulate or interfere with the platform</li>
              <li>Understand that all trading involves risk</li>
              <li>Conduct their own research before making investment decisions</li>
            </ul>

            <h3 className="text-white font-semibold text-base">4. Disclaimer of Warranties</h3>
            <p>
              Shadow Signals is provided "as is" without any warranties, expressed or implied. We do not guarantee the
              accuracy, completeness, or reliability of any analysis or signals provided.
            </p>

            <h3 className="text-white font-semibold text-base">5. Limitation of Liability</h3>
            <p>
              Shadow Signals and its operators shall not be liable for any direct, indirect, incidental, special, or
              consequential damages resulting from the use or inability to use our service, including but not limited to
              trading losses.
            </p>

            <h3 className="text-white font-semibold text-base">6. Governing Law</h3>
            <p>
              These terms shall be governed by and construed in accordance with the laws of England and Wales. Any
              disputes shall be subject to the exclusive jurisdiction of the English courts.
            </p>
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-red-400">Investment Risk Warning</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p className="text-red-300 font-semibold">
              IMPORTANT: Cryptocurrency trading carries a high level of risk and may not be suitable for all investors.
            </p>
            <p>
              The high degree of leverage and volatility in cryptocurrency markets can work against you as well as for
              you. Before deciding to trade cryptocurrencies, you should carefully consider your investment objectives,
              level of experience, and risk appetite.
            </p>
            <p>
              There is a possibility that you may sustain a loss of some or all of your initial investment and therefore
              you should not invest money that you cannot afford to lose. You should be aware of all the risks
              associated with cryptocurrency trading and seek advice from an independent financial advisor if you have
              any doubts.
            </p>
            <p className="text-red-300 font-semibold">
              Past performance is not indicative of future results. All trading signals and analysis are for educational
              purposes only.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-400" />
              <CardTitle className="text-green-400">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            <p>For support, inquiries, or to exercise your data protection rights, please contact us at:</p>
            <p className="mt-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:info@shadowsignals.live" className="text-cyan-400 hover:text-cyan-300">
                info@shadowsignals.live
              </a>
            </p>
            <p className="mt-4 text-slate-400">
              We aim to respond to all inquiries within 48 hours during business days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
