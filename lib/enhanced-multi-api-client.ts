import type { CryptoToken, MarketOverview, SearchResult, ApiResponse } from "./types"

class EnhancedMultiApiClient {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private safeJsonParse<T>(text: string): T | null {
    try {
      return JSON.parse(text) as T
    } catch {
      return null
    }
  }

  async searchTokens(query: string): Promise<ApiResponse<SearchResult[]>> {
    try {
      const response = await this.fetchWithTimeout(`/api/v1/search?q=${encodeURIComponent(query)}`)

      if (response.ok) {
        const text = await response.text()
        const data = this.safeJsonParse<ApiResponse<SearchResult[]>>(text)

        if (data) {
          return data
        }
      }
    } catch (error) {
      console.warn("Search API failed:", error)
    }

    // Return empty results on failure
    return {
      success: false,
      error: "Search service unavailable",
      data: [],
    }
  }

  async getTokenData(tokenId: string): Promise<ApiResponse<CryptoToken>> {
    try {
      const response = await this.fetchWithTimeout(`/api/tokens?id=${encodeURIComponent(tokenId)}`)

      if (response.ok) {
        const text = await response.text()
        const data = this.safeJsonParse<ApiResponse<CryptoToken>>(text)

        if (data) {
          return data
        }
      }
    } catch (error) {
      console.warn("Token API failed:", error)
    }

    // Return error response
    return {
      success: false,
      error: "Token data service unavailable",
    }
  }

  async getMarketOverview(): Promise<ApiResponse<MarketOverview>> {
    try {
      const response = await this.fetchWithTimeout("/api/market-overview")

      if (response.ok) {
        const text = await response.text()
        const data = this.safeJsonParse<ApiResponse<MarketOverview>>(text)

        if (data) {
          return data
        }
      }
    } catch (error) {
      console.warn("Market overview API failed:", error)
    }

    // Return error response
    return {
      success: false,
      error: "Market overview service unavailable",
    }
  }
}

export const apiClient = new EnhancedMultiApiClient()
