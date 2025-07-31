import { createLazyFileRoute } from '@tanstack/react-router'
import UserPostsPage from '@/features/userPosts/pages/user-posts'

// Route for posts at /p/:displayLink
export const Route = createLazyFileRoute('/p/$displayLink')({
  component: UserPostsPage,
})