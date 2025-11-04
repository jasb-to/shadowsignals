/**
 * AI Client for Shadow Signals
 * Uses Hugging Face Inference API for FinMA-7B (financial domain-specific model)
 */

import { HfInference } from "@huggingface/inference"

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ""
const HF_ENABLED = !!process.env.HUGGINGFACE_API_KEY

const FINMA_MODEL = "ChanceFocus/finma-7b-full"
const MISTRAL_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"

export interface AIAnalysisRequest {
  prompt: string
  max_length?: number
  use_fallback?: boolean
}

export interface AIAnalysisResponse {
  result?: string
  analysis?: string
  model_used: string
  success: boolean
  error?: string
}

export interface PortfolioAnalysisRequest {
  holdings: Array<{
    symbol: string
    value: number
    allocation: number
  }>
  total_value: number
  market_data: {
    btc_price: number
    total_market_cap: number
    btc_dominance: number
  }
}

export interface TokenAnalysisRequest {
  symbol: string
  price: number
  change_24h: number
  volume: number
  market_cap: number
  technical_data: {
    rsi?: number
    macd?: string
    support?: number
    resistance?: number
  }
}

/**
 * Check if Hugging Face API is configured
 */
export async function checkAIServerHealth(): Promise<boolean> {
  return HF_ENABLED
}

/**
 * General AI analysis using FinMA-7B
 */
export async function analyzeWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  if (!HF_ENABLED) {
    return {
      model_used: "none",
      success: false,
      error: "Hugging Face API key not configured",
    }
  }

  const hf = new HfInference(HF_API_KEY)

  try {
    console.log("[v0] Calling FinMA-7B for financial analysis...")

    const response = await hf.textGeneration({
      model: FINMA_MODEL,
      inputs: request.prompt,
      parameters: {
        max_new_tokens: request.max_length || 200,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
      },
    })

    console.log("[v0] FinMA-7B analysis successful")

    return {
      result: response.generated_text,
      analysis: response.generated_text,
      model_used: "FinMA-7B-full",
      success: true,
    }
  } catch (error) {
    console.log("[v0] FinMA-7B failed, trying Mistral-7B fallback...")

    try {
      const response = await hf.textGeneration({
        model: MISTRAL_MODEL,
        inputs: request.prompt,
        parameters: {
          max_new_tokens: request.max_length || 200,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      })

      console.log("[v0] Mistral-7B fallback successful")

      return {
        result: response.generated_text,
        analysis: response.generated_text,
        model_used: "Mistral-7B-Instruct",
        success: true,
      }
    } catch (fallbackError) {
      console.log("[v0] Both AI models failed, using rule-based analysis")
      return {
        model_used: "none",
        success: false,
        error: fallbackError instanceof Error ? fallbackError.message : "AI analysis failed",
      }
    }
  }
}

/**
 * Portfolio AI analysis using FinMA-7B
 */
export async function analyzePortfolio(request: PortfolioAnalysisRequest): Promise<AIAnalysisResponse> {
  if (!HF_ENABLED) {
    return {
      model_used: "none",
      success: false,
      error: "Hugging Face API key not configured",
    }
  }

  const prompt = `As a financial analyst, analyze this crypto portfolio:

Holdings:
${request.holdings.map((h) => `- ${h.symbol}: ${h.allocation.toFixed(1)}% (£${h.value.toLocaleString()})`).join("\n")}

Total Portfolio Value: £${request.total_value.toLocaleString()}
Market Context: BTC £${request.market_data.btc_price.toLocaleString()}, Dominance ${request.market_data.btc_dominance.toFixed(1)}%

Provide a 2-3 sentence analysis covering: risk assessment, diversification quality, and one actionable recommendation.`

  return analyzeWithAI({ prompt, max_length: 250 })
}

/**
 * Token AI analysis using FinMA-7B
 */
export async function analyzeToken(request: TokenAnalysisRequest): Promise<AIAnalysisResponse> {
  if (!HF_ENABLED) {
    return {
      model_used: "none",
      success: false,
      error: "Hugging Face API key not configured",
    }
  }

  const prompt = `As a crypto analyst, analyze ${request.symbol}:

Price: £${request.price.toFixed(request.price < 1 ? 6 : 2)}
24h Change: ${request.change_24h > 0 ? "+" : ""}${request.change_24h.toFixed(2)}%
Volume: £${request.volume.toLocaleString()}
Market Cap: £${request.market_cap.toLocaleString()}
RSI: ${request.technical_data.rsi?.toFixed(1) || "N/A"}
MACD: ${request.technical_data.macd || "N/A"}

Provide a 2-3 sentence trading analysis with a clear buy/sell/hold recommendation and confidence level.`

  return analyzeWithAI({ prompt, max_length: 250 })
}
