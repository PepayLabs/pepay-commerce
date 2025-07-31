import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updatePost, promotePost, demotePost, Post } from '../api/postsApi';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TipTapMarkdownEditor } from './TipTapMarkdownEditor';
import { Loader2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated: (updatedPost: Post) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  open,
  onOpenChange,
  onPostUpdated
}) => {
  // Use content_raw (original markdown) for editing, fallback to content if needed
  const getEditableContent = (post: Post): string => {
    // Priority: content_raw (original markdown) > content (HTML) > empty string
    return post.content_raw || post.content || '';
  };

  const [content, setContent] = useState(getEditableContent(post));
  const [selectedTier, setSelectedTier] = useState<'free' | 'subscriber'>(post.post_tier);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingTier, setIsChangingTier] = useState(false);
  const { toast } = useToast();

  const maxContentLength = 2500;

  useEffect(() => {
    if (open && post) {
      setContent(getEditableContent(post));
      setSelectedTier(post.post_tier);
    }
  }, [open, post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > maxContentLength) {
      toast({
        title: "Content too long",
        description: `Please keep your post under ${maxContentLength} characters.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let updatedPost = post;

      // Compare against the original content_raw for changes
      const originalContent = post.content_raw || post.content || '';
      if (content.trim() !== originalContent) {
        const response = await updatePost(post.post_id, { content: content.trim() });
        updatedPost = response.post;
      }

      // Handle tier change if needed
      if (selectedTier !== post.post_tier) {
        setIsChangingTier(true);
        if (selectedTier === 'free' && post.post_tier === 'subscriber') {
          // Promote to free
          const promoteResponse = await promotePost(post.post_id);
          updatedPost = promoteResponse.post;
        } else if (selectedTier === 'subscriber' && post.post_tier === 'free') {
          // Demote to subscriber
          const demoteResponse = await demotePost(post.post_id);
          updatedPost = demoteResponse.post;
        }
        setIsChangingTier(false);
      }

      toast({
        title: "Post updated successfully! ✨",
        description: "Your changes have been saved.",
      });

      onPostUpdated(updatedPost);
      onOpenChange(false);

    } catch (error: any) {
      // Extract details from the error response
      let errorMessage = "An error occurred while updating your post.";
      
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        errorMessage = error.response.data.details.join(", ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Failed to update post",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsChangingTier(false);
    }
  };

  const handleCancel = () => {
    setContent(getEditableContent(post));
    setSelectedTier(post.post_tier);
    onOpenChange(false);
  };

  // Compare against original content for change detection
  const originalContent = post.content_raw || post.content || '';
  const hasChanges = content.trim() !== originalContent || selectedTier !== post.post_tier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-3xl h-[80vh] max-h-[800px] flex flex-col p-0">
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold">Edit Post</DialogTitle>
            <DialogDescription className="text-sm">
              Update your content and manage post visibility
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Content Editor */}
            <div>
              <Label htmlFor="content" className="text-sm sm:text-base font-semibold">
                Content
              </Label>
              <TipTapMarkdownEditor
                content={content}
                onChange={setContent}
                placeholder="Update your thoughts, stories, or content..."
                maxLength={2500}
                className="mt-2"
              />
            </div>

            {/* Media Info (Read-only) */}
            {post.media_url && (
              <Card className="p-3 sm:p-4 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
                <div className="flex items-center gap-3">
                  <div className="text-xl sm:text-2xl">
                    {post.media_type === 'image' ? '🖼️' : 
                     post.media_type === 'video' ? '🎥' : '🎵'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Media attachment</p>
                    <p className="text-xs text-muted-foreground">
                      This post has a {post.media_type} attachment. Media cannot be changed after creation.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Post Tier Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Post Visibility</Label>
              <RadioGroup
                value={selectedTier}
                onValueChange={(value) => setSelectedTier(value as 'free' | 'subscriber')}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="edit-free" />
                  <Label htmlFor="edit-free" className="text-sm cursor-pointer">
                    🆓 Free (Public)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subscriber" id="edit-subscriber" />
                  <Label htmlFor="edit-subscriber" className="text-sm cursor-pointer">
                    💎 Subscriber Only
                  </Label>
                </div>
              </RadioGroup>

              {/* Show tier change indicator */}
              {selectedTier !== post.post_tier && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300">
                    {selectedTier === 'free' ? (
                      <>
                        <ArrowUp className="h-4 w-4" />
                        <span>Promoting to Public</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4" />
                        <span>Moving to Subscriber-Only</span>
                      </>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedTier === 'free' ? 'More visible' : 'More exclusive'}
                  </Badge>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                You can change the visibility of your post at any time.
              </p>
            </div>

            {/* Current Post Stats - Only show tracked metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold">{post.view_count || 0}</div>
                <div className="text-xs text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold">{post.subscriber_view_count || 0}</div>
                <div className="text-xs text-muted-foreground">💎 Subscriber Views</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg font-semibold">{post.like_count || 0}</div>
                <div className="text-xs text-muted-foreground">❤️ Likes</div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t bg-white dark:bg-gray-900">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || isChangingTier}
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || isSubmitting || isChangingTier || !content.trim() || content.length > maxContentLength}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              {isSubmitting || isChangingTier ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isChangingTier ? 'Updating visibility...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};