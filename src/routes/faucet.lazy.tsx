import { createLazyFileRoute } from '@tanstack/react-router'
import FaucetPage from '@/features/faucet/faucet-page'

export const Route = createLazyFileRoute('/faucet')({
  component: FaucetPage,
})


