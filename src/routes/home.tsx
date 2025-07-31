import { createFileRoute } from '@tanstack/react-router'
import MaterialHome from '@/features/home/material-home'

export const Route = createFileRoute('/home')({
  component: MaterialHome,
})

