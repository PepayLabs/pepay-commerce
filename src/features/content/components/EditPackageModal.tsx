import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { updatePackage, Package, validatePackagePrice, formatPrice, calculatePackageValue } from '../api/packages.api';
import { fetchContent, ContentPreview } from '../api/content.api';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  X,
  Package as PackageIcon,
  Loader2,
  DollarSign,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Plus,
  Minus,
  Percent,
  BarChart3
} from 'lucide-react';
import { ImageFallback } from './ImageFallback';

interface EditPackageModalProps {
  package: Package;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPackageUpdated: (updatedPackage: Package) => void;
}

export const EditPackageModal: React.FC<EditPackageModalProps> = ({
  package: packageData,
  open,
  onOpenChange,
  onPackageUpdated
}) => {
  const [title, setTitle] = useState(packageData.title || '');
  const [description, setDescription] = useState(packageData.description || '');
  const [shortMetadata, setShortMetadata] = useState(packageData.short_metadata || '');
  const [packagePrice, setPackagePrice] = useState(packageData.package_price.toString());
  const [isPublic, setIsPublic] = useState(packageData.is_public);
  const [isFeatured, setIsFeatured] = useState(packageData.is_featured);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>(
    packageData.content_items?.map(item => item.content_id) || []
  );
  const [availableContent, setAvailableContent] = useState<ContentPreview[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Add image error states
  const [packageCoverError, setPackageCoverError] = useState(false);
  const [contentImageErrors, setContentImageErrors] = useState<Record<string, boolean>>({});

  const maxTitleLength = 100;
  const maxDescriptionLength = 1000;
  const maxShortMetadataLength = 200;

  // Helper function to ensure numeric values - moved to top level
  const ensureNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Reset image error states when modal closes
  useEffect(() => {
    if (!open) {
      setPackageCoverError(false);
      setContentImageErrors({});
    }
  }, [open]);

  // Reset form when modal opens - SIMPLIFIED without loadAvailableContent
  useEffect(() => {
    if (open) {
      // Reset form states
      setTitle(packageData.title || '');
      setDescription(packageData.description || '');
      setShortMetadata(packageData.short_metadata || '');
      setPackagePrice(packageData.package_price.toString());
      setIsPublic(packageData.is_public);
      setIsFeatured(packageData.is_featured);
      setSelectedContentIds(packageData.content_items?.map(item => item.content_id) || []);
      
      // Reset image error states
      setPackageCoverError(false);
      setContentImageErrors({});
    }
  }, [open, packageData.package_id]); // Removed loadAvailableContent

  // Load content separately - no dependencies that cause infinite loops
  useEffect(() => {
    if (open && availableContent.length === 0 && !loadingContent) {
      loadAvailableContent();
    }
  }, [open]); // Only depend on open state

  // Simplified loadAvailableContent function - not in useCallback
  const loadAvailableContent = async () => {
    if (loadingContent) return; // Prevent multiple simultaneous calls
    
    setLoadingContent(true);
    try {
      let allContent: ContentPreview[] = [];
      let offset = 0;
      const limit = 20;
      let hasMore = true;

      while (hasMore) {
        const response = await fetchContent(limit, offset, undefined, undefined, false);
        const publishedContent = response.content.filter(item => 
          item.is_published && 
          item.is_active && 
          item.moderation_status === 'approved'
        );
        
        allContent = [...allContent, ...publishedContent];
        
        hasMore = response.pagination.has_more;
        offset += limit;
        
        if (allContent.length >= 100) {
          hasMore = false;
        }
      }
      
      setAvailableContent(allContent);
    } catch (error: any) {
      toast({
        title: "Failed to load content",
        description: "Could not load your available content.",
        variant: "destructive",
      });
    } finally {
      setLoadingContent(false);
    }
  };

  // Simplified content toggle handler - not in useCallback
  const handleContentToggle = (contentId: string) => {
    setSelectedContentIds(prev => 
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  // Create a comprehensive content list that includes existing package items
  const allContentMap = useMemo(() => {
    const contentMap = new Map();
    
    // Add all available content
    availableContent.forEach(item => {
      contentMap.set(item.content_id, item);
    });
    
    // Add existing package content items (ensure we have their data) with null check
    if (packageData.content_items) {
      packageData.content_items.forEach(item => {
        if (!contentMap.has(item.content_id)) {
          // Create a ContentPreview-like object from package item data
          const contentPreview: ContentPreview = {
            content_id: item.content_id,
            title: item.title,
            price: item.price,
            content_type: item.content_type || 'unknown' as any,
            is_published: true,
            is_active: true,
            moderation_status: 'approved' as const,
            // Add default values for other required fields
            description: '',
            short_metadata: '',
            is_public: false,
            is_featured: false,
            file_size_bytes: 0,
            file_mime_type: '',
            view_count: 0,
            purchase_count: 0,
            created_at: '',
            updated_at: '',
            cover_image_url: undefined
          };
          contentMap.set(item.content_id, contentPreview);
        }
      });
    }
    
    return contentMap;
  }, [availableContent, packageData.content_items]);

  // Get selected content with prices
  const selectedContent = selectedContentIds.map(id => allContentMap.get(id)).filter(Boolean);
  const individualTotal = selectedContent.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price;
  }, 0);
  const priceNumber = parseFloat(packagePrice) || 0;
  const packageValue = calculatePackageValue(priceNumber, individualTotal);

  // Get available content for selection
  const availableContentForSelection = Array.from(allContentMap.values());

  // Determine changes with null check
  const originalContentIds = packageData.content_items?.map(item => item.content_id) || [];
  const addContentIds = selectedContentIds.filter(id => !originalContentIds.includes(id));
  const removeContentIds = originalContentIds.filter(id => !selectedContentIds.includes(id));

  const hasChanges = 
    title.trim() !== packageData.title ||
    description.trim() !== (packageData.description || '') ||
    shortMetadata.trim() !== (packageData.short_metadata || '') ||
    parseFloat(packagePrice) !== packageData.package_price ||
    isPublic !== packageData.is_public ||
    isFeatured !== packageData.is_featured ||
    addContentIds.length > 0 ||
    removeContentIds.length > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your package.",
        variant: "destructive",
      });
      return;
    }

    if (selectedContentIds.length < 2) {
      toast({
        title: "Insufficient content",
        description: "Packages must contain at least 2 content items.",
        variant: "destructive",
      });
      return;
    }

    const priceValidation = validatePackagePrice(priceNumber);
    if (!priceValidation.isValid) {
      toast({
        title: "Invalid price",
        description: priceValidation.error,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: any = {};
      
      // Only include fields that have changed
      if (title.trim() !== packageData.title) {
        updateData.title = title.trim();
      }
      
      if (description.trim() !== (packageData.description || '')) {
        updateData.description = description.trim();
      }
      
      if (shortMetadata.trim() !== (packageData.short_metadata || '')) {
        updateData.short_metadata = shortMetadata.trim();
      }
      
      if (priceNumber !== packageData.package_price) {
        updateData.package_price = priceNumber;
      }
      
      if (isPublic !== packageData.is_public) {
        updateData.is_public = isPublic;
      }
      
      if (isFeatured !== packageData.is_featured) {
        updateData.is_featured = isFeatured;
      }

      // Content changes
      if (addContentIds.length > 0) {
        updateData.add_content_ids = addContentIds;
      }
      
      if (removeContentIds.length > 0) {
        updateData.remove_content_ids = removeContentIds;
      }

      const response = await updatePackage(packageData.package_id, updateData);

      // Calculate the updated content items based on our changes
      let updatedContentItems = packageData.content_items || [];
      
      // Remove content items that were removed
      if (removeContentIds.length > 0) {
        updatedContentItems = updatedContentItems.filter(item => 
          !removeContentIds.includes(item.content_id)
        );
      }
      
      // Add new content items that were added
      if (addContentIds.length > 0) {
        const newContentItems = addContentIds.map(contentId => {
          const contentItem = allContentMap.get(contentId);
          if (contentItem) {
            return {
              content_id: contentItem.content_id,
              title: contentItem.title,
              price: contentItem.price,
              content_type: contentItem.content_type,
              display_order: updatedContentItems.length + 1,
              is_preview: false
            };
          }
          return null;
        }).filter((item): item is NonNullable<typeof item> => item !== null); // Type-safe filter
        
        updatedContentItems = [...updatedContentItems, ...newContentItems];
      }

      // Calculate updated package stats based on the new content items
      const updatedContentCount = updatedContentItems.length;
      const updatedIndividualTotal = updatedContentItems.reduce((sum, item) => sum + Number(item.price), 0);
      const updatedSavingsAmount = Math.max(0, updatedIndividualTotal - ensureNumber(response.package.package_price));

      // Create a properly merged package with all required fields
      const updatedPackage: Package = {
        // Start with all existing package data
        ...packageData,
        // Override with API response data
        ...response.package,
        // Ensure critical numeric fields are properly converted
        package_price: ensureNumber(response.package.package_price),
        individual_total_price: ensureNumber(response.package.individual_total_price || updatedIndividualTotal),
        discount_percentage: ensureNumber(response.package.discount_percentage),
        savings_amount: updatedSavingsAmount, // Calculate based on updated content
        view_count: ensureNumber(packageData.view_count), // Preserve existing
        purchase_count: ensureNumber(packageData.purchase_count), // Preserve existing
        content_count: updatedContentCount, // Update based on content changes
        total_size_bytes: ensureNumber(packageData.total_size_bytes), // Preserve existing
        total_duration_seconds: packageData.total_duration_seconds, // Preserve existing
        // Use the updated content items we calculated
        content_items: updatedContentItems,
        // Preserve media fields
        cover_media_url: packageData.cover_media_url,
        cover_media_type: packageData.cover_media_type,
        // Preserve other fields
        moderation_status: packageData.moderation_status,
        is_active: packageData.is_active,
        created_at: packageData.created_at,
        published_at: packageData.published_at || null,
        // Ensure boolean fields are properly handled
        is_public: response.package.is_public ?? packageData.is_public,
        is_featured: response.package.is_featured ?? packageData.is_featured,
        is_published: response.package.is_published ?? packageData.is_published
      };

      toast({
        title: "Package updated successfully! ✨",
        description: `Your "${updatedPackage.title}" package has been updated with the latest changes.`,
      });

      onPackageUpdated(updatedPackage);
      onOpenChange(false);

    } catch (error: any) {
      let errorMessage = "An error occurred while updating your package.";
      
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        errorMessage = error.response.data.details.join(", ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Failed to update package",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle(packageData.title || '');
    setDescription(packageData.description || '');
    setShortMetadata(packageData.short_metadata || '');
    setPackagePrice(packageData.package_price.toString());
    setIsPublic(packageData.is_public);
    setIsFeatured(packageData.is_featured);
    setSelectedContentIds(packageData.content_items?.map(item => item.content_id) || []);
    onOpenChange(false);
  };

  const isFormValid = title.trim() && selectedContentIds.length >= 2 && !isNaN(priceNumber) && priceNumber >= 1.00;
  const suggestedPrices = [9.99, 19.99, 29.99, 49.99, 99.99, 199.99];

  // Calculate current revenue and performance with better type safety
  const currentRevenue = ensureNumber(packageData.package_price) * ensureNumber(packageData.purchase_count);
  const projectedRevenue = priceNumber * ensureNumber(packageData.purchase_count);
  const conversionRate = ensureNumber(packageData.view_count) > 0 
    ? (ensureNumber(packageData.purchase_count) / ensureNumber(packageData.view_count)) * 100 
    : 0;

  // Helper function to handle content image errors
  const handleContentImageError = (contentId: string) => {
    setContentImageErrors(prev => ({
      ...prev,
      [contentId]: true
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[1000px] flex flex-col p-0">
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Edit Package
            </DialogTitle>
            <DialogDescription className="text-sm">
              Update your package details and optimize for better performance
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3" style={{ minHeight: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Package Performance Stats with Cover Image */}
            <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                {/* Package Cover Image */}
                {packageData.preview_file_url ? (
                  <div className="flex-shrink-0">
                    {packageCoverError ? (
                      <ImageFallback 
                        contentType="package"
                        title={packageData.title}
                        className="w-16 h-16"
                        isLarge={false}
                      />
                    ) : (
                      <img
                        src={packageData.preview_file_url}
                        alt={`${packageData.title} cover`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        onError={() => setPackageCoverError(true)}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <ImageFallback 
                      contentType="package"
                      title={packageData.title}
                      className="w-16 h-16"
                      isLarge={false}
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {packageData.title}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{formatPrice(currentRevenue)}</div>
                      <div className="text-xs text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{packageData.purchase_count}</div>
                      <div className="text-xs text-muted-foreground">Sales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{packageData.view_count}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{conversionRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Package Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-semibold">
                    Package Title * <span className="text-xs text-muted-foreground">({title.length}/{maxTitleLength})</span>
                  </Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
                    placeholder="e.g., Complete Web Development Mastery Bundle"
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
                    placeholder="e.g., 5 courses • 20 hours • Beginner to Advanced"
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
                    placeholder="Provide a comprehensive description of your package..."
                    rows={4}
                    className="resize-none bg-white/90 dark:bg-gray-900/90"
                  />
                </div>
              </div>

              {/* Right Column - Pricing & Settings */}
              <div className="space-y-4">
                {/* Pricing */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Package Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={packagePrice}
                      onChange={(e) => setPackagePrice(e.target.value)}
                      min="1.00"
                      max="50000"
                      step="0.01"
                      placeholder="9.99"
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
                        onClick={() => setPackagePrice(suggestedPrice.toString())}
                        className="text-xs h-6"
                      >
                        ${suggestedPrice}
                      </Button>
                    ))}
                  </div>

                  {/* Price Impact Analysis */}
                  {priceNumber > 0 && priceNumber !== ensureNumber(packageData.package_price) && (
                    <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4" />
                          <span className="font-medium">Price Change Impact</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Current Revenue:</span>
                            <div className="font-semibold">{formatPrice(currentRevenue)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Projected:</span>
                            <div className="font-semibold">{formatPrice(projectedRevenue)}</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  {/* Public/Private */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Package Access</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-is-public"
                        checked={isPublic}
                        onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                      />
                      <Label htmlFor="edit-is-public" className="text-sm cursor-pointer flex items-center gap-1">
                        {isPublic ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Public package
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Private package
                          </>
                        )}
                      </Label>
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Promotion</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-is-featured"
                        checked={isFeatured}
                        onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                      />
                      <Label htmlFor="edit-is-featured" className="text-sm cursor-pointer flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Featured package
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Package Status */}
                <Card className="p-3 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-medium text-sm mb-2">Package Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publication:</span>
                      <Badge variant={packageData.is_published ? 'default' : 'outline'} className="text-xs">
                        {packageData.is_published ? '✅ Published' : '📝 Draft'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moderation:</span>
                      <Badge variant="outline" className="text-xs">
                        {packageData.moderation_status === 'approved' ? '✅ Approved' : 
                         packageData.moderation_status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Content Management with Image Fallbacks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Package Contents *
                </Label>
                <Badge variant="outline" className="text-xs">
                  {selectedContentIds.length} items selected
                </Badge>
              </div>

              {/* Content Changes Summary */}
              {(addContentIds.length > 0 || removeContentIds.length > 0) && (
                <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-sm text-yellow-900 dark:text-yellow-100">
                    <div className="font-medium mb-1">Content Changes:</div>
                    {addContentIds.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Plus className="h-3 w-3" />
                        <span>Adding {addContentIds.length} item(s)</span>
                      </div>
                    )}
                    {removeContentIds.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Minus className="h-3 w-3" />
                        <span>Removing {removeContentIds.length} item(s)</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {loadingContent ? (
                <Card className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Loading content...</span>
                  </div>
                </Card>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {availableContentForSelection.map((item) => {
                    const isSelected = selectedContentIds.includes(item.content_id);
                    const isCurrentPackageItem = packageData.content_items?.some(ci => ci.content_id === item.content_id);
                    
                    return (
                      <Card
                        key={item.content_id}
                        className={`p-3 transition-all duration-200 ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleContentToggle(item.content_id)}
                          />
                          
                          {/* Content Cover Image with Fallback */}
                          <div className="flex-shrink-0">
                            {item.cover_image_url ? (
                              contentImageErrors[item.content_id] ? (
                                <ImageFallback 
                                  contentType={item.content_type}
                                  title={item.title}
                                  className="w-12 h-12"
                                  isLarge={false}
                                />
                              ) : (
                                <img
                                  src={item.cover_image_url}
                                  alt={`${item.title} cover`}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                  onError={() => handleContentImageError(item.content_id)}
                                />
                              )
                            ) : (
                              <ImageFallback 
                                contentType={item.content_type}
                                title={item.title}
                                className="w-12 h-12"
                                isLarge={false}
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {item.title}
                              </h4>
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.content_type}
                              </Badge>
                              {isCurrentPackageItem && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatFileSize(item.file_size_bytes)}</span>
                              <span>{item.view_count} views</span>
                              <span>{item.purchase_count} sales</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Updated Package Value */}
              {priceNumber > 0 && selectedContent.length >= 2 && (
                <Card className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                  <div className="text-sm text-green-900 dark:text-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4" />
                      <span className="font-medium">Updated Package Value</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Individual Total:</span>
                        <div className="font-semibold">{formatPrice(individualTotal)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Package Price:</span>
                        <div className="font-semibold">{formatPrice(priceNumber)}</div>
                      </div>
                      {packageValue.savings_amount > 0 && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Savings:</span>
                            <div className="font-semibold text-green-600">{formatPrice(packageValue.savings_amount)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <div className="font-semibold text-green-600">{packageValue.discount_percentage.toFixed(1)}%</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Optimization Tips */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">
                    Optimization Tips
                  </h4>
                  <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Higher discounts (30%+) tend to drive more package sales</li>
                    <li>• Featured packages get 3x more visibility in search results</li>
                    <li>• Update descriptions regularly to maintain search relevance</li>
                    <li>• Monitor conversion rates - low rates may indicate pricing issues</li>
                  </ul>
                </div>
              </div>
            </Card>
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
                    Saving Changes...
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