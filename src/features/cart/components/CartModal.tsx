import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Divider,
  Slide,
  useMediaQuery,
  useTheme,
  Fade,
  Skeleton,
  Alert,
  Chip,
  SwipeableDrawer,
  Tooltip,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useCartStore, useCartItemCount } from '../store/cartStore';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '../hooks/useCart';
import { CartItem } from '../types/cart.types';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

// Mobile slide up transition
const SlideTransition = React.forwardRef(function Transition(
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

// Cart item component
interface CartItemComponentProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({
  item,
  onQuantityChange,
  onRemove,
  isUpdating = false,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        borderRadius: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e5e7eb',
        position: 'relative',
        opacity: isUpdating ? 0.6 : 1,
        transition: 'all 200ms ease',
        '&:hover': {
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
        },
      }}
    >
      {/* Product Image */}
      <Box
        sx={{
          width: 80,
          height: 80,
          flexShrink: 0,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '8px',
            }}
          />
        ) : (
          <ShoppingCartIcon sx={{ color: '#d1d5db', fontSize: 32 }} />
        )}
      </Box>

      {/* Product Details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: '#1f2937',
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            color: '#6b7280',
            textTransform: 'capitalize',
            display: 'block',
            mb: 1,
          }}
        >
          from {item.retailer}
        </Typography>

        {/* Price and Quantity Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: '#2563eb',
            }}
          >
            {formatPrice(item.price)}
          </Typography>

          {/* Quantity Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              px: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => {
                if (item.quantity === 1) {
                  onRemove(); // Remove item when quantity is 1
                } else {
                  onQuantityChange(item.quantity - 1);
                }
              }}
              disabled={isUpdating}
              sx={{
                padding: '4px',
                color: item.quantity === 1 ? '#ef4444' : '#6b7280',
                '&:hover': {
                  backgroundColor: item.quantity === 1 ? 'rgba(239, 68, 68, 0.04)' : 'rgba(37, 99, 235, 0.04)',
                  color: item.quantity === 1 ? '#dc2626' : '#2563eb',
                },
              }}
            >
              <RemoveIcon sx={{ fontSize: 18 }} />
            </IconButton>
            
            <Typography
              variant="body2"
              sx={{
                minWidth: '24px',
                textAlign: 'center',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {item.quantity}
            </Typography>
            
            <IconButton
              size="small"
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              sx={{
                padding: '4px',
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  color: '#2563eb',
                },
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Remove Button */}
      <Tooltip title="Remove from cart" placement="left">
        <IconButton
          size="small"
          onClick={onRemove}
          disabled={isUpdating}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '6px',
            color: '#6b7280',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e5e7eb',
            transition: 'all 200ms ease',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderColor: '#fecaca',
              color: '#dc2626',
              transform: 'scale(1.05)',
            },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// Empty cart component
const EmptyCart: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 4,
      textAlign: 'center',
    }}
  >
    <ShoppingCartIcon
      sx={{
        fontSize: 64,
        color: '#e5e7eb',
        mb: 2,
      }}
    />
    <Typography
      variant="h6"
      sx={{
        fontWeight: 600,
        color: '#1f2937',
        mb: 1,
      }}
    >
      Your cart is empty
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: '#6b7280',
        maxWidth: '280px',
      }}
    >
      Add items to your cart to see them here
    </Typography>
  </Box>
);

export const CartModal: React.FC<CartModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalQuantity = useCartStore((state) => state.totalQuantity);
  
  const { refetch } = useCart();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();
  
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity === item.quantity) return;
    
    setUpdatingItems(prev => new Set(prev).add(item.id));
    updateItem(
      { itemId: item.id, quantity: newQuantity },
      {
        onSettled: () => {
          setUpdatingItems(prev => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        },
      }
    );
  };

  const handleRemoveItem = (item: CartItem) => {
    setUpdatingItems(prev => new Set(prev).add(item.id));
    removeItem(item.id, {
      onSettled: () => {
        setUpdatingItems(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      },
    });
  };

  const cartContent = (
    <>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon sx={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Shopping Cart
          </Typography>
          {totalQuantity > 0 && (
            <Chip
              label={`${totalQuantity} item${totalQuantity !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Cart Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
          },
        }}
      >
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item) => (
              <Fade key={item.id} in timeout={300}>
                <Box>
                  <CartItemComponent
                    item={item}
                    onQuantityChange={(quantity) => handleQuantityChange(item, quantity)}
                    onRemove={() => handleRemoveItem(item)}
                    isUpdating={updatingItems.has(item.id)}
                  />
                </Box>
              </Fade>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {items.length > 0 && (
        <Box>
          <Divider />
          
          {/* Free Shipping Info */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#f0fdf4',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingOutlinedIcon sx={{ color: '#10b981', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#047857', fontWeight: 500 }}>
                Free shipping on orders over $35
              </Typography>
            </Box>
          </Box>

          {/* Subtotal and Actions */}
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Subtotal
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#2563eb',
                }}
              >
                {formatPrice(subtotal)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled
              sx={{
                py: 1.5,
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                background: 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 20px rgba(0,140,255,0.25)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                '&.Mui-disabled': {
                  opacity: 0.7,
                  color: '#fff',
                  background: 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
                },
              }}
            >
              Checkout Coming Soon
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={onClose}
              sx={{
                mt: 1,
                textTransform: 'none',
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      )}
    </>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {cartContent}
      </SwipeableDrawer>
    );
  }

  // Desktop modal
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {cartContent}
    </Dialog>
  );
};