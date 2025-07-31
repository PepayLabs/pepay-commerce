import { createFileRoute } from '@tanstack/react-router'
import Payments from '@/features/Payments'

export const Route = createFileRoute('/_authenticated/payments/')({
  component: Payments
})
