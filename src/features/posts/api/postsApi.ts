import { axiosInstance } from '@/lib/axios';

// Update the platform type to include 'x'
export type VideoPlatform = 'youtube' | 'vimeo' | 'twitch' | 'tiktok' | 'x';

// Types for posts (lightweight version from list endpoint)
export interface PostPreview {
  post_id: string;
  content?: string;
  post_tier: 'free' | 'subscriber';
  is_pinned?: boolean;
  is_subscriber_only: boolean;
  display_order?: number;
  view_count?: number;
  created_at: string;
  has_media: boolean;
  media_type?: 'image' | 'video' | 'audio';
  has_video_link: boolean;
  video_link_platform?: VideoPlatform | null;
}

// Full post type (from individual post endpoint)
export interface Post extends PostPreview {
  account_id: string;
  content_raw?: string;         // Original markdown for editing
  content_html?: string;        // Sanitized HTML for display
  content_plain?: string;       // Plain text for previews
  content_length?: number;
  media_url?: string;
  media_filename?: string;
  media_size_bytes?: number;
  media_mime_type?: string;
  media_duration_seconds?: number | null;
  video_link_url?: string;
  video_link_original?: string;
  is_public: boolean;
  is_published: boolean;
  moderation_status?: 'approved' | 'pending' | 'rejected';
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  subscriber_view_count?: number;
  updated_at?: string;
  published_at?: string;
  display_name?: string;
  display_link?: string;
  video_link_platform?: VideoPlatform | null;
}

export interface PostsResponse {
  posts: PostPreview[];
  total?: number;
  has_more?: boolean;
}

export interface CreatePostRequest {
  content?: string;
  media?: File;
  videoLinkUrl?: string;
  requestedTier?: 'free' | 'subscriber';
}

export interface CreatePostResponse {
  message: string;
  post: Post;
  freemium_info: {
    current_free_posts: number;
    remaining_free_slots: number;
    was_upgraded_to_subscriber: boolean;
  };
}

export interface UpdatePostRequest {
  content: string;
}

export interface UpdatePostResponse {
  message: string;
  post: Post;
}

export interface DeletePostResponse {
  message: string;
  post_id: string;
  freemium_info: {
    free_posts_used: number;
    free_posts_remaining: number;
    subscriber_posts: number;
    can_create_free_post: boolean;
  };
}

export interface PinPostResponse {
  message: string;
  pinned_post_id: string;
  unpinned_post_id?: string; // The previously pinned post that was unpinned
}

export interface PromotePostResponse {
  message: string;
  post: Post;
}

export interface DemotePostResponse {
  message: string;
  post: Post;
}

// API base URL configuration
const getBaseUrl = () => {
  return import.meta.env.PROD 
    ? 'https://api.pepay.io'
    : 'http://localhost:3000';
};

// Fetch posts with pagination (lightweight list)
export const fetchPosts = async (
  limit: number = 7,
  offset: number = 0,
  tierFilter: 'all' | 'free' | 'subscriber' = 'all'
): Promise<PostPreview[]> => {
  try {
    const response = await axiosInstance.get(`${getBaseUrl()}/api/accounts/posts`, {
      params: {
        limit,
        offset,
        tierFilter
      }
    });
    
    // The API returns an array directly, not wrapped in an object
    const posts = Array.isArray(response.data) ? response.data : response.data.posts || [];
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Fetch a specific post by ID (for lazy loading full content with media URLs)
export const fetchPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`${getBaseUrl()}/api/accounts/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData: CreatePostRequest): Promise<CreatePostResponse> => {
  try {
    const formData = new FormData();
    
    if (postData.content) {
      formData.append('content', postData.content);
    }
    
    if (postData.media) {
      formData.append('media', postData.media);
    }
    
    if (postData.videoLinkUrl) {
      formData.append('videoLinkUrl', postData.videoLinkUrl);
    }
    
    if (postData.requestedTier) {
      formData.append('requestedTier', postData.requestedTier);
    }

    const response = await axiosInstance.post(`${getBaseUrl()}/api/accounts/posts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update post content
export const updatePost = async (postId: string, updateData: UpdatePostRequest): Promise<UpdatePostResponse> => {
  try {
    const response = await axiosInstance.put(`${getBaseUrl()}/api/accounts/posts/${postId}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<DeletePostResponse> => {
  try {
    const response = await axiosInstance.delete(`${getBaseUrl()}/api/accounts/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Pin/unpin a post (handles the one-pinned-post constraint)
export const togglePostPin = async (postId: string, isPinned: boolean): Promise<PinPostResponse> => {
  try {
    const response = await axiosInstance.patch(`${getBaseUrl()}/api/accounts/posts/${postId}/pin`, {
      is_pinned: isPinned
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling post pin:', error);
    throw error;
  }
};

// Like/unlike a post (assuming this functionality exists)
export const togglePostLike = async (postId: string): Promise<void> => {
  try {
    await axiosInstance.post(`${getBaseUrl()}/api/accounts/posts/${postId}/like`);
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Promote a subscriber post to free public
export const promotePost = async (postId: string): Promise<PromotePostResponse> => {
  try {
    const response = await axiosInstance.patch(`${getBaseUrl()}/api/accounts/posts/${postId}/promote`);
    return response.data;
  } catch (error) {
    console.error('Error promoting post:', error);
    throw error;
  }
};

// Demote a free public post to subscriber-only
export const demotePost = async (postId: string): Promise<DemotePostResponse> => {
  try {
    const response = await axiosInstance.patch(`${getBaseUrl()}/api/accounts/posts/${postId}/demote`);
    return response.data;
  } catch (error) {
    console.error('Error demoting post:', error);
    throw error;
  }
};