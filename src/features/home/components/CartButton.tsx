import React from 'react';
import { 
  IconButton, 
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { useNavigate } from '@tanstack/react-router';
import { useCartItemCount } from '@/features/cart/store/cartStore';

interface CartButtonProps {
  onClick?: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cartItemCount = useCartItemCount();

  const handleCartClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate({ to: '/cart' });
    }
  };

  // Styles for the cart button
  const buttonStyles = {
    position: isMobile ? 'relative' : 'fixed' as const,
    top: isMobile ? 'auto' : '20px',
    right: isMobile ? 'auto' : '70px', // 70px to position it left of the auth button
    zIndex: theme.zIndex.appBar + 1,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <IconButton
      onClick={handleCartClick}
      sx={buttonStyles}
      aria-label={`Shopping cart with ${cartItemCount} items`}
    >
      <Badge 
        badgeContent={cartItemCount} 
        showZero={false}
        sx={{
          '& .MuiBadge-badge': {
            background: 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            right: -3,
            top: -3,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 2px 8px rgba(0,140,255,0.25)',
          }
        }}
      >
        <ShoppingCartRoundedIcon sx={{ fontSize: 22, color: '#5f6368' }} />
      </Badge>
    </IconButton>
  );
}