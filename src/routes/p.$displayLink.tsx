import { createFileRoute } from '@tanstack/react-router'
import UserPostsPage from '@/features/userPosts/pages/user-posts'

// Route for posts at /p/:displayLink
export const Route = createFileRoute('/p/$displayLink')({
  component: UserPostsPage,
})