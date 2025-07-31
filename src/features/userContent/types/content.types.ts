export interface ContentAccount {
   display_name: string;
   display_link: string;
   profile_image_url: string;
   background_image_url: string | null;
   background_text_color: string;
 }
 
 export interface ContentItem {
   content_id: string;
   account_id?: string;
   title: string;
   description: string;
   short_metadata?: string;
   content_type: 'image' | 'video' | 'audio';
   price: number;
   is_public: boolean;
   is_featured: boolean;
   has_access?: boolean;
   is_purchased?: boolean;
   access_message: string | null;
   access_type?: string;
   file_url: string | null;
   cover_image_url: string;
   file_size_bytes: number;
   file_mime_type?: string;
   preview_seconds: number | null;
   view_count: number;
   purchase_count: number;
   created_at: string;
   updated_at?: string;
   published_at: string;
   account?: ContentAccount;
 }
 
 export interface ContentPagination {
   total_content: number;
   limit: number;
   offset: number;
   has_more: boolean;
   next_offset: number;
 }
 
 export interface ContentResponse {
   account: ContentAccount;
   content: ContentItem[];
   pagination: ContentPagination;
 }

 export interface AccessInfo {
   purchasedContent: number;
   walletAddress: string;
   message: string | null;
 }

 export interface PrivateContentResponse {
   content: ContentItem[];
   pagination: ContentPagination;
   accessInfo: AccessInfo;
   cached: boolean;
 }
 
 export interface ContentFilters {
   content_type?: string;
   limit?: number;
   offset?: number;
   account_id?: string;
   displayLink?: string;
   purchase_status?: 'purchased' | 'free' | 'unpurchased';
 }

 export interface UnifiedContentResponse {
   content: ContentItem[];
   pagination: ContentPagination;
   account?: ContentAccount;
   accessInfo?: AccessInfo;
   cached?: boolean;
   isPrivateResponse: boolean;
 }