import { axiosInstance } from '@/lib/axios';
import { 
  ModerationStatus, 
  ContentType, 
  formatFileSize, 
  formatPrice 
} from './content.api';

// Package content item interface
export interface PackageContentItem {
  content_id: string;
  title: string;
  content_type: 'image' | 'video' | 'audio';
  price: number;
  display_order: number;
  is_preview: boolean;
}

// Package preview interface (for list views)
export interface PackagePreview {
  package_id: string;
  title: string;
  description?: string;
  short_metadata?: string;
  package_price: number;
  individual_total_price: number;
  discount_percentage: number;
  savings_amount: number;
  is_public: boolean;
  is_featured: boolean;
  is_published: boolean;
  content_count: number;
  total_size_bytes: number;
  total_duration_seconds?: number;
  cover_image_url?: string;
  view_count: number;
  purchase_count: number;
  moderation_status: ModerationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  display_name?: string;
  display_link?: string;
  is_owner: boolean;
  has_access: boolean;
}

// Full package interface (for individual package views)
export interface Package extends PackagePreview {
  account_id: string;
  content_items: PackageContentItem[];
}

// Package list response interface
export interface PackageResponse {
  packages: PackagePreview[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Create package request interface
export interface CreatePackageRequest {
  title: string;
  description?: string;
  short_metadata?: string;
  package_price: number;
  content_ids: string[];
  is_public?: boolean;
  is_featured?: boolean;
  preview_file?: File;
}

// Create package response interface
export interface CreatePackageResponse {
  message: string;
  package: Package;
  content_items: PackageContentItem[];
}

// Update package request interface
export interface UpdatePackageRequest {
  title?: string;
  description?: string;
  short_metadata?: string;
  package_price?: number;
  is_public?: boolean;
  is_featured?: boolean;
  add_content_ids?: string[];
  remove_content_ids?: string[];
}

// Update package response interface
export interface UpdatePackageResponse {
  message: string;
  package: Package;
}

// Delete package response interface
export interface DeletePackageResponse {
  message: string;
  package_id: string;
  title: string;
}

// Publish package request interface
export interface PublishPackageRequest {
  is_published: boolean;
}

// Publish package response interface
export interface PublishPackageResponse {
  message: string;
  package: {
    package_id: string;
    title: string;
    is_published: boolean;
    published_at?: string;
    updated_at: string;
  };
}

// API base URL configuration
const getBaseUrl = () => {
  return import.meta.env.PROD 
    ? 'https://api.pepay.io'
    : 'http://localhost:3000';
};

/**
 * Fetch packages with pagination and filtering
 */
export const fetchPackages = async (
  limit: number = 7,
  offset: number = 0,
  isPublic?: boolean,
  includeUnpublished: boolean = true
): Promise<PackageResponse> => {
  try {
    const params: Record<string, any> = {
      limit,
      offset,
      include_unpublished: includeUnpublished
    };

    if (isPublic !== undefined) {
      params.is_public = isPublic.toString();
    }

    const response = await axiosInstance.get(`${getBaseUrl()}/api/accounts/packages`, {
      params
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

/**
 * Fetch a specific package by ID
 */
export const fetchPackageById = async (packageId: string): Promise<Package> => {
  try {
    const response = await axiosInstance.get(`${getBaseUrl()}/api/accounts/packages/${packageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching package by ID:', error);
    throw error;
  }
};

/**
 * Create new package
 */
export const createPackage = async (packageData: CreatePackageRequest): Promise<CreatePackageResponse> => {
  try {
    const formData = new FormData();
    
    formData.append('title', packageData.title);
    formData.append('package_price', packageData.package_price.toString());
    formData.append('content_ids', JSON.stringify(packageData.content_ids));
    
    if (packageData.description) {
      formData.append('description', packageData.description);
    }
    
    if (packageData.short_metadata) {
      formData.append('short_metadata', packageData.short_metadata);
    }
    
    if (packageData.is_public !== undefined) {
      formData.append('is_public', packageData.is_public.toString());
    }
    
    if (packageData.is_featured !== undefined) {
      formData.append('is_featured', packageData.is_featured.toString());
    }
    
    if (packageData.preview_file) {
      formData.append('preview_file', packageData.preview_file);
    }

    const response = await axiosInstance.post(`${getBaseUrl()}/api/accounts/packages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

/**
 * Update package
 */
export const updatePackage = async (
  packageId: string, 
  updateData: UpdatePackageRequest
): Promise<UpdatePackageResponse> => {
  try {
    const response = await axiosInstance.put(`${getBaseUrl()}/api/accounts/packages/${packageId}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating package:', error);
    throw error;
  }
};

/**
 * Delete package permanently
 */
export const deletePackage = async (packageId: string): Promise<DeletePackageResponse> => {
  try {
    const response = await axiosInstance.delete(`${getBaseUrl()}/api/accounts/packages/${packageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting package:', error);
    throw error;
  }
};

/**
 * Publish or unpublish package
 */
export const togglePackagePublication = async (
  packageId: string, 
  isPublished: boolean
): Promise<PublishPackageResponse> => {
  try {
    const response = await axiosInstance.patch(`${getBaseUrl()}/api/accounts/packages/${packageId}/publish`, {
      is_published: isPublished
    });

    return response.data;
  } catch (error) {
    console.error('Error toggling package publication:', error);
    throw error;
  }
};

/**
 * Get package preview file size limits
 */
export const getPackagePreviewLimits = () => {
  return {
    image: 10 * 1024 * 1024, // 10MB
    video: 30 * 1024 * 1024, // 30MB
  };
};

/**
 * Get supported preview file types for packages
 */
export const getSupportedPreviewTypes = () => {
  return {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm'],
  };
};

/**
 * Validate preview file for package creation
 */
export const validatePackagePreviewFile = (file: File): { isValid: boolean; error?: string } => {
  const fileSizeLimits = getPackagePreviewLimits();
  const supportedTypes = getSupportedPreviewTypes();
  
  // Check file size minimum
  if (file.size < 100) {
    return { isValid: false, error: 'File is too small (minimum 100 bytes)' };
  }

  // Determine content type from MIME type
  let isValidType = false;
  let maxSize = 0;
  
  if (supportedTypes.image.includes(file.type)) {
    isValidType = true;
    maxSize = fileSizeLimits.image;
  } else if (supportedTypes.video.includes(file.type)) {
    isValidType = true;
    maxSize = fileSizeLimits.video;
  }

  if (!isValidType) {
    return { 
      isValid: false, 
      error: 'Unsupported preview file type. Please upload a JPEG, PNG, GIF, WebP image or MP4, WebM video.' 
    };
  }

  // Check file size limits
  if (file.size > maxSize) {
    const limitMB = maxSize / (1024 * 1024);
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    return { 
      isValid: false, 
      error: `Preview file too large. ${fileType} files must be under ${limitMB}MB.` 
    };
  }

  return { isValid: true };
};

/**
 * Validate package price
 */
export const validatePackagePrice = (price: number): { isValid: boolean; error?: string } => {
  if (price < 1.00) {
    return { isValid: false, error: 'Minimum package price is $1.00' };
  }
  
  if (price > 50000) {
    return { isValid: false, error: 'Maximum package price is $50,000.00' };
  }
  
  return { isValid: true };
};

/**
 * Calculate package savings and discount
 */
export const calculatePackageValue = (packagePrice: number, individualTotal: number) => {
  // Ensure both values are numbers
  const numPackagePrice = Number(packagePrice) || 0;
  const numIndividualTotal = Number(individualTotal) || 0;
  
  const savings = Math.max(0, numIndividualTotal - numPackagePrice);
  const discountPercentage = numIndividualTotal > 0 ? (savings / numIndividualTotal) * 100 : 0;
  
  return {
    savings_amount: parseFloat(savings.toFixed(2)),
    discount_percentage: parseFloat(discountPercentage.toFixed(2)),
    individual_total_price: parseFloat(numIndividualTotal.toFixed(2))
  };
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Re-export shared utilities from content.api
export { formatPrice, formatFileSize } from './content.api';