import { createLazyFileRoute } from '@tanstack/react-router'
import { ContentPage } from '@/features/content'

export const Route = createLazyFileRoute('/_authenticated/content/')({
  component: ContentPage
})
