import  { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PostPreview, Post, fetchPostById, togglePostLike } from '../api/postsApi';
import { EditPostModal } from './EditPostModal';
import { 
  ChevronDown, 
  ChevronUp, 
  Pin, 
  PinOff, 
  Eye, 
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  HardDrive,
  FileType,
  ExternalLink,
  Play,
  Twitter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { XEmbed } from './XEmbed'

interface PostCardProps {
  post: PostPreview;
  onTogglePin?: (postId: string, isPinned: boolean) => void;
  onDelete?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
  isExpanded?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onTogglePin,
  onDelete,
  onPostUpdated,
  isExpanded: controlledExpanded
}: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(controlledExpanded ?? false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fullPost, setFullPost] = useState<Post | null>(null);
  const [loadingFullContent, setLoadingFullContent] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [liking, setLiking] = useState(false);
  const [pinning, setPinning] = useState(false);
  const { toast } = useToast();

  const expanded = controlledExpanded !== undefined ? controlledExpanded : isExpanded;
  const currentPost = fullPost || post;

  const toggleExpanded = async () => {
    if (controlledExpanded !== undefined) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    // Lazy load full content when expanding (always needed for media URLs and full content)
    if (newExpanded && !fullPost && !loadingFullContent) {
      await loadFullContent();
    }
  };

  const loadFullContent = async () => {
    setLoadingFullContent(true);
    try {
      const fullPostData = await fetchPostById(post.post_id);
      setFullPost(fullPostData);
    } catch (error: any) {
      toast({
        title: "Failed to load full content",
        description: error.response?.data?.message || "An error occurred while loading the post content.",
        variant: "destructive",
      });
    } finally {
      setLoadingFullContent(false);
    }
  };

  const handleLike = async () => {
    if (!fullPost || liking) return;
    
    setLiking(true);
    try {
      await togglePostLike(fullPost.post_id);
      // Optimistically update the like count
      setFullPost(prev => prev ? {
        ...prev,
        like_count: (prev.like_count || 0) + 1
      } : null);
    } catch (error: any) {
      toast({
        title: "Failed to like post",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLiking(false);
    }
  };

  const handlePinToggle = async () => {
    if (pinning) return;
    
    setPinning(true);
    try {
      await onTogglePin?.(currentPost.post_id, !currentPost.is_pinned);
    } finally {
      setPinning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEdit = async () => {
    // Always try to edit - load full post data if we don't have it
    if (!fullPost && !loadingFullContent) {
      setLoadingFullContent(true);
      try {
        const fullPostData = await fetchPostById(post.post_id);
        setFullPost(fullPostData);
        setEditModalOpen(true);
      } catch (error: any) {
        toast({
          title: "Failed to load post data",
          description: error.response?.data?.message || "An error occurred while loading the post data.",
          variant: "destructive",
        });
      } finally {
        setLoadingFullContent(false);
      }
    } else if (fullPost) {
      // We already have the full post data, open editor immediately
      setEditModalOpen(true);
    }
    // If we're currently loading, do nothing to prevent double-loading
  };

  const handlePostUpdated = (updatedPost: Post) => {
    // Update both the full post data and notify parent
    setFullPost(updatedPost);
    onPostUpdated?.(updatedPost);
  };

  const renderVideoLink = () => {
    if (!fullPost?.video_link_url) return null;

    const platform = fullPost.video_link_platform;
    const embedUrl = fullPost.video_link_url; // This is the embed URL from backend
    const originalUrl = fullPost.video_link_original; // This is the original URL user posted
    
    // Handle X/Twitter embeds with dedicated component
    if (platform === 'x') {
      return (
        <XEmbed 
          embedUrl={embedUrl}
          originalUrl={originalUrl || embedUrl}
          className="mt-4"
        />
      );
    }
    
    // Handle other video platforms with iframe
    const getEmbedProps = () => {
      const baseProps = {
        width: "100%",
        className: "rounded-lg",
        frameBorder: "0",
        allowFullScreen: true,
        loading: "lazy" as const
      };

      switch (platform) {
        case 'youtube':
          return {
            ...baseProps,
            height: "315",
            src: embedUrl,
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          };
        case 'vimeo':
          return {
            ...baseProps,
            height: "315", 
            src: embedUrl,
            allow: "autoplay; fullscreen; picture-in-picture"
          };
        case 'twitch':
          return {
            ...baseProps,
            height: "315",
            src: embedUrl,
            allow: "autoplay; fullscreen"
          };
        case 'tiktok':
          return {
            ...baseProps,
            height: "500", // TikTok videos are taller
            src: embedUrl,
            allow: "autoplay; fullscreen"
          };
        default:
          return {
            ...baseProps,
            height: "315",
            src: embedUrl
          };
      }
    };

    return (
      <div className="relative mt-4">
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <iframe {...getEmbedProps()} />
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          <span className="capitalize">{platform} {platform === 'youtube' || platform === 'vimeo' ? 'Video' : 'Content'}</span>
          {originalUrl && originalUrl !== embedUrl && (
            <a 
              href={originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              View Original
            </a>
          )}
        </div>
      </div>
    );
  };

  const renderMedia = () => {
    // Only render actual media if we have the full post with media_url
    if (!fullPost?.media_url) return null;

    switch (fullPost.media_type) {
      case 'image':
        return (
          <div className="relative rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
            )}
            <img
              src={fullPost.media_url}
              alt={fullPost.media_filename || "Post media"}
              className="w-full h-auto max-h-96 object-cover rounded-lg"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
        );
      case 'video':
        return (
          <video
            src={fullPost.media_url}
            controls
            className="w-full h-auto max-h-96 rounded-lg"
            preload="metadata"
          />
        );
      case 'audio':
        return (
          <audio
            src={fullPost.media_url}
            controls
            className="w-full"
            preload="metadata"
          />
        );
      default:
        return null;
    }
  };

  const renderMediaInfo = () => {
    if (!fullPost || !fullPost.media_url) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {fullPost.media_filename && (
          <div className="flex items-center gap-1">
            <FileType className="h-3 w-3" />
            <span className="truncate max-w-[150px]">{fullPost.media_filename}</span>
          </div>
        )}
        {fullPost.media_size_bytes && (
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(fullPost.media_size_bytes)}</span>
          </div>
        )}
        {fullPost.media_duration_seconds && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(fullPost.media_duration_seconds)}</span>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!currentPost.content) return null;

    // For full posts with content_html, use the sanitized HTML
    if (expanded && fullPost?.content_html) {
      return (
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: fullPost.content_html }}
        />
      );
    }

    // If we're expanded but still loading
    if (expanded && loadingFullContent) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading full content...
        </div>
      );
    }

    // For preview mode - use CSS to truncate by height
    if (post.content) {
      const isHtml = /<[^>]*>/g.test(post.content);
      
      if (isHtml) {
        // Render HTML content with height-based truncation
        return (
          <div 
            className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed overflow-hidden"
            style={{ 
              maxHeight: '4.5rem', // ~3 lines of text
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box'
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        );
      } else {
        // Plain text content with line clamping
        return (
          <p 
            className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 overflow-hidden"
            style={{ 
              maxHeight: '4.5rem',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box'
            }}
          >
            {post.content}
          </p>
        );
      }
    }

    return null;
  };

  const shouldShowExpandButton = () => {
    // Show expand button if content exists OR has media OR has video link
    return !!post.content || post.has_media || post.has_video_link;
  };

  const getMediaIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📎';
    }
  };

  const getVideoLinkIcon = (platform?: string | null) => {
    switch (platform) {
      case 'youtube': return '🎬';
      case 'vimeo': return '🎥';
      case 'twitch': return '🎮';
      case 'tiktok': return '🎵';
      case 'twitter':
      case 'x': return '🐦'; // Twitter bird emoji
      default: return '🔗';
    }
  };

  const getModerationStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-xs text-green-600">✅ Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs text-yellow-600">⏳ Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-xs text-red-600">❌ Rejected</Badge>;
      default:
        return null;
    }
  };

  const renderVideoLinkPreview = () => {
    if (!post.has_video_link) return null;

    return (
      <div className="mt-4">
        <div 
          className="relative h-20 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center cursor-pointer hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors border border-purple-200/50 dark:border-purple-700/50"
          onClick={toggleExpanded}
        >
          <div className="text-center">
            <div className="text-2xl mb-1 flex items-center justify-center gap-2">
              {getVideoLinkIcon(post.video_link_platform)}
              <Play className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs text-muted-foreground">
              {loadingFullContent ? 'Loading...' : `Click to watch ${post.video_link_platform || 'video'}`}
            </span>
          </div>
          {loadingFullContent && (
            <div className="absolute top-2 right-2">
              <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-900/90">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {/* Prominent Pin Button */}
              <Button
                variant={currentPost.is_pinned ? "default" : "outline"}
                size="sm"
                onClick={handlePinToggle}
                disabled={pinning}
                className={`h-6 px-2 text-xs transition-all duration-200 ${
                  currentPost.is_pinned 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20'
                }`}
              >
                {pinning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : currentPost.is_pinned ? (
                  <>
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </>
                ) : (
                  <>
                    <PinOff className="h-3 w-3 mr-1" />
                    Pin
                  </>
                )}
              </Button>

              <Badge 
                variant={currentPost.post_tier === 'free' ? 'default' : 'secondary'}
                className={`text-xs ${
                  currentPost.post_tier === 'free' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}
              >
                {currentPost.post_tier === 'free' ? '🆓 Free' : '💎 Subscriber'}
              </Badge>
              {/* Only show display order if it exists and is greater than 0 */}
              {currentPost.display_order != null && currentPost.display_order > 0 && (
                <Badge variant="outline" className="text-xs">
                  #{currentPost.display_order}
                </Badge>
              )}
              {post.has_media && (
                <Badge variant="outline" className="text-xs">
                  {getMediaIcon(post.media_type)} Media
                </Badge>
              )}
              {post.has_video_link && (
                <Badge variant="outline" className="text-xs">
                  {getVideoLinkIcon(post.video_link_platform)} Video Link
                </Badge>
              )}
              {fullPost?.updated_at && fullPost.updated_at !== fullPost.created_at && (
                <Badge variant="outline" className="text-xs text-blue-600">
                  Edited
                </Badge>
              )}
              {fullPost?.moderation_status && getModerationStatusBadge(fullPost.moderation_status)}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Always show view count (even if 0) */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{currentPost.view_count || 0}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handlePinToggle}
                    disabled={pinning}
                  >
                    {currentPost.is_pinned ? (
                      <>
                        <PinOff className="h-4 w-4 mr-2" />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4 mr-2" />
                        Pin
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(currentPost.post_id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(currentPost.created_at)}</span>
            {fullPost?.updated_at && fullPost.updated_at !== fullPost.created_at && (
              <span>• Updated {formatDate(fullPost.updated_at)}</span>
            )}
            {fullPost?.published_at && fullPost.published_at !== fullPost.created_at && (
              <span>• Published {formatDate(fullPost.published_at)}</span>
            )}
          </div>
          
          {/* Creator info for full posts */}
          {fullPost?.display_name && (
            <div className="text-xs text-muted-foreground">
              By {fullPost.display_name} {fullPost.display_link && `(@${fullPost.display_link})`}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {currentPost.content && (
            <div className="mb-4">
              {renderContent()}
            </div>
          )}

          {/* Show expand button if there's content, media, or video link */}
          {shouldShowExpandButton() && controlledExpanded === undefined && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="mb-4 h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
              disabled={loadingFullContent}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}

          {/* Show actual media when expanded and loaded */}
          {fullPost?.media_url && expanded && !loadingFullContent && (
            <div className="mt-4">
              {renderMedia()}
              {renderMediaInfo()}
            </div>
          )}

          {/* Show actual video link when expanded and loaded */}
          {fullPost?.video_link_url && expanded && !loadingFullContent && (
            <div className="mt-4">
              {renderVideoLink()}
            </div>
          )}

          {/* Show media preview when folded or when expanded but still loading */}
          {post.has_media && (!expanded || (expanded && loadingFullContent)) && (
            <div className="mt-4">
              <div 
                className="relative h-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center cursor-pointer hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors border border-blue-200/50 dark:border-blue-700/50"
                onClick={toggleExpanded}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {getMediaIcon(post.media_type)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {loadingFullContent ? 'Loading...' : `Click to view ${post.media_type || 'media'}`}
                  </span>
                </div>
                {loadingFullContent && (
                  <div className="absolute top-2 right-2">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show video link preview when folded or when expanded but still loading */}
          {post.has_video_link && (!expanded || (expanded && loadingFullContent)) && (
            renderVideoLinkPreview()
          )}
        </CardContent>

        {/* Engagement Footer - only show if there are meaningful engagement metrics */}
        {(() => {
          if (!fullPost) return null;
          
          const hasLikes = (fullPost.like_count || 0) > 0;
          const hasComments = (fullPost.comment_count || 0) > 0;
          const hasShares = (fullPost.share_count || 0) > 0;
          const hasSubscriberViews = (fullPost.subscriber_view_count || 0) > 0 && 
                                   fullPost.subscriber_view_count !== fullPost.view_count;
          
          // Don't show engagement footer if there are no meaningful metrics
          if (!hasLikes && !hasComments && !hasShares && !hasSubscriberViews) {
            return null;
          }
          
          return (
            <CardFooter className="pt-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  {hasLikes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={liking}
                      className="flex items-center gap-1 h-8 px-2 text-xs hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {liking ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Heart className="h-3 w-3" />
                      )}
                      <span>{fullPost.like_count}</span>
                    </Button>
                  )}

                  {/* Comments */}
                  {hasComments && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      <span>{fullPost.comment_count}</span>
                    </div>
                  )}

                  {/* Shares */}
                  {hasShares && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Share2 className="h-3 w-3" />
                      <span>{fullPost.share_count}</span>
                    </div>
                  )}
                </div>

                {/* Subscriber views */}
                {hasSubscriberViews && (
                  <div className="text-xs text-muted-foreground">
                    💎 {fullPost.subscriber_view_count} subscriber views
                  </div>
                )}
              </div>
            </CardFooter>
          );
        })()}
      </Card>

      {/* Edit Modal - only show if we have full post data */}
      {fullPost && (
        <EditPostModal
          post={fullPost}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </>
  );
};