// Wallet connection utilities for Portfolio AI Analyst

export type WalletType = "metamask" | "walletconnect" | "phantom"
export type ChainType = "ethereum" | "solana"

export interface WalletConnection {
  address: string
  chain: ChainType
  walletType: WalletType
}

// MetaMask connection
export async function connectMetaMask(): Promise<WalletConnection> {
  if (typeof window === "undefined") {
    throw new Error("Window is not defined")
  }

  // Check if MetaMask is installed
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
  }

  try {
    console.log("[v0] Connecting to MetaMask...")

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask.")
    }

    const address = accounts[0]
    console.log("[v0] MetaMask connected:", address)

    return {
      address,
      chain: "ethereum",
      walletType: "metamask",
    }
  } catch (error: any) {
    console.error("[v0] MetaMask connection error:", error)
    if (error.code === 4001) {
      throw new Error("Connection request rejected. Please approve the connection in MetaMask.")
    }
    throw new Error(`Failed to connect to MetaMask: ${error.message}`)
  }
}

// WalletConnect connection (simplified - in production would use @walletconnect/web3-provider)
export async function connectWalletConnect(): Promise<WalletConnection> {
  if (typeof window === "undefined") {
    throw new Error("Window is not defined")
  }

  try {
    console.log("[v0] Connecting to WalletConnect...")

    // In production, this would use WalletConnect SDK
    // For now, we'll check if MetaMask is available as a fallback
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0]
      console.log("[v0] WalletConnect connected (via MetaMask):", address)

      return {
        address,
        chain: "ethereum",
        walletType: "walletconnect",
      }
    }

    throw new Error("WalletConnect requires a compatible wallet. Please install MetaMask or use the WalletConnect app.")
  } catch (error: any) {
    console.error("[v0] WalletConnect connection error:", error)
    throw new Error(`Failed to connect via WalletConnect: ${error.message}`)
  }
}

// Phantom wallet connection (Solana)
export async function connectPhantom(): Promise<WalletConnection> {
  if (typeof window === "undefined") {
    throw new Error("Window is not defined")
  }

  // Check if Phantom is installed
  const phantom = (window as any).phantom?.solana

  if (!phantom) {
    throw new Error("Phantom wallet is not installed. Please install Phantom to continue.")
  }

  try {
    console.log("[v0] Connecting to Phantom...")

    // Request connection
    const response = await phantom.connect()

    if (!response.publicKey) {
      throw new Error("No public key found. Please unlock Phantom.")
    }

    const address = response.publicKey.toString()
    console.log("[v0] Phantom connected:", address)

    return {
      address,
      chain: "solana",
      walletType: "phantom",
    }
  } catch (error: any) {
    console.error("[v0] Phantom connection error:", error)
    if (error.code === 4001) {
      throw new Error("Connection request rejected. Please approve the connection in Phantom.")
    }
    throw new Error(`Failed to connect to Phantom: ${error.message}`)
  }
}

// Disconnect wallet
export async function disconnectWallet(walletType: WalletType): Promise<void> {
  try {
    console.log("[v0] Disconnecting wallet:", walletType)

    if (walletType === "phantom") {
      const phantom = (window as any).phantom?.solana
      if (phantom) {
        await phantom.disconnect()
      }
    }

    // For MetaMask and WalletConnect, we just clear the local state
    // The wallet itself remains connected to the site until user manually disconnects
    console.log("[v0] Wallet disconnected successfully")
  } catch (error) {
    console.error("[v0] Error disconnecting wallet:", error)
    throw error
  }
}

// Get current wallet connection status
export async function getWalletStatus(walletType: WalletType): Promise<WalletConnection | null> {
  try {
    if (walletType === "metamask" || walletType === "walletconnect") {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })

        if (accounts && accounts.length > 0) {
          return {
            address: accounts[0],
            chain: "ethereum",
            walletType,
          }
        }
      }
    } else if (walletType === "phantom") {
      const phantom = (window as any).phantom?.solana
      if (phantom && phantom.isConnected) {
        return {
          address: phantom.publicKey.toString(),
          chain: "solana",
          walletType: "phantom",
        }
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error checking wallet status:", error)
    return null
  }
}

// Format wallet address for display
export function formatWalletAddress(address: string, chars = 4): string {
  if (!address) return ""
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Copy address to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("[v0] Failed to copy to clipboard:", error)
    return false
  }
}

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any
  }
}
