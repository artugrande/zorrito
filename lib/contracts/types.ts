/**
 * TypeScript types for Zorrito contracts
 */

export interface FoxInfo {
  tokenId: bigint
  owner: string
  tokenURI: string
  foxId: string // Converted from bytes32
  lastFeed: Date
  streak: bigint
  foodCredits: bigint
  isAlive: boolean
}

export interface EscrowInfo {
  principal: bigint
  totalPrincipal: bigint
  availableYield: bigint
  aliveFoxes: bigint[]
}

export interface FoxInfoRaw {
  foxId: `0x${string}` // bytes32 from contract
  lastFeed: bigint
  streak: bigint
  foodCredits: bigint
}


