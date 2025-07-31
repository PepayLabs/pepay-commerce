import React, { useState, useEffect } from 'react';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { fetchPosts, togglePostPin, deletePost, PostPreview, Post } from './api/postsApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  RefreshCw, 
  Filter,
  FileText,
  Plus,
  AlertCircle
} from 'lucide-react';

export const Posts: React.FC = () => {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'subscriber'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const postsPerPage = 7;

  const loadPosts = async (offset: number = 0, filter: typeof tierFilter = tierFilter, append: boolean = false) => {
    try {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await fetchPosts(postsPerPage, offset, filter);
      
      if (append) {
        setPosts(prev => [...prev, ...response]);
      } else {
        setPosts(response);
      }
      
      // Simple heuristic: if we got fewer posts than requested, there are no more
      setHasMore(response.length >= postsPerPage);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast({
        title: "Failed to load posts",
        description: error.response?.data?.message || "An error occurred while loading posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(0, tierFilter, false);
  }, [tierFilter]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(posts.length, tierFilter, true);
    }
  };

  const handleRefresh = () => {
    loadPosts(0, tierFilter, false);
  };

  const handlePostCreated = () => {
    handleRefresh();
  };

  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    try {
      const response = await togglePostPin(postId, isPinned);
      
      // Handle the one-pinned-post constraint
      setPosts(prev => prev.map(post => {
        if (post.post_id === postId) {
          return { ...post, is_pinned: isPinned };
        }
        // If another post was unpinned, update its status
        if (response.unpinned_post_id && post.post_id === response.unpinned_post_id) {
          return { ...post, is_pinned: false };
        }
        return post;
      }));

      if (isPinned) {
        toast({
          title: "Post pinned! 📌",
          description: response.unpinned_post_id 
            ? "This post is now pinned. The previously pinned post has been unpinned."
            : "This post will appear at the top of your feed.",
        });
      } else {
        toast({
          title: "Post unpinned",
          description: "This post is no longer pinned.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to update post",
        description: error.response?.data?.message || "An error occurred while updating the post.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const response = await deletePost(postToDelete);
      toast({
        title: "Post deleted successfully! 🗑️",
        description: `${response.freemium_info.can_create_free_post ? 
          `You now have ${response.freemium_info.free_posts_remaining} free post slots available.` :
          'Post has been permanently deleted.'
        }`,
      });
      setPosts(prev => prev.filter(post => post.post_id !== postToDelete));
    } catch (error: any) {
      toast({
        title: "Failed to delete post",
        description: error.response?.data?.message || "An error occurred while deleting the post.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    // Update the post in the list with the new data
    setPosts(prev => prev.map(post => 
      post.post_id === updatedPost.post_id 
        ? { ...post, content: updatedPost.content, updated_at: updatedPost.updated_at }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600 dark:text-gray-400">Loading your posts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 py-6 ml-4 mr-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Posts 📝
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Share your thoughts and connect with your audience
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 sm:ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shrink-0"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shrink-0"
                size="sm"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Post</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={tierFilter} onValueChange={(value: any) => setTierFilter(value)}>
                <SelectTrigger className="w-full sm:w-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="free">🆓 Free Posts</SelectItem>
                  <SelectItem value="subscriber">💎 Subscriber Posts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {posts.length > 0 && (
                <Badge variant="secondary" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 text-xs">
                  {posts.length} post{posts.length !== 1 ? 's' : ''} loaded
                </Badge>
              )}

              {/* Pin Info */}
              {posts.some(post => post.is_pinned) && (
                <Badge variant="outline" className="backdrop-blur-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs">
                  📌 1 post pinned
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="text-center">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                  Start sharing your thoughts and stories with your audience. Your first 5 posts will be free and publicly visible!
                </p>
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                  size="default"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Post
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.post_id}
                post={post}
                onTogglePin={handleTogglePin}
                onDelete={handleDeleteClick}
                onPostUpdated={handlePostUpdated}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 hover:bg-white/90 dark:hover:bg-gray-900/90"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading more posts...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Load More Posts
                    </>
                  )}
                </Button>
              </div>
            )}

            {!hasMore && posts.length >= postsPerPage && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  🎉 You've reached the end! No more posts to load.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Post Modal - Now properly controlled */}
        <CreatePostModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            handlePostCreated();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Delete Post
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Posts;
