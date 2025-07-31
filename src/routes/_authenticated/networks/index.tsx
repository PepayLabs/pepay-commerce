import { createFileRoute } from '@tanstack/react-router'
import Network from '@/features/network'

export const Route = createFileRoute('/_authenticated/networks/')({
  component: Network,
})
