# Farcaster Integration

This project is integrated with Farcaster SDK and configured as a Farcaster miniapp.

## Configuration Files

### `farcaster.json`
Contains the miniapp configuration that defines how the app appears when shared on Farcaster.

### Meta Tags
The app includes Farcaster miniapp meta tags in `app/layout.tsx` that enable the app to be shared and embedded in Farcaster feeds.

## Using Farcaster Authentication

The app includes `@farcaster/auth-kit` for Farcaster authentication. To use Farcaster authentication in your components:

```tsx
import { useFarcaster } from '@/hooks/use-farcaster'

function MyComponent() {
  const { isAuthenticated, user, signIn, signOut, username, fid } = useFarcaster()

  if (!isAuthenticated) {
    return <button onClick={signIn}>Sign in with Farcaster</button>
  }

  return (
    <div>
      <p>Welcome, {username}!</p>
      <p>FID: {fid}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  )
}
```

## Miniapp Sharing

When users share your app URL on Farcaster, it will automatically display as a miniapp card with:
- The app image from `farcaster.json`
- A "Play Now" button that launches the miniapp
- Rich preview with app description

## Environment Variables

Optional environment variables for Farcaster:
- `NEXT_PUBLIC_FARCASTER_RPC_URL`: Custom RPC URL (if needed)

## Resources

- [Farcaster Miniapps Documentation](https://miniapps.farcaster.xyz)
- [Farcaster Auth Kit](https://github.com/farcasterxyz/auth-monorepo)
- [Get Farcaster App ID](https://warpcast.com/~/developers)

