import { createFileRoute } from '@tanstack/react-router'
import ContentPage from '@/features/userContent/pages/ContentPage'

export const Route = createFileRoute('/c/$displayLink')({
  component: ContentPage,
})


