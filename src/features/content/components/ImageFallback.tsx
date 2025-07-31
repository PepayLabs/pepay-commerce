import React from 'react';
import { ImageIcon, Play, Volume2, FileType, Package } from 'lucide-react';

interface ImageFallbackProps {
  contentType: string;
  title: string;
  className?: string;
  isLarge?: boolean;
}

export const ImageFallback: React.FC<ImageFallbackProps> = ({ 
  contentType, 
  title, 
  className = "", 
  isLarge = false 
}) => {
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'image':
        return {
          icon: <ImageIcon className={isLarge ? "h-12 w-12" : "h-8 w-8"} />,
          gradient: "from-blue-500 to-blue-600",
          bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40",
          label: "Image Content"
        };
      case 'video':
        return {
          icon: <Play className={isLarge ? "h-12 w-12" : "h-8 w-8"} />,
          gradient: "from-purple-500 to-purple-600", 
          bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40",
          label: "Video Content"
        };
      case 'audio':
        return {
          icon: <Volume2 className={isLarge ? "h-12 w-12" : "h-8 w-8"} />,
          gradient: "from-green-500 to-green-600",
          bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40",
          label: "Audio Content"
        };
      case 'package':
        return {
          icon: <Package className={isLarge ? "h-12 w-12" : "h-8 w-8"} />,
          gradient: "from-orange-500 to-red-600",
          bgColor: "bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/40",
          label: "Content Package"
        };
      default:
        return {
          icon: <FileType className={isLarge ? "h-12 w-12" : "h-8 w-8"} />,
          gradient: "from-gray-500 to-gray-600",
          bgColor: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/40",
          label: "Content"
        };
    }
  };

  const { icon, gradient, bgColor, label } = getIconAndColor(contentType);

  return (
    <div className={`${bgColor} ${className} flex flex-col items-center justify-center rounded-lg border border-gray-200/50 dark:border-gray-700/50`}>
      <div className={`bg-gradient-to-r ${gradient} text-white rounded-lg p-3 mb-2 shadow-lg`}>
        {icon}
      </div>
      <div className="text-center px-2">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
          {title}
        </p>
      </div>
    </div>
  );
};