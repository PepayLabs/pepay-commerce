import { axiosInstance as axios } from '@/lib/axios'

export interface EmbedData {
  platform: string
  embed_url: string
  original_url: string
  title?: string
  author_name?: string
  thumbnail_url?: string
  width?: number
  height?: number
}

class EmbedService {
  /**
   * Get embed data from backend - backend converts URLs to embeddable format
   */
  static async getEmbedData(url: string): Promise<EmbedData | null> {
    try {
      const response = await axios.post('/api/posts/embed', { url })
      return response.data
    } catch (error) {
      console.error('Failed to get embed data:', error)
      return null
    }
  }

  /**
   * Generate X/Twitter embed URL
   * Converts: https://twitter.com/user/status/123 
   * To: https://platform.twitter.com/embed/index.html?url=https://twitter.com/user/status/123
   */
  static generateXEmbedUrl(originalUrl: string): string {
    const encodedUrl = encodeURIComponent(originalUrl)
    return `https://platform.twitter.com/embed/index.html?url=${encodedUrl}&theme=light&width=550&height=400&dnt=true&hide_thread=false`
  }

  /**
   * Generate YouTube embed URL from various YouTube URL formats
   */
  static generateYouTubeEmbedUrl(originalUrl: string): string {
    let videoId = ''
    
    // Extract video ID from various YouTube URL formats
    if (originalUrl.includes('youtu.be/')) {
      videoId = originalUrl.split('youtu.be/')[1].split('?')[0]
    } else if (originalUrl.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(originalUrl.split('?')[1])
      videoId = urlParams.get('v') || ''
    } else if (originalUrl.includes('youtube.com/embed/')) {
      videoId = originalUrl.split('youtube.com/embed/')[1].split('?')[0]
    }
    
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
  }

  /**
   * Generate Vimeo embed URL
   */
  static generateVimeoEmbedUrl(originalUrl: string): string {
    const videoId = originalUrl.split('vimeo.com/')[1].split('?')[0]
    return `https://player.vimeo.com/video/${videoId}?color=ffffff&title=0&byline=0&portrait=0`
  }

  /**
   * Generate TikTok embed URL
   */
  static generateTikTokEmbedUrl(originalUrl: string): string {
    // TikTok embed format: https://www.tiktok.com/embed/v2/{video_id}
    const videoId = originalUrl.split('/video/')[1]?.split('?')[0]
    return `https://www.tiktok.com/embed/v2/${videoId}`
  }

  /**
   * Generate appropriate embed URL based on platform
   */
  static generateEmbedUrl(platform: string, originalUrl: string): string {
    switch (platform) {
      case 'x':
        return this.generateXEmbedUrl(originalUrl)
      case 'youtube':
        return this.generateYouTubeEmbedUrl(originalUrl)
      case 'vimeo':
        return this.generateVimeoEmbedUrl(originalUrl)
      case 'tiktok':
        return this.generateTikTokEmbedUrl(originalUrl)
      default:
        return originalUrl
    }
  }
}

export default EmbedService