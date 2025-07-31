import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentPreview, Content, fetchContentById, formatPrice, formatFileSize } from '../api/content.api';
import { EditContentModal } from './EditContentModal';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  DollarSign,
  Download,
  Play,
  Image as ImageIcon,
  Volume2,
  FileType,
  Clock,
  HardDrive,
  ShoppingCart,
  Users,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ImageFallback } from './ImageFallback';

interface ContentCardProps {
  content: ContentPreview;
  onTogglePublication?: (contentId: string, isPublished: boolean) => void;
  onDelete?: (contentId: string) => void;
  onContentUpdated?: (updatedContent: Content) => void;
  isExpanded?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onTogglePublication,
  onDelete,
  onContentUpdated,
  isExpanded: controlledExpanded
}: ContentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(controlledExpanded ?? false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fullContent, setFullContent] = useState<Content | null>(null);
  const [loadingFullContent, setLoadingFullContent] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [fileImageError, setFileImageError] = useState(false);
  const { toast } = useToast();

  const expanded = controlledExpanded !== undefined ? controlledExpanded : isExpanded;
  const currentContent = fullContent || content;

  // Reset image error states when edit modal closes
  useEffect(() => {
    if (!editModalOpen) {
      setCoverImageError(false);
      setFileImageError(false);
    }
  }, [editModalOpen]);

  const toggleExpanded = async () => {
    if (controlledExpanded !== undefined) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    // Lazy load full content when expanding
    if (newExpanded && !fullContent && !loadingFullContent) {
      await loadFullContent();
    }
  };

  const loadFullContent = async () => {
    setLoadingFullContent(true);
    try {
      const fullContentData = await fetchContentById(content.content_id);
      setFullContent(fullContentData);
    } catch (error: any) {
      toast({
        title: "Failed to load full content",
        description: error.response?.data?.message || "An error occurred while loading the content details.",
        variant: "destructive",
      });
    } finally {
      setLoadingFullContent(false);
    }
  };

  const handlePublishToggle = async () => {
    if (publishing) return;
    
    setPublishing(true);
    try {
      await onTogglePublication?.(currentContent.content_id, !currentContent.is_published);
    } finally {
      setPublishing(false);
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
    if (!fullContent && !loadingFullContent) {
      setLoadingFullContent(true);
      try {
        const fullContentData = await fetchContentById(content.content_id);
        setFullContent(fullContentData);
        setEditModalOpen(true);
      } catch (error: any) {
        toast({
          title: "Failed to load content data",
          description: error.response?.data?.message || "An error occurred while loading the content data.",
          variant: "destructive",
        });
      } finally {
        setLoadingFullContent(false);
      }
    } else if (fullContent) {
      setEditModalOpen(true);
    }
  };

  const handleContentUpdated = (updatedContent: Content) => {
    setFullContent(updatedContent);
    onContentUpdated?.(updatedContent);
  };

  const renderMedia = () => {
    // Show cover image if available, otherwise show content file
    if (currentContent.cover_image_url && !fullContent?.file_url) {
      if (coverImageError) {
        return (
          <ImageFallback 
            contentType={currentContent.content_type}
            title={currentContent.title}
            className="w-full h-32"
            isLarge={true}
          />
        );
      }

      return (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          )}
          <img
            src={currentContent.cover_image_url}
            alt={`${currentContent.title} cover`}
            className="w-full h-auto max-h-64 object-cover rounded-lg"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setCoverImageError(true);
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0">
              Cover Image
            </Badge>
          </div>
        </div>
      );
    }

    if (!fullContent?.file_url) return null;

    switch (fullContent.content_type) {
      case 'image':
        if (fileImageError) {
          return (
            <ImageFallback 
              contentType={fullContent.content_type}
              title={fullContent.title}
              className="w-full h-48"
              isLarge={true}
            />
          );
        }

        return (
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
            )}
            <img
              src={fullContent.file_url}
              alt={fullContent.title}
              className="w-full h-auto max-h-96 object-cover rounded-lg"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setFileImageError(true);
              }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative">
            {/* Show cover image for videos if available */}
            {currentContent.cover_image_url && (
              <div className="mb-3">
                {coverImageError ? (
                  <ImageFallback 
                    contentType="image"
                    title={`${currentContent.title} cover`}
                    className="w-full h-32"
                  />
                ) : (
                  <img
                    src={currentContent.cover_image_url}
                    alt={`${currentContent.title} cover`}
                    className="w-full h-auto max-h-48 object-cover rounded-lg"
                    onError={() => setCoverImageError(true)}
                  />
                )}
                <Badge variant="secondary" className="text-xs mt-2">
                  Cover Image
                </Badge>
              </div>
            )}
            <video
              src={fullContent.file_url}
              controls
              className="w-full h-auto max-h-96 rounded-lg bg-black"
              preload="metadata"
              poster={currentContent.cover_image_url && !coverImageError ? currentContent.cover_image_url : `${fullContent.file_url}#t=0.1`}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-3">
            {/* Show cover image for audio if available */}
            {currentContent.cover_image_url && (
              coverImageError ? (
                <ImageFallback 
                  contentType="image"
                  title={`${currentContent.title} cover`}
                  className="w-full h-32"
                />
              ) : (
                <img
                  src={currentContent.cover_image_url}
                  alt={`${currentContent.title} cover`}
                  className="w-full h-auto max-h-48 object-cover rounded-lg"
                  onError={() => setCoverImageError(true)}
                />
              )
            )}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <Volume2 className="h-12 w-12 text-purple-500" />
              </div>
              <audio
                src={fullContent.file_url}
                controls
                className="w-full"
                preload="metadata"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMediaInfo = () => {
    if (!fullContent) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {fullContent.file_filename && (
          <div className="flex items-center gap-1">
            <FileType className="h-3 w-3" />
            <span className="truncate max-w-[150px]">{fullContent.file_filename}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <HardDrive className="h-3 w-3" />
          <span>{formatFileSize(fullContent.file_size_bytes)}</span>
        </div>
        {fullContent.preview_seconds && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Preview: {fullContent.preview_seconds}s</span>
          </div>
        )}
      </div>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      default: return <FileType className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'video': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'audio': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getModerationStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:border-green-800">✅ Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200 dark:border-yellow-800">⏳ Under Review</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-xs text-red-600 border-red-200 dark:border-red-800">❌ Rejected</Badge>;
      default:
        return null;
    }
  };

  const renderContentPreview = () => {
    if (!currentContent.description && !currentContent.short_metadata) return null;

    const previewText = currentContent.description || currentContent.short_metadata || '';
    
    return (
      <div className="mt-3">
        <p 
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed overflow-hidden"
          style={{ 
            maxHeight: expanded ? 'none' : '3rem',
            WebkitLineClamp: expanded ? 'none' : 2,
            WebkitBoxOrient: 'vertical',
            display: expanded ? 'block' : '-webkit-box'
          }}
        >
          {previewText}
        </p>
      </div>
    );
  };

  const shouldShowExpandButton = () => {
    return !!(currentContent.description || currentContent.short_metadata || 
            (fullContent && fullContent.file_url));
  };

  // Calculate revenue for this content
  const revenue = currentContent.price * currentContent.purchase_count;

  return (
    <>
      <Card className="w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-900/90">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {currentContent.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Content Type Badge */}
                <Badge className={`text-xs ${getContentTypeColor(currentContent.content_type)}`}>
                  {getContentTypeIcon(currentContent.content_type)}
                  <span className="ml-1 capitalize">{currentContent.content_type}</span>
                </Badge>

                {/* Price Badge */}
                <Badge variant="outline" className="text-xs font-semibold text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatPrice(currentContent.price)}
                </Badge>

                {/* Public/Private Badge */}
                <Badge variant={currentContent.is_public ? 'default' : 'secondary'} className="text-xs">
                  {currentContent.is_public ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>

                {/* Publication Status */}
                <Badge variant={currentContent.is_published ? 'default' : 'outline'} className={`text-xs ${
                  currentContent.is_published 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'text-orange-600 border-orange-200 dark:border-orange-800'
                }`}>
                  {currentContent.is_published ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Live
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Draft
                    </>
                  )}
                </Badge>

                {/* Moderation Status */}
                {currentContent.moderation_status && getModerationStatusBadge(currentContent.moderation_status)}

                {/* Featured Badge - NEW */}
                {currentContent.is_featured && (
                  <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Revenue Display */}
              {revenue > 0 && (
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {formatPrice(revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">revenue</div>
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Content
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handlePublishToggle}
                    disabled={publishing}
                  >
                    {currentContent.is_published ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(currentContent.content_id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created {formatDate(currentContent.created_at)}</span>
            </div>
            {currentContent.updated_at && currentContent.updated_at !== currentContent.created_at && (
              <span>• Updated {formatDate(currentContent.updated_at)}</span>
            )}
            {currentContent.published_at && (
              <span>• Published {formatDate(currentContent.published_at)}</span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Cover Image Preview */}
          {currentContent.cover_image_url && !expanded && (
            <div className="mt-3">
              {coverImageError ? (
                <ImageFallback 
                  contentType={currentContent.content_type}
                  title={currentContent.title}
                  className="w-full h-32"
                />
              ) : (
                <img
                  src={currentContent.cover_image_url}
                  alt={`${currentContent.title} cover`}
                  className="w-full h-32 object-cover rounded-lg"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setCoverImageError(true);
                  }}
                />
              )}
            </div>
          )}

          {/* Content Preview */}
          {renderContentPreview()}

          {/* Show expand button if there's more content */}
          {shouldShowExpandButton() && controlledExpanded === undefined && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="mt-3 h-auto p-0 text-xs text-purple-600 hover:text-purple-800"
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
                  {loadingFullContent ? 'Loading...' : 'Show details'}
                </>
              )}
            </Button>
          )}

          {/* Loading State */}
          {loadingFullContent && (
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading full details...
            </div>
          )}

          {/* Full Content Display */}
          {fullContent?.file_url && expanded && !loadingFullContent && (
            <div className="mt-4">
              {renderMedia()}
              {renderMediaInfo()}
            </div>
          )}
        </CardContent>

        {/* Stats Footer */}
        <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{currentContent.view_count.toLocaleString()} views</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShoppingCart className="h-3 w-3" />
                <span>{currentContent.purchase_count.toLocaleString()} sales</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                <span>{formatFileSize(currentContent.file_size_bytes)}</span>
              </div>
            </div>

            {/* Performance Indicator */}
            {currentContent.purchase_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Zap className="h-3 w-3" />
                <span className="font-medium">
                  {((currentContent.purchase_count / Math.max(currentContent.view_count, 1)) * 100).toFixed(1)}% conversion
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      {fullContent && (
        <EditContentModal
          content={fullContent}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onContentUpdated={handleContentUpdated}
        />
      )}
    </>
  );
};