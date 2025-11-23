/**
 * Contract addresses and configuration for Celo Mainnet
 */

// Celo Mainnet Chain ID
export const CELO_MAINNET_CHAIN_ID = 42220

// Contract addresses
export const ZORRITO_FOX_NFT_ADDRESS = '0x1E8f9f16eB19c980375B39D70fc198F507618A60' as const
export const ZORRITO_YIELD_ESCROW_ADDRESS = '0x5e27e1fFC65BFEDdAe79B3CA89Fa09E617F2F853' as const

// Token addresses
export const CELO_TOKEN_ADDRESS = '0x471EcE3750Da237f93B8E339C536989b8978a438' as const
export const ACELO_TOKEN_ADDRESS = '0x7037F7296B2fc7908de7b57a89efaa8319f0C4E2' as const
export const AAVE_POOL_ADDRESS = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' as const

// Time constants
export const FOX_ALIVE_DURATION_SECONDS = 172800 // 48 hours
export const FOX_ALIVE_DURATION_MS = FOX_ALIVE_DURATION_SECONDS * 1000

// Distribution percentages (in basis points, 10000 = 100%)
export const YIELD_DISTRIBUTION = {
  PRIZES: 9000, // 90%
  DONATION: 200, // 2%
  FEES: 800, // 8%
} as const


