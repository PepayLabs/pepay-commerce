import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  Container,
} from '@mui/material';
import { Product } from '../types/search.types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface SearchResultsProps {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  totalResults: number;
  currentPage: number;
  searchQuery: string;
  onLoadMore: () => void;
  onRetry: () => void;
  onProductClick?: (product: Product) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  totalResults,
  currentPage,
  searchQuery,
  onLoadMore,
  onRetry,
  onProductClick,
}) => {
  // Show loading skeletons
  if (isLoading && products.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
            Searching for "{searchQuery}"
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Finding the best products for you...
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)',
            },
            gap: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          {[...Array(8)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Fade in timeout={500}>
          <Box>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
              {error.message || 'We encountered an error while searching. Please try again.'}
            </Typography>
            <Button
              variant="contained"
              onClick={onRetry}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: '24px',
              }}
            >
              Try Again
            </Button>
          </Box>
        </Fade>
      </Container>
    );
  }

  // Show empty state
  if (!isLoading && products.length === 0 && searchQuery) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Fade in timeout={500}>
          <Box>
            <SearchOffIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1, color: '#374151', fontWeight: 600 }}>
              No results found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
              We couldn't find any products matching "{searchQuery}". Try adjusting your search.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Suggestions:
              </Typography>
              <ul style={{ textAlign: 'left', color: '#6b7280', fontSize: '14px' }}>
                <li>Check your spelling</li>
                <li>Try more general keywords</li>
                <li>Try different search terms</li>
              </ul>
            </Box>
          </Box>
        </Fade>
      </Container>
    );
  }

  // Show results
  if (products.length > 0) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Results header */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                color: '#374151',
                fontWeight: 600,
                fontSize: { xs: '1.5rem', md: '1.875rem' },
              }}
            >
              {searchQuery ? `Results for "${searchQuery}"` : 'Search Results'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {totalResults > 0
                ? `Found ${totalResults.toLocaleString()} products`
                : `Showing ${products.length} products`}
            </Typography>
          </Box>
        </Fade>

        {/* Optimized Responsive Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr', // Mobile: 1 column
              sm: 'repeat(2, 1fr)', // Tablet: 2 columns
              md: 'repeat(3, 1fr)', // Desktop: 3 columns
              lg: 'repeat(3, 1fr)', // Large: 3 columns
              xl: 'repeat(4, 1fr)', // Extra large: 4 columns
            },
            gap: {
              xs: 2, // Mobile: smaller gap
              sm: 2.5,
              md: 3, // Desktop: larger gap
            },
            '& > *': {
              // Ensure all items have consistent height
              height: '100%',
            },
          }}
        >
          {products.map((product, index) => (
            <Zoom 
              key={product.productId}
              in 
              timeout={300 + index * 30} 
              style={{ 
                transitionDelay: `${Math.min(index * 30, 500)}ms` // Cap delay at 500ms
              }}
            >
              <Box>
                <ProductCard
                  product={product}
                  onClick={() => onProductClick?.(product)}
                />
              </Box>
            </Zoom>
          ))}
        </Box>

        {/* Load more button */}
        {hasMore && (
          <Fade in timeout={500}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                sx={{
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  px: 4,
                  py: 1.5,
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                  minWidth: '200px',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                  '&:disabled': {
                    borderColor: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
              >
                {isLoadingMore ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading more...
                  </>
                ) : (
                  `Load More (Page ${currentPage + 1})`
                )}
              </Button>
            </Box>
          </Fade>
        )}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)',
                },
                gap: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
              }}
            >
              {[...Array(4)].map((_, index) => (
                <ProductCardSkeleton key={`loading-${index}`} />
              ))}
            </Box>
          </Box>
        )}

        {/* Error on load more */}
        {error && products.length > 0 && (
          <Fade in timeout={500}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
              sx={{ mt: 4 }}
            >
              Failed to load more products. Please try again.
            </Alert>
          </Fade>
        )}
      </Container>
    );
  }

  return null;
};