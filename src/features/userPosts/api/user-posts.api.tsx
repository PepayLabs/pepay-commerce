import { axiosInstance } from '@/lib/axios';

export interface PostMedia {
  post_id: string;
  content: string;
  content_length: number;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio';
  video_link_url?: string;
  video_link_platform?: 'youtube' | 'tiktok' | 'x' | 'instagram' | 'vimeo';
  post_tier: 'free' | 'subscriber';
  is_public: boolean;
  is_subscriber_only: boolean;
  is_preview: boolean;
  subscriber_content_type?: 'image' | 'video' | 'audio' | 'text';
  preview_message?: string;
  display_name: string;
  display_link: string;
  published_at: string;
  is_pinned: boolean;
}

export interface AccountInfo {
  display_name: string;
  display_link: string;
  profile_image_url?: string;
  background_text_color?: string;
  background_image_url?: string;
}

export interface PostsPagination {
  limit: number;
  offset: number;
  total_posts: number;
  total_pages: number;
  current_page: number;
  posts_returned: number;
  has_next_page: boolean;
  has_prev_page: boolean;
  next_offset: number | null;
  prev_offset: number | null;
}

export interface PostsResponse {
  account: AccountInfo;
  posts: PostMedia[];
  pagination: PostsPagination;
}

export interface PostsApiParams {
  displayLink: string;
  limit?: number;
  offset?: number;
  tierFilter?: 'free' | 'subscriber' | 'all';
}

export const userPostsApi = {
  /**
   * Fetch public posts for a specific account/profile
   */
  async getPosts(params: PostsApiParams): Promise<PostsResponse> {
    const { displayLink, limit = 7, offset = 0, tierFilter = 'all' } = params;
    console.log('🚀 API CALLED:', new Date().toISOString());
    console.trace('📍 Call stack'); // Shows where the call came from
    
    try {
      const response = await axiosInstance.get(`/api/profiles/${displayLink}/posts`, {
        params: {
          limit,
          offset,
          tierFilter
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  /**
   * Check if more posts are available
   */
  hasMorePosts(pagination: PostsPagination): boolean {
    return pagination.has_next_page;
  },

  /**
   * Get next page parameters
   */
  getNextPageParams(pagination: PostsPagination, currentParams: PostsApiParams): PostsApiParams | null {
    if (!pagination.has_next_page || pagination.next_offset === null) {
      return null;
    }

    return {
      ...currentParams,
      offset: pagination.next_offset
    };
  }
};
