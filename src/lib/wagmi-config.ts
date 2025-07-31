import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { 
  bsc,           // BNB Smart Chain 
  avalanche,     // AVAX
  mainnet, 
  arbitrum, 
  polygon, 
  optimism, 
  base 
} from 'wagmi/chains'  // Use wagmi/chains instead of @reown/appkit/networks

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '98363cb7dabd04bd755d6883b8c36d43'

// 2. Create the adapter - BNB FIRST in order
const wagmiAdapter = new WagmiAdapter({
  networks: [bsc, avalanche, mainnet, polygon, arbitrum, optimism, base],
  projectId
})

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bsc, avalanche, mainnet, polygon, arbitrum, optimism, base],
  defaultNetwork: bsc,
  metadata: {
    name: 'Grab Me A Slice',
    description: 'Access exclusive content from your favorite creators',
    url: 'https://grabmeaslice.com',
    icons: ['/images/gmas-app-square.png']
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#F0B90B',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '12px',
  },
  // Enable specific wallet features
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}