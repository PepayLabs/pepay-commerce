import { createLazyFileRoute } from '@tanstack/react-router'
import Posts from '@/features/posts'
export const Route = createLazyFileRoute('/_authenticated/posts/')({
  component: Posts
})
