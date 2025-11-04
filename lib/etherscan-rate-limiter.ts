// Etherscan Free API Rate Limits:
// - Max 5 calls per second
// - Max 100,000 calls per day

class EtherscanRateLimiter {
  private callTimestamps: number[] = []
  private dailyCallCount = 0
  private dailyResetTime = Date.now() + 24 * 60 * 60 * 1000

  private readonly MAX_CALLS_PER_SECOND = 5
  private readonly MAX_CALLS_PER_DAY = 100000
  private readonly SECOND_IN_MS = 1000

  async waitForSlot(): Promise<void> {
    // Reset daily counter if 24 hours have passed
    if (Date.now() >= this.dailyResetTime) {
      this.dailyCallCount = 0
      this.dailyResetTime = Date.now() + 24 * 60 * 60 * 1000
      console.log("[v0] Etherscan daily rate limit reset")
    }

    // Check daily limit
    if (this.dailyCallCount >= this.MAX_CALLS_PER_DAY) {
      const waitTime = this.dailyResetTime - Date.now()
      console.error(`[v0] Etherscan daily limit reached. Resets in ${Math.floor(waitTime / 1000 / 60)} minutes`)
      throw new Error("Etherscan daily API limit reached. Please try again tomorrow.")
    }

    // Remove timestamps older than 1 second
    const now = Date.now()
    this.callTimestamps = this.callTimestamps.filter((timestamp) => now - timestamp < this.SECOND_IN_MS)

    // If we've hit the per-second limit, wait
    if (this.callTimestamps.length >= this.MAX_CALLS_PER_SECOND) {
      const oldestCall = this.callTimestamps[0]
      const waitTime = this.SECOND_IN_MS - (now - oldestCall) + 50 // Add 50ms buffer
      console.log(`[v0] Etherscan rate limit: waiting ${waitTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return this.waitForSlot() // Recursive call after waiting
    }

    // Record this call
    this.callTimestamps.push(now)
    this.dailyCallCount++

    // Log usage every 1000 calls
    if (this.dailyCallCount % 1000 === 0) {
      console.log(
        `[v0] Etherscan API usage: ${this.dailyCallCount}/${this.MAX_CALLS_PER_DAY} calls today (${Math.floor((this.dailyCallCount / this.MAX_CALLS_PER_DAY) * 100)}%)`,
      )
    }
  }

  getUsageStats() {
    return {
      dailyCallCount: this.dailyCallCount,
      maxDailyCalls: this.MAX_CALLS_PER_DAY,
      remainingCalls: this.MAX_CALLS_PER_DAY - this.dailyCallCount,
      percentageUsed: (this.dailyCallCount / this.MAX_CALLS_PER_DAY) * 100,
      resetsAt: new Date(this.dailyResetTime).toISOString(),
    }
  }
}

// Singleton instance
export const etherscanRateLimiter = new EtherscanRateLimiter()
