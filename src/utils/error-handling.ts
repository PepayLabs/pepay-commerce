import { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

// Type definitions for the detailed error response
export interface DetailedApiError {
  error: string;
  error_code: string;
  details?: string[];
  markdown_guide?: {
    bold: string;
    italic: string;
    strikethrough: string;
    heading1: string;
    heading2: string;
    heading3: string;
    link: string;
    list: string;
    numberedList: string;
    quote: string;
    code: string;
    codeBlock: string;
  };
  message?: string;
}

export interface EnhancedErrorToastOptions {
  title?: string;
  fallbackMessage?: string;
  showMarkdownGuide?: boolean;
}

/**
 * Enhanced error handler that extracts detailed error information
 * and displays it in a user-friendly toast
 */
export const handleDetailedError = (
  error: unknown,
  options: EnhancedErrorToastOptions = {}
) => {
  const {
    title = "Operation Failed",
    fallbackMessage = "An unexpected error occurred. Please try again.",
    showMarkdownGuide = true
  } = options;

  console.error('Detailed error:', error);

  // Check if it's an Axios error with detailed response
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as DetailedApiError;
    
    // Handle detailed validation errors
    if (errorData.error_code === 'INVALID_CONTENT' || errorData.details) {
      return showValidationErrorToast(errorData, title, showMarkdownGuide);
    }
    
    // Handle other detailed errors
    if (errorData.error || errorData.message) {
      return toast({
        title,
        description: errorData.error || errorData.message,
        variant: "destructive",
      });
    }
  }

  // Fallback for other error types
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   fallbackMessage;
                   
    return toast({
      title,
      description: message,
      variant: "destructive",
    });
  }

  if (error instanceof Error) {
    return toast({
      title,
      description: error.message || fallbackMessage,
      variant: "destructive",
    });
  }

  // Ultimate fallback
  return toast({
    title,
    description: fallbackMessage,
    variant: "destructive",
  });
};

/**
 * Shows a detailed validation error toast with formatting guidance
 */
const showValidationErrorToast = (
  errorData: DetailedApiError,
  title: string,
  showMarkdownGuide: boolean
) => {
  // Create detailed description
  let description = errorData.error || "Content validation failed";
  
  // Add specific error details
  if (errorData.details && errorData.details.length > 0) {
    description += `\n\nIssues found:\n${errorData.details.map(detail => `• ${detail}`).join('\n')}`;
  }

  // Add markdown formatting guide if available and requested
  if (showMarkdownGuide && errorData.markdown_guide) {
    description += "\n\n📝 Formatting Guide:";
    description += `\n• Bold: ${errorData.markdown_guide.bold}`;
    description += `\n• Italic: ${errorData.markdown_guide.italic}`;
    description += `\n• Links: ${errorData.markdown_guide.link}`;
    description += `\n• Lists: ${errorData.markdown_guide.list}`;
  }

  return toast({
    title: `${title} - Validation Error`,
    description,
    variant: "destructive",
    // Make validation errors stay longer so users can read the formatting guide
    duration: 10000,
  });
};

/**
 * Specific handler for post creation/update errors
 */
export const handlePostError = (error: unknown, operation: 'create' | 'update' = 'create') => {
  const titles = {
    create: "Failed to Create Post",
    update: "Failed to Update Post"
  };

  const fallbacks = {
    create: "An error occurred while creating your post. Please check your content and try again.",
    update: "An error occurred while updating your post. Please check your content and try again."
  };

  return handleDetailedError(error, {
    title: titles[operation],
    fallbackMessage: fallbacks[operation],
    showMarkdownGuide: true
  });
};

/**
 * Extract detailed error message for logging or custom handling
 */
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const errorData = error.response.data as DetailedApiError;
    return errorData.error || errorData.message || error.message || 'Unknown error';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Unknown error occurred';
};
