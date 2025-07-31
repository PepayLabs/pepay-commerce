import React, { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface NavigationWrapperProps {
  to: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Simple wrapper that makes content clickable with TanStack Router
 * Avoids nested anchor tag issues
 */
export default function NavigationWrapper({
  to,
  children,
  style,
  className,
  ...props
}: NavigationWrapperProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if user clicked a button or link inside
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }

    navigate({ to });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
} 