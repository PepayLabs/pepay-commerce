import { axiosInstance } from '@/lib/axios';

// Content types
export type ContentType = 'image' | 'video' | 'audio';
export type ModerationStatus = 'approved' | 'pending' | 'rejected';

// Content preview interface (for list views)
export interface ContentPreview {
  content_id: string;
  title: string;
  description?: string;
  short_metadata?: string;
  content_type: ContentType;
  price: number;
  is_public: boolean;
  is_featured: boolean;
  is_published: boolean;
  is_active: boolean;
  file_size_bytes: number;
  file_mime_type: string;
  preview_seconds?: number | null;
  cover_image_url?: string;
  view_count: number;
  purchase_count: number;
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Full content interface (for individual content views)
export interface Content extends ContentPreview {
  account_id: string;
  file_filename?: string;
  file_url?: string; // Signed URL when authorized
  display_name?: string;
  display_link?: string;
  is_owner: boolean;
  has_access: boolean;
}

// Content list response interface
export interface ContentResponse {
  content: ContentPreview[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Content limits interface
export interface ContentLimits {
  purchase_count: number;
  max_public_content: number;
  max_private_content: number;
  max_total_content: number;
  current_counts: {
    total_content: number;
    public_content: number;
    private_content: number;
  };
  remaining_slots: {
    total: number;
    public: number;
    private: number;
  };
}

// Create content request interface
export interface CreateContentRequest {
  title: string;
  description?: string;
  short_metadata?: string;
  price: number;
  is_public?: boolean;
  is_featured?: boolean;
  preview_seconds?: number;
  file: File;
  cover_image?: File;
}

// Create content response interface
export interface CreateContentResponse {
  message: string;
  content: Content;
  content_limits: ContentLimits;
}

// Update content request interface
export interface UpdateContentRequest {
  title?: string;
  description?: string;
  short_metadata?: string;
  price?: number;
  preview_seconds?: number;
}

// Update content response interface
export interface UpdateContentResponse {
  message: string;
  content: Content;
}

// Delete content response interface
export interface DeleteContentResponse {
  message: string;
  content_id: string;
  title: string;
  affected_packages?: Array<{
    package_id: string;
    title: string;
    action: 'updated' | 'unpublished';
    new_content_count?: number;
    new_individual_total?: number;
    new_discount_percentage?: number;
    reason?: string;
  }>;
}

// Publish content request interface
export interface PublishContentRequest {
  is_published: boolean;
}

// Publish content response interface
export interface PublishContentResponse {
  message: string;
  content: Content;
}

// API base URL configuration
const getBaseUrl = () => {
  return import.meta.env.PROD 
    ? 'https://api.pepay.io'
    : 'http://localhost:3000';
};

/**
 * Fetch content with pagination and filtering
 */
export const fetchContent = async (
  limit: number = 7,
  offset: number = 0,
  contentType?: ContentType,
  isPublic?: boolean,
  includeUnpublished: boolean = true
): Promise<ContentResponse> => {
  try {
    const params: Record<string, any> = {
      limit,
      offset,
      include_unpublished: includeUnpublished
    };

    if (contentType) {
      params.content_type = contentType;
    }

    if (isPublic !== undefined) {
      params.is_public = isPublic.toString();
    }

    const response = await axiosInstance.get(`${getBaseUrl()}/api/accounts/content`, {
      params
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

/**
 * Fetch a specific content by ID
 */
export const fetchContentById = async (contentId: string): Promise<Content> => {
  try {
    const response = await axiosInstance.get(`${getBaseUrl()}/api/accounts/content/${contentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    throw error;
  }
};

/**
 * Create new content with enhanced features
 */
export const createContent = async (contentData: CreateContentRequest): Promise<CreateContentResponse> => {
  try {
    const formData = new FormData();
    
    formData.append('title', contentData.title);
    formData.append('price', contentData.price.toString());
    formData.append('file', contentData.file);
    
    if (contentData.description) {
      formData.append('description', contentData.description);
    }
    
    if (contentData.short_metadata) {
      formData.append('short_metadata', contentData.short_metadata);
    }
    
    if (contentData.is_public !== undefined) {
      formData.append('is_public', contentData.is_public ? 'true' : 'false');
    }
    
    if (contentData.is_featured !== undefined) {
      formData.append('is_featured', contentData.is_featured ? 'true' : 'false');
    }
    
    if (contentData.preview_seconds) {
      formData.append('preview_seconds', contentData.preview_seconds.toString());
    }
    
    if (contentData.cover_image) {
      formData.append('cover_image', contentData.cover_image);
    }

    const response = await axiosInstance.post(`${getBaseUrl()}/api/accounts/content`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

/**
 * Update content metadata
 */
export const updateContent = async (
  contentId: string, 
  updateData: UpdateContentRequest
): Promise<UpdateContentResponse> => {
  try {
    const response = await axiosInstance.put(`${getBaseUrl()}/api/accounts/content/${contentId}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

/**
 * Delete content permanently
 */
export const deleteContent = async (contentId: string): Promise<DeleteContentResponse> => {
  try {
    const response = await axiosInstance.delete(`${getBaseUrl()}/api/accounts/content/${contentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

/**
 * Publish or unpublish content
 */
export const toggleContentPublication = async (
  contentId: string, 
  isPublished: boolean
): Promise<PublishContentResponse> => {
  try {
    const response = await axiosInstance.patch(`${getBaseUrl()}/api/accounts/content/${contentId}/publish`, {
      is_published: isPublished
    });

    return response.data;
  } catch (error) {
    console.error('Error toggling content publication:', error);
    throw error;
  }
};

/**
 * Get content file size limits based on type
 */
export const getFileSizeLimits = () => {
  return {
    image: 15 * 1024 * 1024, // 15MB
    video: 120 * 1024 * 1024, // 120MB
    audio: 25 * 1024 * 1024, // 25MB
  };
};

/**
 * Get supported file types for each content type
 */
export const getSupportedFileTypes = () => {
  return {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/mov'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
  };
};

/**
 * Validate file for content creation
 */
export const validateContentFile = (file: File): { isValid: boolean; error?: string } => {
  const fileSizeLimits = getFileSizeLimits();
  const supportedTypes = getSupportedFileTypes();
  
  // Check file size minimum
  if (file.size < 100) {
    return { isValid: false, error: 'File is too small (minimum 100 bytes)' };
  }

  // Determine content type from MIME type
  let contentType: ContentType | null = null;
  
  if (supportedTypes.image.includes(file.type)) {
    contentType = 'image';
  } else if (supportedTypes.video.includes(file.type)) {
    contentType = 'video';
  } else if (supportedTypes.audio.includes(file.type)) {
    contentType = 'audio';
  }

  if (!contentType) {
    return { 
      isValid: false, 
      error: 'Unsupported file type. Please upload an image (JPEG, PNG, GIF, WebP), video (MP4, WebM, MOV), or audio (MP3, WAV, OGG, M4A, AAC) file.' 
    };
  }

  // Check file size limits
  if (file.size > fileSizeLimits[contentType]) {
    const limitMB = fileSizeLimits[contentType] / (1024 * 1024);
    return { 
      isValid: false, 
      error: `File too large. ${contentType} files must be under ${limitMB}MB.` 
    };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Validate price
 */
export const validatePrice = (price: number): { isValid: boolean; error?: string } => {
  if (price < 0.50) {
    return { isValid: false, error: 'Minimum price is $0.50' };
  }
  
  if (price > 10000) {
    return { isValid: false, error: 'Maximum price is $10,000.00' };
  }
  
  return { isValid: true };
};

/**
 * Validate cover image for content creation
 */
export const validateCoverImage = (file: File): { isValid: boolean; error?: string } => {
  // Check file type - only images allowed
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!supportedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Cover image must be JPEG, PNG, GIF, or WebP format.' 
    };
  }

  // Check file size - up to 4MB maximum only (no minimum)
  const maxSize = 4 * 1024 * 1024; // 4MB
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Cover image must be under 4MB.' 
    };
  }

  // Optional: Check for very small files (under 1KB) which might be corrupted
  if (file.size < 1024) {
    return { 
      isValid: false, 
      error: 'Cover image file appears to be corrupted or too small.' 
    };
  }

  return { isValid: true };
};
