import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Product } from '../types/search.types';
import { useCartStore } from '@/features/cart/store/cartStore';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onDetailClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

// Utility function to truncate long titles intelligently
const truncateTitle = (title: string, maxLength: number = 60): string => {
  if (title.length <= maxLength) return title;
  
  // Try to break at a word boundary
  const truncated = title.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

// Format price with proper currency
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Format review count
const formatReviewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onDetailClick, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const findItem = useCartStore((state) => state.findItem);
  const isInCart = !!findItem(product.productId);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDetailClick) {
      onDetailClick(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: { xs: '12px', sm: '16px' },
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px -10px rgba(37, 99, 235, 0.2)',
          borderColor: 'rgba(37, 99, 235, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          '& .product-image': {
            transform: 'scale(1.05)',
          },
          '& .product-overlay': {
            opacity: 1,
          },
        },
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: 'relative',
          paddingTop: '100%', // 1:1 Aspect Ratio
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
        }}
      >
        <CardMedia
          component="img"
          image={product.image}
          alt={product.title}
          className="product-image"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '16px',
            transition: 'transform 300ms ease',
          }}
        />
        
        {/* Overlay with quick action */}
        <Box
          className="product-overlay"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: 0,
            transition: 'opacity 200ms ease',
          }}
        >
          <Tooltip title="View on Amazon">
            <IconButton
              size="small"
              onClick={handleLinkClick}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  backgroundColor: '#fff',
                },
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Fresh badge if applicable */}
        {product.fresh && (
          <Chip
            label="Fresh"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#10b981',
              color: '#fff',
              fontWeight: 600,
              fontSize: '12px',
            }}
          />
        )}
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.5, sm: 1 },
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Title */}
        <Tooltip title={product.title} placement="top" enterDelay={500}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 500,
              fontSize: { xs: '14px', sm: '15px' },
              lineHeight: 1.4,
              color: '#1f2937',
              minHeight: { xs: '38px', sm: '42px' },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.title}
          </Typography>
        </Tooltip>

        {/* Price */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '18px', sm: '20px' },
            color: '#2563eb',
            letterSpacing: '-0.02em',
          }}
        >
          {formatPrice(product.price)}
        </Typography>

        {/* Rating and Reviews */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 'auto',
          }}
        >
          <Rating
            value={product.stars || 0}
            precision={0.1}
            readOnly
            size="small"
            icon={<StarIcon fontSize="inherit" sx={{ color: '#fbbf24' }} />}
            emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#e5e7eb' }} />}
          />
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '13px',
            }}
          >
            {(product.stars || 0).toFixed(1)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#9ca3af',
              fontSize: '13px',
            }}
          >
            ({formatReviewCount(product.numReviews || 0)})
          </Typography>
        </Box>

        {/* Bottom Actions Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            gap: 1,
          }}
        >
          {/* Retailer with Link */}
          <Box
            onClick={handleLinkClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              '&:hover': {
                color: '#2563eb',
                '& .retailer-text': {
                  color: '#2563eb',
                },
              },
            }}
          >
            <Typography
              variant="caption"
              className="retailer-text"
              sx={{
                color: '#9ca3af',
                fontSize: '12px',
                textTransform: 'capitalize',
                transition: 'color 200ms ease',
              }}
            >
              from {product.retailer}
            </Typography>
            <OpenInNewIcon 
              sx={{ 
                fontSize: '14px', 
                color: isHovered ? '#2563eb' : '#9ca3af',
                transition: 'all 200ms ease',
              }} 
            />
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            {/* Detail View Button */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={handleDetailClick}
                sx={{
                  padding: '4px',
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                  },
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="small"
              startIcon={isInCart ? <CheckIcon sx={{ fontSize: '16px' }} /> : <ShoppingCartIcon sx={{ fontSize: '16px' }} />}
              onClick={handleAddToCart}
              sx={{
                fontSize: '12px',
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                textTransform: 'none',
                background: isInCart 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: isInCart ? '0 2px 8px rgba(16,185,129,0.2)' : '0 2px 8px rgba(0,140,255,0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 200ms ease',
                '&:hover': {
                  background: isInCart 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'radial-gradient(circle at 30% 30%, rgba(0,150,255,1), rgba(0,60,140,1))',
                  boxShadow: isInCart ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(0,140,255,0.3)',
                  transform: isInCart ? 'none' : 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  color: '#fff',
                  opacity: 1,
                },
              }}
            >
              {isInCart ? 'Added' : 'Add'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Loading skeleton component
export const ProductCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{
          paddingTop: '100%',
          width: '100%',
        }}
      />
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={24} width="60%" sx={{ mb: 2 }} />
        <Skeleton variant="text" height={32} width="40%" sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Skeleton variant="rectangular" width={80} height={16} />
          <Skeleton variant="text" width={60} height={16} />
        </Box>
      </CardContent>
    </Card>
  );
};