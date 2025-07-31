import { createFileRoute } from '@tanstack/react-router'
import MaterialSignIn from '@/features/auth/sign-in/material-sign-in'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: MaterialSignIn,
})