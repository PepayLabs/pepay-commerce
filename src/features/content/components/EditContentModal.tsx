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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { updateContent, Content, validatePrice, formatPrice, formatFileSize } from '../api/content.api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, DollarSign, FileType, Clock, TrendingUp, AlertCircle, Sparkles, BarChart3 } from 'lucide-react';

interface EditContentModalProps {
  content: Content;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentUpdated: (updatedContent: Content) => void;
}

export const EditContentModal: React.FC<EditContentModalProps> = ({
  content,
  open,
  onOpenChange,
  onContentUpdated
}) => {
  const [title, setTitle] = useState(content.title || '');
  const [description, setDescription] = useState(content.description || '');
  const [shortMetadata, setShortMetadata] = useState(content.short_metadata || '');
  const [price, setPrice] = useState(content.price.toString());
  const [previewSeconds, setPreviewSeconds] = useState(content.preview_seconds?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const maxTitleLength = 100;
  const maxDescriptionLength = 1000;
  const maxShortMetadataLength = 200;

  useEffect(() => {
    if (open && content) {
      setTitle(content.title || '');
      setDescription(content.description || '');
      setShortMetadata(content.short_metadata || '');
      setPrice(content.price.toString());
      setPreviewSeconds(content.preview_seconds?.toString() || '');
    }
  }, [open, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your content.",
        variant: "destructive",
      });
      return;
    }

    const priceNumber = parseFloat(price);
    const priceValidation = validatePrice(priceNumber);
    if (!priceValidation.isValid) {
      toast({
        title: "Invalid price",
        description: priceValidation.error,
        variant: "destructive",
      });
      return;
    }

    // Validate preview seconds for videos
    if (content.content_type === 'video' && previewSeconds) {
      const previewNum = parseInt(previewSeconds);
      if (previewNum < 1 || previewNum > 60) {
        toast({
          title: "Invalid preview duration",
          description: "Preview must be between 1 and 60 seconds.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {};
      
      // Only include fields that have changed
      if (title.trim() !== content.title) {
        updateData.title = title.trim();
      }
      
      if (description.trim() !== (content.description || '')) {
        updateData.description = description.trim();
      }
      
      if (shortMetadata.trim() !== (content.short_metadata || '')) {
        updateData.short_metadata = shortMetadata.trim();
      }
      
      if (priceNumber !== content.price) {
        updateData.price = priceNumber;
      }
      
      if (content.content_type === 'video' && previewSeconds !== (content.preview_seconds?.toString() || '')) {
        updateData.preview_seconds = previewSeconds ? parseInt(previewSeconds) : null;
      }

      // Check if we have any changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes detected",
          description: "Make some changes before saving.",
          variant: "default",
        });
        return;
      }

      const response = await updateContent(content.content_id, updateData);

      toast({
        title: "Content updated successfully! ✨",
        description: "Your changes have been saved.",
      });

      onContentUpdated(response.content);
      onOpenChange(false);

    } catch (error: any) {
      let errorMessage = "An error occurred while updating your content.";
      
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        errorMessage = error.response.data.details.join(", ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Failed to update content",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle(content.title || '');
    setDescription(content.description || '');
    setShortMetadata(content.short_metadata || '');
    setPrice(content.price.toString());
    setPreviewSeconds(content.preview_seconds?.toString() || '');
    onOpenChange(false);
  };

  // Check if form has changes
  const hasChanges = 
    title.trim() !== content.title ||
    description.trim() !== (content.description || '') ||
    shortMetadata.trim() !== (content.short_metadata || '') ||
    parseFloat(price) !== content.price ||
    (content.content_type === 'video' && previewSeconds !== (content.preview_seconds?.toString() || ''));

  const isFormValid = title.trim() && !isNaN(parseFloat(price)) && parseFloat(price) >= 0.50;
  const priceNumber = parseFloat(price) || 0;
  const suggestedPrices = [0.99, 2.99, 4.99, 9.99, 19.99, 49.99];

  // Calculate current revenue and conversion rate
  const currentRevenue = content.price * content.purchase_count;
  const conversionRate = content.view_count > 0 ? (content.purchase_count / content.view_count) * 100 : 0;

  const getContentTypeIcon = () => {
    switch (content.content_type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📎';
    }
  };

  const getContentTypeColor = () => {
    switch (content.content_type) {
      case 'image': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'video': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'audio': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-4xl h-[85vh] max-h-[900px] flex flex-col p-0">
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Edit Content
            </DialogTitle>
            <DialogDescription className="text-sm">
              Update your content details and optimize for better performance
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3" style={{ minHeight: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Info Header */}
            <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-lg ${getContentTypeColor()}`}>
                  <span className="text-2xl">{getContentTypeIcon()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {content.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileType className="h-3 w-3" />
                      <span>{formatFileSize(content.file_size_bytes)}</span>
                    </div>
                    <span>•</span>
                    <span className="capitalize">{content.content_type}</span>
                    {content.preview_seconds && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{content.preview_seconds}s preview</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(currentRevenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">total revenue</div>
                </div>
              </div>
            </Card>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{content.view_count}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-green-600">{content.purchase_count}</div>
                <div className="text-xs text-muted-foreground">Sales</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-purple-600">{formatPrice(content.price)}</div>
                <div className="text-xs text-muted-foreground">Current Price</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-orange-600">{conversionRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Conversion</div>
              </Card>
            </div>

            {/* Edit Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-semibold">
                    Title * <span className="text-xs text-muted-foreground">({title.length}/{maxTitleLength})</span>
                  </Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
                    placeholder="Content title"
                    className="bg-white/90 dark:bg-gray-900/90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-short-metadata" className="text-sm font-semibold">
                    Short Description <span className="text-xs text-muted-foreground">({shortMetadata.length}/{maxShortMetadataLength})</span>
                  </Label>
                  <Input
                    id="edit-short-metadata"
                    value={shortMetadata}
                    onChange={(e) => setShortMetadata(e.target.value.slice(0, maxShortMetadataLength))}
                    placeholder="Brief description for previews"
                    className="bg-white/90 dark:bg-gray-900/90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-sm font-semibold">
                    Detailed Description <span className="text-xs text-muted-foreground">({description.length}/{maxDescriptionLength})</span>
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, maxDescriptionLength))}
                    placeholder="Comprehensive description of your content..."
                    rows={6}
                    className="resize-none bg-white/90 dark:bg-gray-900/90"
                  />
                </div>
              </div>

              {/* Right Column - Pricing & Settings */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0.50"
                      max="10000"
                      step="0.01"
                      placeholder="2.99"
                      className="pl-10 bg-white/90 dark:bg-gray-900/90"
                    />
                  </div>
                  
                  {/* Suggested Prices */}
                  <div className="flex flex-wrap gap-1">
                    {suggestedPrices.map((suggestedPrice) => (
                      <Button
                        key={suggestedPrice}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrice(suggestedPrice.toString())}
                        className="text-xs h-6"
                      >
                        ${suggestedPrice}
                      </Button>
                    ))}
                  </div>

                  {priceNumber > 0 && priceNumber !== content.price && (
                    <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4" />
                          <span className="font-medium">Price Change Impact</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Old Revenue:</span>
                            <div className="font-semibold">{formatPrice(content.price * content.purchase_count)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Projected:</span>
                            <div className="font-semibold">{formatPrice(priceNumber * content.purchase_count)}</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Video Preview Settings */}
                {content.content_type === 'video' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-preview-seconds" className="text-sm font-semibold">
                      Preview Duration (seconds)
                    </Label>
                    <Input
                      id="edit-preview-seconds"
                      type="number"
                      value={previewSeconds}
                      onChange={(e) => setPreviewSeconds(e.target.value)}
                      min="1"
                      max="60"
                      placeholder="30"
                      className="bg-white/90 dark:bg-gray-900/90"
                    />
                    <p className="text-xs text-muted-foreground">
                      Preview clips help drive sales (1-60 seconds). Leave empty to remove preview.
                    </p>
                  </div>
                )}

                {/* Content Status Info */}
                <Card className="p-3 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-medium text-sm mb-2">Content Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access Level:</span>
                      <Badge variant={content.is_public ? 'default' : 'secondary'} className="text-xs">
                        {content.is_public ? '🌍 Public' : '🔒 Private'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publication:</span>
                      <Badge variant={content.is_published ? 'default' : 'outline'} className="text-xs">
                        {content.is_published ? '✅ Published' : '📝 Draft'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moderation:</span>
                      <Badge variant="outline" className="text-xs">
                        {content.moderation_status === 'approved' ? '✅ Approved' : 
                         content.moderation_status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Optimization Tips */}
                <Card className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100 mb-1">
                        Optimization Tips
                      </h4>
                      <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Clear, descriptive titles improve discoverability</li>
                        <li>• Detailed descriptions help buyers understand value</li>
                        {content.content_type === 'video' && (
                          <li>• 30-45 second previews tend to perform best</li>
                        )}
                        <li>• Consider your audience when setting prices</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {hasChanges ? (
                <span className="text-orange-600 font-medium">• Unsaved changes</span>
              ) : (
                <span>No changes made</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!hasChanges || !isFormValid || isSubmitting}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
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
        </div>
      </DialogContent>
    </Dialog>
  );
};