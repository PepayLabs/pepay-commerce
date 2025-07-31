import { createLazyFileRoute } from '@tanstack/react-router'
import MaterialHome from '@/features/home/material-home'

export const Route = createLazyFileRoute('/home')({
  component: MaterialHome,
})

