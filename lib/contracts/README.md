# Zorrito Contracts Integration

This directory contains the integration code for the Zorrito smart contracts deployed on Celo Mainnet.

## Contracts

### 1. ZorritoFoxNFT (ERC721) - V2
- **Address**: `0x5dAD0f11e8CFf1069c0343F86A41EDeb3AF511b0`
- **Explorer**: https://celoscan.io/address/0x5dAD0f11e8CFf1069c0343F86A41EDeb3AF511b0
- **Functionality**: Dynamic NFT for foxes with on-chain stats (lastFeed, streak, foodCredits)

### 2. ZorritoYieldEscrow - V2 (with receive() for native CELO)
- **Address**: `0x69ba0851c4b8Ed0ee8e752fdDca36c4Bf85Af17F`
- **Explorer**: https://celoscan.io/address/0x69ba0851c4b8Ed0ee8e752fdDca36c4Bf85Af17F
- **Functionality**: No-loss escrow that distributes Aave v3 yield to owners of alive foxes
- **New Feature**: Accepts native CELO directly via `receive()` function (no need for ERC20 approval)

## Setup

### 1. Update ABIs

The ABIs in `abis.ts` are placeholders. You need to replace them with the actual ABIs from the verified contracts:

1. Go to https://celoscan.io/address/0x5dAD0f11e8CFf1069c0343F86A41EDeb3AF511b0#code
2. Copy the complete ABI from the "Contract" tab
3. Replace `ZORRITO_FOX_NFT_ABI` in `abis.ts`

Repeat for the YieldEscrow contract:
1. Go to https://celoscan.io/address/0x69ba0851c4b8Ed0ee8e752fdDca36c4Bf85Af17F#code
2. Copy the complete ABI
3. Replace `ZORRITO_YIELD_ESCROW_ABI` in `abis.ts`

## Usage

### Using React Hooks (Recommended)

```typescript
import { useFoxInfo, useFeedFox, useAliveFoxes } from '@/hooks/useZorritoNFT'
import { useDepositCelo, useEscrowInfo } from '@/hooks/useZorritoEscrow'
import { useAccount } from 'wagmi'

function MyComponent() {
  const { address } = useAccount()
  const { foxInfo, isLoading } = useFoxInfo(0n) // tokenId = 0
  const { feedFox, isPending } = useFeedFox()
  const { aliveFoxes } = useAliveFoxes(address)
  const { depositCelo } = useDepositCelo()
  const { escrowInfo } = useEscrowInfo(address)

  const handleFeed = () => {
    feedFox(0n) // Feed fox with tokenId 0
  }

  const handleDeposit = () => {
    depositCelo('10') // Deposit 10 CELO
  }

  return (
    <div>
      {foxInfo && (
        <div>
          <p>Fox ID: {foxInfo.foxId}</p>
          <p>Alive: {foxInfo.isAlive ? 'Yes' : 'No'}</p>
          <p>Streak: {foxInfo.streak.toString()}</p>
          <button onClick={handleFeed} disabled={isPending}>
            Feed Fox
          </button>
        </div>
      )}
    </div>
  )
}
```

### Using Helper Functions

```typescript
import { getFoxInfo, feedFox } from '@/lib/contracts/zorritoFoxNFT'
import { depositCelo, getEscrowInfo } from '@/lib/contracts/zorritoYieldEscrow'
import { usePublicClient, useWalletClient } from 'wagmi'

function MyComponent() {
  const publicClient = usePublicClient()
  const walletClient = useWalletClient()

  const handleFeed = async () => {
    if (!walletClient) return
    try {
      const hash = await feedFox(walletClient, 0n)
      console.log('Transaction hash:', hash)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleGetInfo = async () => {
    if (!publicClient) return
    const info = await getFoxInfo(publicClient, 0n)
    console.log('Fox info:', info)
  }

  return (
    <div>
      <button onClick={handleGetInfo}>Get Fox Info</button>
      <button onClick={handleFeed}>Feed Fox</button>
    </div>
  )
}
```

## Key Functions

### ZorritoFoxNFT

- `mintFox(owner, foxIdString, tokenURI)` - Mint a new fox (only contract owner)
- `feedFox(tokenId)` - Feed a fox (anyone can call)
- `foxInfo(tokenId)` - Get fox information
- `getAliveFoxes(user)` - Get array of alive fox tokenIds for a user
- A fox is "alive" if `block.timestamp - lastFeed < 48 hours` (172800 seconds)

### ZorritoYieldEscrow

- `receive()` - Accept native CELO directly (V2 feature - no approval needed)
- `deposit(amount)` - Deposit CELO ERC20 (requires approval first)
- `withdraw(amount)` - Withdraw principal (only principal owner)
- `getAliveFoxes(user)` - Get alive foxes for user (view function)
- `getAvailableYield()` - Get available yield for distribution (view)
- `harvestAndDistribute()` - Distribute yield to alive foxes (only contract owner)
- `principal(address)` - Get principal deposited by a user (view)
- Distribution: 90% prizes, 2% donation, 8% fees

## Important Notes

- All amounts are in wei (use `parseEther` to convert from CELO to wei)
- A fox dies after 48 hours (172800 seconds) without feeding
- Only contract owner can mint foxes and distribute yield
- Principal is always withdrawable, only yield is distributed
- Newly minted foxes start with `lastFeed = block.timestamp`, so they're alive initially


