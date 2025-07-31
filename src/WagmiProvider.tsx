import { WagmiProvider as WagmiProviderCore } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi-config'
import { ReactNode } from 'react'

interface WagmiProviderProps {
  children: ReactNode
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProviderCore config={wagmiConfig}>
      {children}
    </WagmiProviderCore>
  )
}