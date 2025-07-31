// src/routes/(auth)/sign-up.tsx
import { createFileRoute } from '@tanstack/react-router'
import MaterialSignUp from '@/features/auth/sign-up/material-sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: MaterialSignUp,
})