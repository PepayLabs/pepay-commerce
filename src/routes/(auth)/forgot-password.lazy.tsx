import { createLazyFileRoute } from '@tanstack/react-router'
import MaterialForgotPassword from '@/features/auth/forgot-password/material-forgot-password'

export const Route = createLazyFileRoute('/(auth)/forgot-password')({
  component: MaterialForgotPassword,
})
