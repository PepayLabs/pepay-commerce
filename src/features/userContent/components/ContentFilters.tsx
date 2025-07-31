import React from 'react';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PublicIcon from '@mui/icons-material/Public';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ContentFiltersProps {
  selectedFilter: string | null;
  selectedPurchaseStatus: string | null;
  onFilterChange: (filter: string | null) => void;
  onPurchaseStatusChange: (status: string | null) => void;
  contentCounts?: {
    total: number;
    image: number;
    video: number;
    audio: number;
  };
  purchaseStatusCounts?: {
    purchased: number;
    free: number;
    unpurchased: number;
  };
  textColor?: string;
  uiBackgroundColor?: string;
  uiBorderColor?: string;
  isAuthenticated?: boolean;
}

const contentTypeFilters = [
  { key: null, label: 'All', icon: <ViewModuleIcon /> },
  { key: 'video', label: 'Videos', icon: <VideoLibraryIcon /> },
  { key: 'image', label: 'Images', icon: <ImageIcon /> },
  { key: 'audio', label: 'Audio', icon: <AudiotrackIcon /> },
];

// Purchase status filters for authenticated users (server-side filtering)
const authenticatedPurchaseFilters = [
  { key: 'purchased', label: 'Purchased', icon: <CheckCircleIcon /> },
  { key: 'free', label: 'Free', icon: <PublicIcon /> },
  { key: 'unpurchased', label: 'Shop', icon: <ShoppingCartIcon /> },
];

// Purchase status filters for unauthenticated users (client-side filtering)
const unauthenticatedPurchaseFilters = [
  { key: 'free', label: 'Free', icon: <PublicIcon /> },
  { key: 'unpurchased', label: 'Shop', icon: <ShoppingCartIcon /> },
];

export default function ContentFilters({
  selectedFilter,
  selectedPurchaseStatus,
  onFilterChange,
  onPurchaseStatusChange,
  contentCounts,
  purchaseStatusCounts,
  textColor,
  uiBackgroundColor,
  uiBorderColor,
  isAuthenticated = false,
}: ContentFiltersProps) {
  const theme = useTheme();

  const getContentTypeCount = (filterKey: string | null): number => {
    if (!contentCounts) return 0;
    if (filterKey === null) return contentCounts.total;
    return contentCounts[filterKey as keyof typeof contentCounts] || 0;
  };

  const getPurchaseStatusCount = (statusKey: string | null): number => {
    if (!purchaseStatusCounts) return 0;
    return purchaseStatusCounts[statusKey as keyof typeof purchaseStatusCounts] || 0;
  };

  // Smart color calculation based on ProfilePage patterns
  const getChipStyles = (isSelected: boolean) => {
    if (isSelected) {
      // For selected state, use glassmorphism with proper contrast
      return {
        background: `linear-gradient(156.52deg, ${textColor || theme.palette.primary.main}25 2.12%, ${textColor || theme.palette.primary.main}40 54.33%, ${textColor || theme.palette.primary.main}25 93.02%)`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `2px solid ${textColor || theme.palette.primary.main}`,
        color: textColor || theme.palette.primary.main,
        fontWeight: 700,
        '& .MuiChip-icon': {
          color: textColor || theme.palette.primary.main,
        },
      };
    } else {
      // For unselected state, use subtle glassmorphism
      return {
        background: uiBackgroundColor || 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.1)'}`,
        color: textColor ? `${textColor}CC` : theme.palette.text.secondary,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: textColor ? `${textColor}80` : theme.palette.text.secondary,
        },
      };
    }
  };

  const renderChip = (filter: any, isPurchaseStatus: boolean = false) => {
    const count = isPurchaseStatus 
      ? getPurchaseStatusCount(filter.key)
      : getContentTypeCount(filter.key);
    
    const isSelected = isPurchaseStatus 
      ? selectedPurchaseStatus === filter.key
      : selectedFilter === filter.key;

    const handleClick = isPurchaseStatus
      ? () => onPurchaseStatusChange(filter.key)
      : () => onFilterChange(filter.key);

    const chipStyles = getChipStyles(isSelected);

    return (
      <Chip
        key={`${isPurchaseStatus ? 'purchase' : 'type'}-${filter.key || 'all'}`}
        icon={filter.icon}
        label={`${filter.label} ${count > 0 ? `(${count})` : ''}`}
        onClick={handleClick}
        variant="outlined"
        sx={{
          ...chipStyles,
          flexShrink: 0,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${textColor || theme.palette.primary.main}20`,
            background: isSelected
              ? `linear-gradient(156.52deg, ${textColor || theme.palette.primary.main}35 2.12%, ${textColor || theme.palette.primary.main}50 54.33%, ${textColor || theme.palette.primary.main}35 93.02%)`
              : `linear-gradient(156.52deg, ${textColor || theme.palette.primary.main}15 2.12%, ${textColor || theme.palette.primary.main}25 54.33%, ${textColor || theme.palette.primary.main}15 93.02%)`,
          },
        }}
      />
    );
  };

  // Choose the appropriate purchase filters based on authentication status
  const purchaseStatusFilters = isAuthenticated 
    ? authenticatedPurchaseFilters 
    : unauthenticatedPurchaseFilters;

  return (
    <Box 
      sx={{ 
        mb: 3,
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar': {
          height: 6,
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: textColor ? `${textColor}30` : 'rgba(255, 255, 255, 0.3)',
          borderRadius: 3,
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: textColor ? `${textColor}50` : 'rgba(255, 255, 255, 0.5)',
        },
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1.5,
          minWidth: 'fit-content',
          pb: 1,
        }}
      >
        {/* Content Type Filters */}
        {contentTypeFilters.map((filter) => renderChip(filter, false))}
        
        {/* Purchase Status Filters - Show for both authenticated and unauthenticated users */}
        {purchaseStatusFilters.map((filter) => renderChip(filter, true))}
      </Box>
    </Box>
  );
}