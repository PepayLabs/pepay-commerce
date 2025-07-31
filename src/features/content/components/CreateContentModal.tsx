import { useState, useRef, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { createContent, validateContentFile, validatePrice, getSupportedFileTypes, getFileSizeLimits, validateCoverImage } from '../api/content.api';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Volume2,
  FileType,
  Loader2,
  DollarSign,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Star,
  AlertTriangle
} from 'lucide-react';
import { CreateContentFAQs } from './CreateContentFAQs';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortMetadata, setShortMetadata] = useState('');
  const [price, setPrice] = useState<string>('2.99');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxTitleLength = 100;
  const maxDescriptionLength = 1000;
  const maxShortMetadataLength = 200;

  const supportedTypes = getSupportedFileTypes();
  const fileSizeLimits = getFileSizeLimits();
  
  const allSupportedTypes = [
    ...supportedTypes.image,
    ...supportedTypes.video,
    ...supportedTypes.audio
  ];

  // Rotating placeholder examples for titles
  const titleExamples = [
    "Advanced Photography Course",
    "Watch My Trip to Meet Gangsters in Ethiopia", 
    "Behind the Scenes: My Daily Routine",
    "Exclusive Workout Sessions",
    "Private Cooking Tutorial",
    "My Secret Beauty Routine",
    "Intimate Late Night Chats",
    "Personal Fitness Journey",
    "Exclusive Travel Vlogs",
    "Private Art Sessions",
    "My Morning Routine Revealed",
    "Exclusive Fashion Try-Ons"
  ];

  const [currentTitleExample, setCurrentTitleExample] = useState(0);

  // Rotate title examples every 3 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCurrentTitleExample((prev) => (prev + 1) % titleExamples.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, titleExamples.length]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateContentFile(selectedFile);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Create preview for images and videos
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Volume2 className="h-5 w-5" />;
    return <FileType className="h-5 w-5" />;
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (type.startsWith('video/')) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    if (type.startsWith('audio/')) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCoverImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateCoverImage(selectedFile);
    if (!validation.isValid) {
      toast({
        title: "Invalid cover image",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setCoverImage(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  };

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

    if (!file) {
      toast({
        title: "File required",
        description: "Please select a file to upload.",
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

    setIsSubmitting(true);
    try {
      const response = await createContent({
        title: title.trim(),
        description: description.trim() || undefined,
        short_metadata: shortMetadata.trim() || undefined,
        price: priceNumber,
        is_public: isPublic,
        is_featured: isFeatured,
        file,
        cover_image: coverImage || undefined
      });

      toast({
        title: "Content created successfully! 🎉",
        description: `Your ${file.type.split('/')[0]} content is now available. ${
          response.content_limits.remaining_slots.total > 0
            ? `You have ${response.content_limits.remaining_slots.total} slots remaining.`
            : 'You\'ve reached your content limit.'
        }`,
      });

      // Reset form
      resetForm();
      onClose();
      onSuccess();

    } catch (error: any) {
      let errorMessage = "An error occurred while creating your content.";
      
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        errorMessage = error.response.data.details.join(", ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Failed to create content",
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
    setPrice('2.99');
    setIsPublic(false);
    setIsFeatured(false);
    setFile(null);
    setFilePreview(null);
    setCoverImage(null);
    setCoverImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  };

  const isFormValid = title.trim() && file && !isNaN(parseFloat(price)) && parseFloat(price) >= 0.50;
  const priceNumber = parseFloat(price) || 0;
  const suggestedPrices = [0.99, 2.99, 4.99, 9.99, 19.99, 49.99];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-3xl h-[85vh] max-h-[900px] flex flex-col p-0">
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Create Premium Content
            </DialogTitle>
            <DialogDescription className="text-sm">
              Upload and monetize your creative work with our secure platform
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3" style={{ minHeight: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Content File *</Label>
              
              {!file ? (
                <div 
                  className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gradient-to-br from-purple-25 to-pink-25 dark:from-purple-950/10 dark:to-pink-950/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Upload Your Content
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop or click to select your file
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-md mx-auto">
                    <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Images (15MB)
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20">
                      <Video className="h-3 w-3 mr-1" />
                      Videos (120MB)
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Audio (25MB)
                    </Badge>
                  </div>
                </div>
              ) : (
                <Card className="p-4 bg-white/90 dark:bg-gray-900/90 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${getFileTypeColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {file.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      {file.type.startsWith('video/') && (
                        <Badge variant="outline" className="text-xs mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          Preview supported
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {filePreview && (
                    <div className="mt-4">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-w-full h-auto max-h-32 rounded-lg object-cover mx-auto"
                        />
                      ) : file.type.startsWith('video/') ? (
                        <video
                          src={filePreview}
                          className="max-w-full h-auto max-h-32 rounded-lg mx-auto"
                          controls
                        />
                      ) : null}
                    </div>
                  )}
                </Card>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={allSupportedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Cover Image Section - NEW */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Cover Image (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Upload a high-quality cover image (up to 4MB) to make your content more appealing
              </p>
              
              {!coverImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-900/50"
                  onClick={() => coverImageInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload cover image
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Up to 4MB • JPEG, PNG, GIF, WebP
                  </Badge>
                </div>
              ) : (
                <Card className="p-4 bg-white/90 dark:bg-gray-900/90 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {coverImagePreview && (
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {coverImage.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(coverImage.size)} • {coverImage.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCoverImage}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleCoverImageSelect}
                className="hidden"
              />
            </div>

            {/* Title and Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Title * <span className="text-xs text-muted-foreground">({title.length}/{maxTitleLength})</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
                  placeholder={`e.g., ${titleExamples[currentTitleExample]}`}
                  className="bg-white/90 dark:bg-gray-900/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short-metadata" className="text-sm font-semibold">
                  SEO Description <span className="text-xs text-muted-foreground">({shortMetadata.length}/{maxShortMetadataLength})</span>
                </Label>
                <Input
                  id="short-metadata"
                  value={shortMetadata}
                  onChange={(e) => setShortMetadata(e.target.value.slice(0, maxShortMetadataLength))}
                  placeholder="e.g., Master portrait lighting techniques"
                  className="bg-white/90 dark:bg-gray-900/90"
                />
                <p className="text-xs text-muted-foreground">
                  This helps search engines and social media understand your content
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Detailed Description <span className="text-xs text-muted-foreground">({description.length}/{maxDescriptionLength})</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, maxDescriptionLength))}
                placeholder="Provide a comprehensive description of your content, what buyers will learn or get, and why it's valuable..."
                rows={4}
                className="resize-none bg-white/90 dark:bg-gray-900/90"
              />
            </div>

            {/* Pricing and Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price */}
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

                {priceNumber > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    Platform fee: ~{(priceNumber * 0.1).toFixed(2)} USD
                  </div>
                )}
              </div>

              {/* Access Control and Featured */}
              <div className="space-y-4">
                {/* Public/Private */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Access Level</Label>
                  <RadioGroup
                    value={isPublic.toString()}
                    onValueChange={(value) => setIsPublic(value === 'true')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="private" />
                      <Label htmlFor="private" className="text-sm cursor-pointer flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="public" />
                      <Label htmlFor="public" className="text-sm cursor-pointer flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Public content is your opportunity to show your supporters what they're missing. Private content is exclusively available to paying customers.
                  </p>
                </div>

                {/* Featured Content */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Featured Content
                    </Label>
                    <Checkbox
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                      className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Only one content can be featured at a time. Featuring this content will remove the featured status from any other content.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Guidelines */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Content Agreement
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-2">
                    <p>
                      By uploading content, you agree that all content is compliant with our{' '}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                      >
                        Terms of Service
                      </a>
                    </p>
                    <ul className="space-y-1 mt-2">
                      <li>• Ensure your content provides clear value to buyers</li>
                      <li>• Use descriptive titles and detailed descriptions for better discovery</li>
                      <li>• Consider adding preview content for videos to increase conversions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQ Section */}
            <CreateContentFAQs />
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex justify-end gap-3">
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};