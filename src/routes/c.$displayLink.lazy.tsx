import { createLazyFileRoute } from '@tanstack/react-router'
import ContentPage from '@/features/userContent/pages/ContentPage'

// Route for posts at /p/:displayLink
export const Route = createLazyFileRoute('/c/$displayLink')({
  component: ContentPage,
})