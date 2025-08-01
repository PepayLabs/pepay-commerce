import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Rating,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  ImageList,
  ImageListItem,
  useMediaQuery,
  useTheme,
  Slide,
  AppBar,
  Toolbar,
  Paper,
  Collapse,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import { Product } from '../types/search.types';
import { useProductDetail } from '../hooks/useProductDetail';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useAddToCart, useRemoveFromCart } from '@/features/cart/hooks/useCart';

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: (product: Product) => void;
}

// Mobile full screen transition
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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

// Collapsible section component for desktop
interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  isMobile?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  isMobile = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // On mobile, always show expanded without toggle
  if (isMobile) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          {title}
        </Typography>
        {children}
      </Box>
    );
  }

  // Desktop collapsible version
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'all 200ms ease',
        '&:hover': {
          borderColor: '#d1d5db',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          backgroundColor: expanded ? '#f9fafb' : '#fff',
          transition: 'background-color 200ms ease',
          '&:hover': {
            backgroundColor: '#f9fafb',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box sx={{ color: '#6b7280' }}>
              {icon}
            </Box>
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  onClose,
  product,
  onAddToCart,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Check if item is in cart
  const findItem = useCartStore((state) => state.findItem);
  const cartItem = product ? findItem(product.productId) : null;
  const isInCart = !!cartItem;
  
  // Cart hooks
  const { mutate: addToCart } = useAddToCart();
  const { mutate: removeFromCart } = useRemoveFromCart();

  // Use the product detail hook
  const { data: productDetail, isLoading, error } = useProductDetail(
    product?.productId || '',
    product?.retailer || 'amazon',
    { enabled: open && !!product }
  );

  useEffect(() => {
    // Reset selected image when product changes
    setSelectedImage(0);
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (isInCart && cartItem) {
      // If item is in cart, remove it
      removeFromCart(cartItem.id);
    } else {
      // If item is not in cart, add it
      if (onAddToCart) {
        onAddToCart(product);
      } else {
        // Fallback to direct add
        addToCart({
          productId: product.productId,
          retailer: product.retailer,
          quantity: 1,
          price: product.price,
          imageUrl: product.image,
          source: 'detail',
          productUrl: product.url,
          title: product.title,
          stars: product.stars,
          numReviews: product.numReviews,
          brand: product.brand,
          categories: product.categories,
        });
      }
    }
  };

  const handleOpenInStore = () => {
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  const images = productDetail?.images || [product.image];
  const currentImage = images[selectedImage] || product.image;

  // Mobile full screen view
  if (isMobile) {
    return (
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative', backgroundColor: '#fff', color: '#000' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Product Details
            </Typography>
          </Toolbar>
        </AppBar>
        
        <DialogContent sx={{ p: 0 }}>
          <ProductDetailContent
            product={product}
            productDetail={productDetail}
            isLoading={isLoading}
            error={error}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            images={images}
            currentImage={currentImage}
            handleAddToCart={handleAddToCart}
            handleOpenInStore={handleOpenInStore}
            isMobile={isMobile}
            isInCart={isInCart}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop modal view
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          maxHeight: '90vh',
          width: '95%',
          maxWidth: '1200px',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <ProductDetailContent
          product={product}
          productDetail={productDetail}
          isLoading={isLoading}
          error={error}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          images={images}
          currentImage={currentImage}
          handleAddToCart={handleAddToCart}
          handleOpenInStore={handleOpenInStore}
          isMobile={isMobile}
          isInCart={isInCart}
        />
      </DialogContent>
    </Dialog>
  );
};

// Separate component for the content to avoid duplication
interface ProductDetailContentProps {
  product: Product;
  productDetail: any;
  isLoading: boolean;
  error: Error | null;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  images: string[];
  currentImage: string;
  handleAddToCart: () => void;
  handleOpenInStore: () => void;
  isMobile: boolean;
  isInCart: boolean;
}

const ProductDetailContent: React.FC<ProductDetailContentProps> = ({
  product,
  productDetail,
  isLoading,
  error,
  selectedImage,
  setSelectedImage,
  images,
  currentImage,
  handleAddToCart,
  handleOpenInStore,
  isMobile,
  isInCart,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
      {/* Left side - Images */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 45%' },
          maxWidth: { md: '600px' }, // Maximum width to prevent squeezing
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#f8f9fa',
          borderRight: { md: '1px solid #e5e7eb' },
        }}
      >
        {/* Main Image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { md: '500px' }, // Constrain max width on desktop
            aspectRatio: '1',
            backgroundColor: '#fff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            mx: 'auto', // Center if smaller than container
          }}
        >
          <img
            src={currentImage}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '24px',
            }}
          />
        </Box>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              maxWidth: { md: '500px' }, // Match main image width
              mx: 'auto', // Center thumbnails
              width: '100%',
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
              },
            }}
          >
            {images.map((img, index) => (
              <Box
                key={index}
                onClick={() => setSelectedImage(index)}
                sx={{
                  minWidth: '60px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage === index ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  transition: 'all 200ms ease',
                  '&:hover': {
                    borderColor: '#2563eb',
                  },
                }}
              >
                <img
                  src={img}
                  alt={`${product.title} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '4px',
                    backgroundColor: '#fff',
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Right side - Details */}
      <Box
        sx={{
          flex: 1,
          minWidth: { md: '400px' }, // Ensure minimum width for content
          p: { xs: 2, md: 3 },
          overflowY: 'auto',
          maxHeight: { md: 'calc(90vh - 64px)' },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#94a3b8',
            },
          },
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load product details. Please try again.
          </Alert>
        )}

        {/* Product Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </Typography>

        {/* Brand */}
        {productDetail?.brand && productDetail.brand.trim() && (
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
            by {productDetail.brand}
          </Typography>
        )}

        {/* Rating and Reviews */}
        {(product.stars || 0) > 0 && (product.numReviews || 0) > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating
                value={product.stars || 0}
                precision={0.1}
                readOnly
                size="small"
                icon={<StarIcon fontSize="inherit" sx={{ color: '#fbbf24' }} />}
                emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#e5e7eb' }} />}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(product.stars || 0).toFixed(1)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {formatReviewCount(product.numReviews || 0)} reviews
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2563eb',
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            {formatPrice(product.price)}
          </Typography>
          {productDetail?.originalPrice && productDetail.originalPrice > 0 && productDetail.originalPrice > product.price && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: 'line-through',
                color: '#9ca3af',
                mt: 0.5,
              }}
            >
              {formatPrice(productDetail.originalPrice)}
            </Typography>
          )}
        </Box>

        {/* Availability */}
        {productDetail?.availability && productDetail.availability !== 'unavailable' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: '20px' }} />
            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
              {productDetail.availability === 'available' ? 'In Stock' : 'Limited Availability'}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={isInCart ? <CheckIcon /> : <ShoppingCartIcon />}
            onClick={handleAddToCart}
            sx={{
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              background: isInCart 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: isInCart 
                ? '0 4px 16px rgba(16,185,129,0.25)'
                : '0 4px 16px rgba(0,140,255,0.25)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'all 200ms ease',
              '&:hover': {
                background: isInCart 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'radial-gradient(circle at 30% 30%, rgba(0,150,255,1), rgba(0,60,140,1))',
                boxShadow: isInCart 
                  ? '0 6px 20px rgba(16,185,129,0.3)'
                  : '0 6px 20px rgba(0,140,255,0.3)',
                transform: isInCart ? 'none' : 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                color: '#fff',
                opacity: 1,
              },
            }}
          >
            {isInCart ? 'Added to Cart' : 'Add to Cart'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenInStore}
            sx={{
              py: 1.5,
              px: 3,
              fontSize: '16px',
              fontWeight: 500,
              textTransform: 'none',
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.04)',
              },
            }}
          >
            View on {product.retailer}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Product Details */}
        {productDetail && (
          <Box sx={{ mt: isMobile ? 0 : 2 }}>
            {/* Key Features */}
            {productDetail.bullets && productDetail.bullets.length > 0 && (
              <CollapsibleSection
                title="Key Features"
                icon={<FeaturedPlayListIcon fontSize="small" />}
                defaultExpanded={true}
                isMobile={isMobile}
              >
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {productDetail.bullets.map((bullet: string, index: number) => (
                    <Box component="li" key={index} sx={{ mb: 1.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#4b5563',
                          lineHeight: 1.6,
                        }}
                      >
                        {bullet}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CollapsibleSection>
            )}

            {/* Description */}
            {productDetail.description && (
              <CollapsibleSection
                title="Description"
                icon={<DescriptionIcon fontSize="small" />}
                defaultExpanded={true}
                isMobile={isMobile}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#4b5563',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {productDetail.description}
                </Typography>
              </CollapsibleSection>
            )}

            {/* Product Information */}
            {productDetail.productDetails && productDetail.productDetails.length > 0 && (
              <CollapsibleSection
                title="Product Information"
                icon={<InfoIcon fontSize="small" />}
                defaultExpanded={false}
                isMobile={isMobile}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {productDetail.productDetails.map((detail: string, index: number) => {
                    // Try to parse key-value pairs
                    const colonIndex = detail.indexOf(':');
                    if (colonIndex > 0) {
                      const key = detail.substring(0, colonIndex).trim();
                      const value = detail.substring(colonIndex + 1).trim();
                      return (
                        <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#6b7280',
                              fontWeight: 500,
                              minWidth: '140px',
                            }}
                          >
                            {key}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4b5563', flex: 1 }}>
                            {value}
                          </Typography>
                        </Box>
                      );
                    }
                    return (
                      <Typography key={index} variant="body2" sx={{ color: '#4b5563' }}>
                        {detail}
                      </Typography>
                    );
                  })}
                </Box>
              </CollapsibleSection>
            )}

            {/* Additional Specifications if available */}
            {(() => {
              if (!productDetail.dimensions) return null;
              
              const hasWeight = productDetail.dimensions.weight?.amount > 0;
              const hasWidth = productDetail.dimensions.size?.width?.amount > 0;
              const hasLength = productDetail.dimensions.size?.length?.amount > 0;
              const hasDepth = productDetail.dimensions.size?.depth?.amount > 0;
              
              const hasAnyDimensions = hasWeight || hasWidth || hasLength || hasDepth;
              
              if (!hasAnyDimensions) return null;
              
              return (
                <CollapsibleSection
                  title="Specifications"
                  icon={<InfoIcon fontSize="small" />}
                  defaultExpanded={false}
                  isMobile={isMobile}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {hasWeight && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                          Weight
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {productDetail.dimensions.weight.amount} {productDetail.dimensions.weight.unit}
                        </Typography>
                      </Box>
                    )}
                    {hasWidth && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                          Width
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {productDetail.dimensions.size.width.amount} {productDetail.dimensions.size.width.unit}
                        </Typography>
                      </Box>
                    )}
                    {hasLength && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                          Length
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {productDetail.dimensions.size.length.amount} {productDetail.dimensions.size.length.unit}
                        </Typography>
                      </Box>
                    )}
                    {hasDepth && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                          Height
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {productDetail.dimensions.size.depth.amount} {productDetail.dimensions.size.depth.unit}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CollapsibleSection>
              );
            })()}

            {/* Additional Details - Check if we have any content to show */}
            {(() => {
              const hasCategories = productDetail.categories && productDetail.categories.length > 0;
              const hasValidEpids = productDetail.epidsMap && Object.keys(productDetail.epidsMap).some(key => productDetail.epidsMap[key]);
              const hasMultipleSellers = productDetail.numOffers && productDetail.numOffers > 1;
              const hasQuestions = !!(productDetail.questionCount && productDetail.questionCount > 0);
              
              const hasAnyAdditionalDetails = hasCategories || hasValidEpids || hasMultipleSellers || hasQuestions;
              
              if (!hasAnyAdditionalDetails) return null;
              
              return (
                <CollapsibleSection
                  title="Additional Details"
                  icon={<InfoIcon fontSize="small" />}
                  defaultExpanded={false}
                  isMobile={isMobile}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Categories */}
                    {hasCategories && (
                      <Box>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                          Categories
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {productDetail.categories.map((category: string, index: number) => (
                            <Chip
                              key={index}
                              label={category}
                              size="small"
                              sx={{
                                backgroundColor: '#f3f4f6',
                                color: '#4b5563',
                                '&:hover': {
                                  backgroundColor: '#e5e7eb',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* EPID/UPC Codes */}
                    {hasValidEpids && (
                      <>
                        {productDetail.epidsMap.UPC && (
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                              UPC
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4b5563' }}>
                              {productDetail.epidsMap.UPC}
                            </Typography>
                          </Box>
                        )}
                        {productDetail.epidsMap.EAN && (
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                              EAN
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4b5563' }}>
                              {productDetail.epidsMap.EAN}
                            </Typography>
                          </Box>
                        )}
                        {productDetail.epidsMap.MPN && (
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                              Model Number
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4b5563' }}>
                              {productDetail.epidsMap.MPN}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}

                    {/* Number of sellers */}
                    {hasMultipleSellers && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                          Available from
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {productDetail.numOffers} sellers
                        </Typography>
                      </Box>
                    )}

                    {/* Questions */}
                    {hasQuestions && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, minWidth: '140px' }}>
                          Customer Questions
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563' }}>
                          {productDetail.questionCount} answered questions
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CollapsibleSection>
              );
            })()}
          </Box>
        )}
      </Box>
    </Box>
  );
};