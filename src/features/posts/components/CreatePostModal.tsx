import { useState, useRef } from 'react';
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
import { createPost } from '../api/postsApi';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Upload,
  X,
  Image,
  Video,
  Music,
  FileText,
  Loader2,
  Link,
  Youtube,
  Monitor,
  Twitter
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TipTapMarkdownEditor } from './TipTapMarkdownEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [requestedTier, setRequestedTier] = useState<'free' | 'subscriber'>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaTab, setMediaTab] = useState<'upload' | 'social-link'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxContentLength = 2500;

  const supportedFileTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm'],
    audio: ['audio/mp3', 'audio/ogg', 'audio/wav', 'audio/m4a', 'audio/aac']
  };

  const allSupportedTypes = [
    ...supportedFileTypes.image,
    ...supportedFileTypes.video,
    ...supportedFileTypes.audio
  ];

  const supportedSocialLinkPatterns = [
    'youtube.com/watch',
    'youtu.be/',
    'youtube.com/embed/',
    'vimeo.com/',
    'player.vimeo.com/',
    'twitch.tv/videos/',
    'player.twitch.tv/',
    'tiktok.com/@',
    'tiktok.com/embed/',
    'twitter.com/',
    'x.com/',
    'mobile.twitter.com/',
    'mobile.x.com/'
  ];

  const isValidSocialLink = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      const urlObj = new URL(url);
      return supportedSocialLinkPatterns.some(pattern => 
        urlObj.href.toLowerCase().includes(pattern.toLowerCase())
      );
    } catch {
      return false;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allSupportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please select an image (JPEG, PNG, GIF, WebP), video (MP4, WebM), or audio (MP3, OGG, WAV, M4A, AAC) file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setMedia(file);

    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setMedia(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSocialLink = () => {
    setVideoLinkUrl('');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getSocialPlatformIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return <Youtube className="h-4 w-4 text-red-500" />;
    }
    if (lowerUrl.includes('vimeo.com')) {
      return <Monitor className="h-4 w-4 text-blue-500" />;
    }
    if (lowerUrl.includes('twitch.tv')) {
      return <Monitor className="h-4 w-4 text-purple-500" />;
    }
    if (lowerUrl.includes('tiktok.com')) {
      return <Monitor className="h-4 w-4 text-black dark:text-white" />;
    }
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return <Twitter className="h-4 w-4 text-blue-500" />;
    }
    return <Link className="h-4 w-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !media && !videoLinkUrl.trim()) {
      toast({
        title: "Empty Post",
        description: "Please add some content, media, or a social link to your post.",
        variant: "destructive",
      });
      return;
    }

    // Validate that they don't have both media and social link
    if (media && videoLinkUrl.trim()) {
      toast({
        title: "Cannot use both",
        description: "Please choose either a media file OR a video link, not both.",
        variant: "destructive",
      });
      return;
    }

    // Validate social link if provided
    if (videoLinkUrl.trim() && !isValidSocialLink(videoLinkUrl)) {
      toast({
        title: "Invalid social link",
        description: "Please provide a valid YouTube, Vimeo, Twitch, TikTok, or Twitter/X URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPost({
        content: content,
        media: media || undefined,
        videoLinkUrl: videoLinkUrl.trim() || undefined,
        requestedTier: requestedTier
      });

      toast({
        title: "Post created successfully! 🎉",
        description: response.freemium_info.was_upgraded_to_subscriber 
          ? "Your post was automatically made subscriber-only since you've used all free slots."
          : `You have ${response.freemium_info.remaining_free_slots} free post slots remaining.`,
      });

      // Reset form
      setContent('');
      setMedia(null);
      setVideoLinkUrl('');
      setFilePreview(null);
      setRequestedTier('free');
      setMediaTab('upload');
      onClose();
      onSuccess();

    } catch (error: any) {
      // Extract details from the error response
      let errorMessage = "An error occurred while creating your post.";
      
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        // Join the details array into a readable message
        errorMessage = error.response.data.details.join(", ");
      } else if (error.response?.data?.error) {
        // Fallback to the error message
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        // Fallback to the message field
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Failed to create post",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setMedia(null);
    setVideoLinkUrl('');
    setFilePreview(null);
    setRequestedTier('free');
    setMediaTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-3xl h-[80vh] max-h-[800px] flex flex-col p-0">
        <div className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl font-bold">Create New Post</DialogTitle>
            <DialogDescription className="text-sm">
              Share your thoughts with your audience
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-3" style={{ minHeight: 0 }}>
          <div className="space-y-6">
            {/* Content Section - Resizable with character count */}
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-semibold">
                Content
              </Label>
              <div className="relative">
                <div 
                  className="min-h-[180px] max-h-[400px] border rounded-lg overflow-hidden resize-y"
                  style={{ resize: 'vertical' }}
                >
                  <TipTapMarkdownEditor
                    content={content}
                    onChange={setContent}
                    placeholder="What's on your mind? Share your thoughts, stories, or updates with your audience..."
                    maxLength={2500}
                    className="h-full min-h-[180px]"
                  />
                </div>
                {/* Character Count and Encouragement Footer */}
                {/* <div className="flex justify-between items-center mt-2 px-2">
                  <div className="text-xs text-muted-foreground">
                    💡 <span className="font-medium">Pro tip:</span> Use **bold**, *italic*, and markdown formatting to make your content shine!
                  </div>
                  <div className={`text-xs font-medium ${
                    content.length > maxContentLength * 0.9 
                      ? 'text-orange-500' 
                      : content.length > maxContentLength * 0.8 
                      ? 'text-yellow-600' 
                      : 'text-muted-foreground'
                  }`}>
                    {content.length}/{maxContentLength}
                  </div>
                </div> */}
              </div>
            </div>

            {/* Media Upload or Social Link */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Media (Optional)</Label>
              
              <Tabs value={mediaTab} onValueChange={(value) => setMediaTab(value as 'upload' | 'social-link')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="social-link" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Social Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-3">
                  {!media ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Click to upload media
                      </p>
                      <p className="text-xs text-gray-500">
                        Images, videos, or audio files up to 10MB
                      </p>
                      <div className="flex flex-wrap justify-center gap-1 mt-3">
                        <Badge variant="outline" className="text-xs">JPEG, PNG, GIF, WebP</Badge>
                        <Badge variant="outline" className="text-xs">MP4, WebM</Badge>
                        <Badge variant="outline" className="text-xs">MP3, OGG, WAV</Badge>
                      </div>
                    </div>
                  ) : (
                    <Card className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getFileIcon(media.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{media.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(media.size / 1024 / 1024).toFixed(2)} MB
                          </p>
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
                        <div className="mt-3">
                          {media.type.startsWith('image/') ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="max-w-full h-auto max-h-24 rounded-lg object-cover"
                            />
                          ) : media.type.startsWith('video/') ? (
                            <video
                              src={filePreview}
                              className="max-w-full h-auto max-h-24 rounded-lg"
                              controls
                            />
                          ) : null}
                        </div>
                      )}
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="social-link" className="mt-3">
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="url"
                        placeholder="Paste YouTube, Vimeo, Twitch, TikTok, or Twitter/X URL..."
                        value={videoLinkUrl}
                        onChange={(e) => setVideoLinkUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported platforms: YouTube, Vimeo, Twitch, TikTok, Twitter/X
                      </p>
                    </div>
                    
                    {videoLinkUrl && (
                      <Card className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getSocialPlatformIcon(videoLinkUrl)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Social Link</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {videoLinkUrl}
                            </p>
                            {!isValidSocialLink(videoLinkUrl) && (
                              <p className="text-xs text-red-500 mt-1">
                                Please enter a valid social media URL
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeSocialLink}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <input
                ref={fileInputRef}
                type="file"
                accept={allSupportedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Post Tier Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Post Visibility</Label>
              <RadioGroup
                value={requestedTier}
                onValueChange={(value: string) => setRequestedTier(value as 'free' | 'subscriber')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="text-sm cursor-pointer">
                    🆓 Free (Public)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subscriber" id="subscriber" />
                  <Label htmlFor="subscriber" className="text-sm cursor-pointer">
                    💎 Subscriber Only
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Note: If you've used all free post slots, free posts will automatically become subscriber-only.
              </p>
            </div>

            {/* Creator Encouragement Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🚀</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                    Create Amazing Content
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Share your unique perspective, tell your story, and connect with your audience. 
                    Great content combines authenticity with value - whether that's entertainment, education, or inspiration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 pt-3 border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !media && !videoLinkUrl.trim())}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};