import { createLazyFileRoute } from '@tanstack/react-router'
import UserSignIn from '@/features/userAuth/user-sign-in/user-sign-in'

export const Route = createLazyFileRoute('/(userAuth)/user-sign-in')({
  component: UserSignIn,
})
