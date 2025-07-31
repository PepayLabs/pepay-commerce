import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '@/features/profiles/pages/ProfilePage'

// Route for profiles at /i/:displayLink
export const Route = createFileRoute('/i/$displayLink')({
  component: ProfilePage,
})