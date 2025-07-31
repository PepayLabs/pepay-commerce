import axios from 'axios';

// Configure axios base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://api.pepay.io';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'accept': 'application/json',
  },
});

// Raw API response interface (matches the actual API schema)
interface RawInfluencer {
  accountId: string;
  displayName: string;
  profileImageUrl: string;
  shortBio: string;
  displayLink: string;
  profileUrl: string;
  isVerified: boolean;
  totalDonations: number;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    telegram?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
}

// Processed interface (what the component expects)
export interface TopInfluencer {
  accountId: string;
  displayName: string;
  profileImageUrl: string;
  shortBio: string;
  displayLink: string;
  profileUrl: string;
  isVerified: boolean;
  totalDonations: number;
  // Flattened social links for easier component usage
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
}

export interface TopInfluencersResponse {
  success: boolean;
  data: RawInfluencer[];
}

// Transform raw API response to component-friendly format
const transformInfluencer = (raw: RawInfluencer): TopInfluencer => {
  return {
    accountId: raw.accountId,
    displayName: raw.displayName,
    profileImageUrl: raw.profileImageUrl,
    shortBio: raw.shortBio,
    displayLink: raw.displayLink,
    profileUrl: raw.profileUrl,
    isVerified: raw.isVerified,
    totalDonations: raw.totalDonations,
    // Flatten social media links
    twitterUrl: raw.socialMedia?.twitter,
    instagramUrl: raw.socialMedia?.instagram,
    youtubeUrl: raw.socialMedia?.youtube,
    tiktokUrl: raw.socialMedia?.tiktok,
    telegramUrl: raw.socialMedia?.telegram,
    websiteUrl: raw.socialMedia?.website,
  };
};

export const getTopInfluencers = async (): Promise<TopInfluencer[]> => {
  try {
    const response = await api.get<TopInfluencersResponse>('/api/profiles/top?type=influencer');
    
    if (response.data.success) {
      // Transform and limit to reasonable number for rotation
      const transformedData = response.data.data.map(transformInfluencer);
      return transformedData.slice(0, 10); // Increased limit for better rotation
    } else {
      throw new Error('Failed to fetch top influencers');
    }
  } catch (error) {
    console.error('Error fetching top influencers:', error);
    // Return empty array on error to prevent breaking the UI
    return [];
  }
};
