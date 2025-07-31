import { createFileRoute } from '@tanstack/react-router'
import Posts from '@/features/posts'
export const Route = createFileRoute('/_authenticated/posts/')({
  component: Posts
})
