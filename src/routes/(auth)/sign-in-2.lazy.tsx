import { createLazyFileRoute } from '@tanstack/react-router'
import MaterialSignIn from '@/features/auth/sign-in/material-sign-in'

export const Route = createLazyFileRoute('/(auth)/sign-in-2')({
  component: MaterialSignIn,
})
