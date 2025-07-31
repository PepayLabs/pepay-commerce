import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { createPackage, validatePackagePrice, validatePackagePreviewFile, getSupportedPreviewTypes, getPackagePreviewLimits, formatPrice, calculatePackageValue } from '../api/packages.api';
import { fetchContent, ContentPreview } from '../api/content.api';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Upload,
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
  Image as ImageIcon,
  Video,
  Search,
  Percent,
  FileText,
  Volume2,
  FileType
} from 'lucide-react';
import { CreateContentFAQs } from './CreateContentFAQs';

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortMetadata, setShortMetadata] = useState('');
  const [packagePrice, setPackagePrice] = useState<string>('9.99');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [availableContent, setAvailableContent] = useState<ContentPreview[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxTitleLength = 100;
  const maxDescriptionLength = 1000;
  const maxShortMetadataLength = 200;

  const supportedPreviewTypes = getSupportedPreviewTypes();
  const previewLimits = getPackagePreviewLimits();
  
  const allSupportedPreviewTypes = [
    ...supportedPreviewTypes.image,
    ...supportedPreviewTypes.video
  ];

  // Add pagination state (around line 60)
  const [contentPage, setContentPage] = useState(0);
  const [contentHasMore, setContentHasMore] = useState(true);
  const [loadingMoreContent, setLoadingMoreContent] = useState(false);

  // Memoize the package examples to prevent recreation on every render
  const packageExamples = useMemo(() => [
    {
      title: "Behind the Scenes VIP Access Bundle",
      seoMeta: "Exclusive content • 12 videos • Never-seen footage • Subscriber perks"
    },
    {
      title: "Complete Fitness Journey Transformation Pack",
      seoMeta: "Workout routines • Meal plans • Progress tracking • 30-day challenge"
    },
    {
      title: "Intimate Moments & Personal Stories Collection",
      seoMeta: "Personal vlogs • Q&A sessions • Candid photos • Exclusive stories"
    },
    {
      title: "Master Class Creator Secrets Vault",
      seoMeta: "Tutorial videos • Business tips • Income strategies • Creator tools"
    },
    {
      title: "My Wild Adventures & Travel Diaries",
      seoMeta: "Travel vlogs • Photo albums • Local experiences • Adventure stories"
    },
    {
      title: "Premium Lifestyle & Fashion Lookbook",
      seoMeta: "Style guides • Outfit ideas • Fashion hauls • Beauty tutorials"
    },
    {
      title: "Exclusive Gaming Sessions & Commentary",
      seoMeta: "Gameplay videos • Live streams • Gaming tips • Behind-the-scenes"
    },
    {
      title: "Art Process & Creative Workshop Bundle",
      seoMeta: "Time-lapse videos • Tutorials • Sketches • Creative process"
    }
  ], []);

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  // Rotate examples every 3 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % packageExamples.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen, packageExamples.length]);

  const currentExample = packageExamples[currentExampleIndex];

  // Memoize the loadAvailableContent function - remove contentPage from dependencies
  const loadAvailableContent = useCallback(async (reset: boolean = true) => {
    if (reset) {
      setLoadingContent(true);
      setContentPage(0);
      setAvailableContent([]);
    } else {
      setLoadingMoreContent(true);
    }

    try {
      // Use functional update to get current contentPage value
      const currentOffset = reset ? 0 : await new Promise<number>((resolve) => {
        setContentPage(prev => {
          resolve(prev * 10);
          return prev;
        });
      });
      
      const response = await fetchContent(10, currentOffset, undefined, undefined, false);
      
      const publishedContent = response.content.filter(item => 
        item.is_published && 
        item.is_active && 
        item.moderation_status === 'approved'
      );
      
      if (reset) {
        setAvailableContent(publishedContent);
      } else {
        setAvailableContent(prev => [...prev, ...publishedContent]);
      }
      
      setContentHasMore(response.pagination.has_more);
      
      if (!reset) {
        setContentPage(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Failed to load content",
        description: "Could not load your available content for packaging.",
        variant: "destructive",
      });
    } finally {
      setLoadingContent(false);
      setLoadingMoreContent(false);
    }
  }, []); // Remove all dependencies to prevent infinite loops

  // Simpler approach - load content only when modal opens, don't depend on loadAvailableContent
  useEffect(() => {
    if (isOpen && availableContent.length === 0) {
      // Inline the content loading logic to avoid dependency issues
      const loadContent = async () => {
        setLoadingContent(true);
        try {
          const response = await fetchContent(10, 0, undefined, undefined, false);
          const publishedContent = response.content.filter(item => 
            item.is_published && 
            item.is_active && 
            item.moderation_status === 'approved'
          );
          setAvailableContent(publishedContent);
          setContentHasMore(response.pagination.has_more);
          setContentPage(1); // Set to 1 since we loaded the first page
        } catch (error: any) {
          toast({
            title: "Failed to load content",
            description: "Could not load your available content for packaging.",
            variant: "destructive",
          });
        } finally {
          setLoadingContent(false);
        }
      };
      
      loadContent();
    }
  }, [isOpen]); // Only depend on isOpen

  const loadMoreContent = useCallback(() => {
    if (!loadingMoreContent && contentHasMore) {
      setLoadingMoreContent(true);
      
      // Inline the load more logic
      const loadMore = async () => {
        try {
          const currentOffset = contentPage * 10;
          const response = await fetchContent(10, currentOffset, undefined, undefined, false);
          
          const publishedContent = response.content.filter(item => 
            item.is_published && 
            item.is_active && 
            item.moderation_status === 'approved'
          );
          
          setAvailableContent(prev => [...prev, ...publishedContent]);
          setContentHasMore(response.pagination.has_more);
          setContentPage(prev => prev + 1);
        } catch (error: any) {
          toast({
            title: "Failed to load more content",
            description: "Could not load additional content.",
            variant: "destructive",
          });
        } finally {
          setLoadingMoreContent(false);
        }
      };
      
      loadMore();
    }
  }, [loadingMoreContent, contentHasMore, contentPage, toast]);

  const handlePreviewFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validation = validatePackagePreviewFile(selectedFile);
    if (!validation.isValid) {
      toast({
        title: "Invalid preview file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setPreviewFile(selectedFile);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewFileUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const removePreviewFile = () => {
    setPreviewFile(null);
    setPreviewFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContentToggle = useCallback((contentId: string) => {
    setSelectedContentIds(prev => 
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  }, []);

  // Memoize calculations to prevent unnecessary recalculations
  const calculatedValues = useMemo(() => {
    const selectedContent = availableContent.filter(item => selectedContentIds.includes(item.content_id));
    const individualTotal = selectedContent.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      return sum + itemPrice;
    }, 0);
    const priceNumber = parseFloat(packagePrice) || 0;
    const packageValue = calculatePackageValue(priceNumber, individualTotal);

    return {
      selectedContent,
      individualTotal,
      priceNumber,
      packageValue
    };
  }, [availableContent, selectedContentIds, packagePrice]);

  // Helper functions - moved to top before they're used
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <FileType className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'video':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'audio':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      case 'video':
        return 'border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
      case 'audio':
        return 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      default:
        return 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

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

    const priceValidation = validatePackagePrice(calculatedValues.priceNumber);
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
      const response = await createPackage({
        title: title.trim(),
        description: description.trim() || undefined,
        short_metadata: shortMetadata.trim() || undefined,
        package_price: calculatedValues.priceNumber,
        content_ids: selectedContentIds,
        is_public: isPublic,
        is_featured: isFeatured,
        preview_file: previewFile || undefined
      });

      toast({
        title: "Package created successfully! 🎉",
        description: `Your "${response.package.title}" package is now available with ${response.content_items.length} items and ${calculatedValues.packageValue.discount_percentage.toFixed(0)}% savings.`,
      });

      // Reset form
      resetForm();
      onClose();
      onSuccess();

    } catch (error: any) {
      let errorMessage = "An error occurred while creating your package.";
      
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        errorMessage = error.response.data.details.join(", ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Failed to create package",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setShortMetadata('');
    setPackagePrice('9.99');
    setIsPublic(true);
    setIsFeatured(false);
    setSelectedContentIds([]);
    setPreviewFile(null);
    setPreviewFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = title.trim() && selectedContentIds.length >= 2 && !isNaN(calculatedValues.priceNumber) && calculatedValues.priceNumber >= 1.00;
  const suggestedPrices = [4.99, 9.99, 19.99, 29.99, 49.99, 99.99];

  // Add search functionality
  const [contentSearchQuery, setContentSearchQuery] = useState('');

  // Filter available content based on search query
  const filteredAvailableContent = availableContent.filter(item =>
    item.title.toLowerCase().includes(contentSearchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[1000px] flex flex-col p-0">
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Create Content Package
            </DialogTitle>
            <DialogDescription className="text-sm">
              Bundle your content together and offer amazing savings to your audience
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3" style={{ minHeight: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Package Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Package Title * <span className="text-xs text-muted-foreground">({title.length}/{maxTitleLength})</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
                    placeholder={currentExample.title}
                    className="bg-white/90 dark:bg-gray-900/90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short-metadata" className="text-sm font-semibold">
                    SEO Metadata <span className="text-xs text-muted-foreground">({shortMetadata.length}/{maxShortMetadataLength})</span>
                  </Label>
                  <Input
                    id="short-metadata"
                    value={shortMetadata}
                    onChange={(e) => setShortMetadata(e.target.value.slice(0, maxShortMetadataLength))}
                    placeholder={currentExample.seoMeta}
                    className="bg-white/90 dark:bg-gray-900/90"
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps search engines and social media understand your package content
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Package Tagline <span className="text-xs text-muted-foreground">({description.length}/{maxDescriptionLength})</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, maxDescriptionLength))}
                    placeholder="Create a compelling tagline that makes your audience excited to buy this package. Think of it as your elevator pitch - what makes this bundle irresistible?"
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

                  {/* Package Value Display */}
                  {calculatedValues.priceNumber > 0 && calculatedValues.selectedContent.length >= 2 && (
                    <Card className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                      <div className="text-sm text-green-900 dark:text-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="h-4 w-4" />
                          <span className="font-medium">Package Value</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Individual Total:</span>
                            <div className="font-semibold">{formatPrice(calculatedValues.individualTotal)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Your Package Price:</span>
                            <div className="font-semibold">{formatPrice(calculatedValues.priceNumber)}</div>
                          </div>
                          {calculatedValues.packageValue.savings_amount > 0 && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Savings:</span>
                                <div className="font-semibold text-green-600">{formatPrice(calculatedValues.packageValue.savings_amount)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Discount:</span>
                                <div className="font-semibold text-green-600">{calculatedValues.packageValue.discount_percentage.toFixed(1)}%</div>
                              </div>
                            </>
                          )}
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
                        id="is-public"
                        checked={isPublic}
                        onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                      />
                      <Label htmlFor="is-public" className="text-sm cursor-pointer flex items-center gap-1">
                        {isPublic ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Make this package publicly discoverable
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Keep this package private
                          </>
                        )}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Public packages are your opportunity to show supporters what they're missing. Private packages are exclusively available to paying customers.
                    </p>
                  </div>

                  {/* Featured */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Promotion</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-featured"
                        checked={isFeatured}
                        onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                      />
                      <Label htmlFor="is-featured" className="text-sm cursor-pointer flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Feature this package
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Featured packages get priority placement and increased visibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Select Content Items *</Label>
                <Badge variant="outline" className="text-xs">
                  {selectedContentIds.length} selected (min 2 required)
                </Badge>
              </div>

              {loadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading your content...</span>
                </div>
              ) : availableContent.length === 0 ? (
                <Card className="p-6 text-center border-dashed">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No published content available. Create some content first to build packages.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search your content..."
                      value={contentSearchQuery}
                      onChange={(e) => setContentSearchQuery(e.target.value)}
                      className="pl-10 bg-white/90 dark:bg-gray-900/90"
                    />
                  </div>

                  {/* Content list */}
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gradient-to-br from-gray-50/80 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-950/20">
                    {filteredAvailableContent.map((item) => {
                      const isSelected = selectedContentIds.includes(item.content_id);
                      const contentTypeColor = getContentTypeColor(item.content_type);
                      
                      return (
                        <div
                          key={item.content_id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer transform hover:scale-[1.01] ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/20 border-purple-300 dark:border-purple-600 shadow-md ring-2 ring-purple-200 dark:ring-purple-800'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContentIds(prev => [...prev, item.content_id]);
                              } else {
                                setSelectedContentIds(prev => prev.filter(id => id !== item.content_id));
                              }
                            }}
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          
                          {/* Content type icon with color - remove onClick from parent div */}
                          <div 
                            className={`flex-shrink-0 p-2 rounded-lg ${contentTypeColor} cursor-pointer`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContentToggle(item.content_id);
                            }}
                          >
                            {getContentTypeIcon(item.content_type)}
                          </div>
                          
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContentToggle(item.content_id);
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                                {item.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getBadgeColor(item.content_type)}`}
                              >
                                {item.content_type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {formatPrice(item.price)} • {formatFileSize(item.file_size_bytes)} • {item.view_count} views
                            </p>
                            {item.short_metadata && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                {item.short_metadata}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatPrice(item.price)}
                            </div>
                            {isSelected && (
                              <Badge variant="default" className="text-xs mt-1 bg-purple-500">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Load More Button */}
                    {contentHasMore && (
                      <div className="text-center pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadMoreContent}
                          disabled={loadingMoreContent}
                          className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
                        >
                          {loadingMoreContent ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin text-purple-500" />
                              Loading more...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2 text-purple-500" />
                              Load More Content
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview File Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Package Cover (Optional)</Label>
              
              {!previewFile ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Add Package Cover
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Upload an image or short video to represent your package
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Badge variant="outline" className="text-xs">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Images (10MB)
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Videos (30MB)
                    </Badge>
                  </div>
                </div>
              ) : (
                <Card className="p-4 bg-white/90 dark:bg-gray-900/90">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {previewFileUrl && previewFile.type.startsWith('image/') ? (
                        <img
                          src={previewFileUrl}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : previewFileUrl && previewFile.type.startsWith('video/') ? (
                        <video
                          src={previewFileUrl}
                          className="w-16 h-16 object-cover rounded-lg"
                          muted
                          autoPlay
                          loop
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {previewFile.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(previewFile.size)} • {previewFile.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removePreviewFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={allSupportedPreviewTypes.join(',')}
                onChange={handlePreviewFileSelect}
                className="hidden"
              />
            </div>

            {/* Package Guidelines */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">
                    Package Success Tips
                  </h4>
                  <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Create packages that offer genuine value and savings to buyers</li>
                    <li>• Use clear, descriptive titles that explain what's included</li>
                    <li>• Add a compelling cover image to increase package appeal</li>
                    <li>• Price competitively - significant savings encourage purchases</li>
                    <li>• Group related content together for logical bundles</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Content Agreement */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p>
                  By creating this package, you agree all content is compliant with our{' '}
                  <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    terms of service
                  </a>
                </p>
              </div>
            </Card>

            {/* Package FAQs */}
            <CreateContentFAQs />

            {/* Validation Messages */}
            {selectedContentIds.length > 0 && selectedContentIds.length < 2 && (
              <Card className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Please select at least 2 content items to create a package.</span>
                </div>
              </Card>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {selectedContentIds.length >= 2 && calculatedValues.priceNumber > 0 ? (
                <span className="text-green-600 font-medium">• Ready to create package</span>
              ) : (
                <span>Select content and set price to continue</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Package...
                  </>
                ) : (
                  <>
                    <PackageIcon className="h-4 w-4 mr-2" />
                    Create Package
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