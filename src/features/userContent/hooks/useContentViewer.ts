import { useState, useCallback } from 'react';
import { ContentItem } from '../types/content.types';

interface UseContentViewerReturn {
  isOpen: boolean;
  currentContent: ContentItem | null;
  openContent: (content: ContentItem) => void;
  closeContent: () => void;
  likedContent: Set<string>;
  toggleLike: (contentId: string) => void;
  handleShare: (contentId: string) => void;
  handleDownload: (contentId: string) => void;
}

export function useContentViewer(): UseContentViewerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [likedContent, setLikedContent] = useState<Set<string>>(new Set());

  const openContent = useCallback((content: ContentItem) => {
    setCurrentContent(content);
    setIsOpen(true);
  }, []);

  const closeContent = useCallback(() => {
    setIsOpen(false);
    setCurrentContent(null);
  }, []);

  const toggleLike = useCallback((contentId: string) => {
    setLikedContent(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  }, []);

  const handleShare = useCallback((contentId: string) => {
    if (navigator.share) {
      navigator.share({
        title: currentContent?.title || 'Check out this content',
        text: currentContent?.description || 'Amazing content on GMAS',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  }, [currentContent]);

  const handleDownload = useCallback((contentId: string) => {
    // Only download if user has access and content allows downloads
    if (currentContent?.file_url && currentContent?.has_access) {
      const link = document.createElement('a');
      link.href = currentContent.file_url;
      link.download = currentContent.title || 'content';
      link.click();
    }
  }, [currentContent]);

  return {
    isOpen,
    currentContent,
    openContent,
    closeContent,
    likedContent,
    toggleLike,
    handleShare,
    handleDownload,
  };
} 