import { createLazyFileRoute } from '@tanstack/react-router'
import MaterialSignUp from '@/features/auth/sign-up/material-sign-up'

export const Route = createLazyFileRoute('/(auth)/sign-up')({
  component: MaterialSignUp,
})
