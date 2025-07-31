import { useEffect, useRef } from 'react'
import { ExternalLink, Twitter } from 'lucide-react'

// Add this interface declaration
declare global {
  interface Window {
    twttr?: any;
  }
}

interface XEmbedProps {
  embedUrl: string
  originalUrl: string
  className?: string
}

export const XEmbed: React.FC<XEmbedProps> = ({ 
  embedUrl, 
  originalUrl, 
  className = "" 
}: XEmbedProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Load Twitter widgets script for better rendering
  useEffect(() => {
    // Load Twitter widgets script if not already loaded
    if (!window.twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.head.appendChild(script)
    }
  }, [])

  return (
    <div className={`x-embed-container ${className}`}>
      <div className="relative border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        {/* X/Twitter iframe embed */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          width="100%"
          height="400"
          frameBorder="0"
          scrolling="no"
          allowTransparency
          className="rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
        
        {/* Fallback overlay in case iframe fails */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-center">
            <Twitter className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">X Post</p>
          </div>
        </div>
      </div>
      
      {/* External link */}
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <ExternalLink className="h-3 w-3" />
        <span>X Post</span>
        <a 
          href={originalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          View on X
        </a>
      </div>
    </div>
  )
}