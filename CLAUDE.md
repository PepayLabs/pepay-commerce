# PepayCommerce - Technical Architecture Guide

## Project Overview

PepayCommerce is a modern Web3 e-commerce platform enabling content creators, influencers, and merchants to monetize their digital presence through blockchain-powered payments, subscriptions, and content sales.

## Tech Stack

### Core Technologies
- **Frontend Framework**: React 19 with TypeScript 5.7
- **Build Tool**: Vite 6.0 with SWC for optimal performance
- **Routing**: TanStack Router v1 (file-based routing)
- **State Management**: Zustand 5.0 + TanStack Query 5.80
- **Styling**: Tailwind CSS 3.4 + Radix UI primitives
- **Web3**: Wagmi 2.15 + Viem 2.31 + Reown AppKit

### Development Experience
- **Code Quality**: ESLint 9 + Prettier with import sorting
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Library**: Custom UI components built on Radix UI
- **Hot Module Replacement**: Vite HMR for instant feedback

### Design Princips
- **Design Quality**: Google or Apple level top designer in the world
- **Commerce**: Remember to Optomize for a shopping experience 
- **Hints of Glassmorphism**: Hints of apple glassmorphic UI 
- **User Experience**: Intuitive User Experience not overcomplicated. Work with Clarity

## Architecture Principles

### 1. Feature-First Organization
```
src/features/
├── auth/           # Authentication flows
├── profiles/       # User profiles & monetization
├── content/        # Digital content management
├── payments/       # Payment processing
└── purchaseModal/  # Content purchase flows
```

### 2. Type-Safe Routing
- File-based routing with TanStack Router
- Type-safe route parameters and search params
- Protected routes with authentication guards

### 3. Smart Component Architecture
- **UI Components**: Reusable primitives in `src/components/ui/`
- **Feature Components**: Business logic in `src/features/*/components/`
- **Composition Pattern**: Flexible component composition over inheritance

### 4. State Management Strategy
- **Server State**: TanStack Query for API data
- **Client State**: Zustand for auth and UI state
- **Form State**: React Hook Form with Zod validation

## Key Technical Patterns

### Authentication Flow
- JWT-based authentication with cookie storage
- Automatic token refresh and session management
- Protected route middleware with redirect support

### API Integration
```typescript
// Centralized error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 10_000 },
    mutations: { onError: handleServerError }
  }
});
```

### Web3 Integration
- Multi-chain support via Wagmi
- Wallet connection with Reown AppKit
- Smart contract interactions for payments

### Performance Optimizations
- Code splitting with lazy routes
- Image optimization and lazy loading
- Bundle size monitoring with Knip

## Development Workflow

### Quick Start
```bash
npm install      # Install dependencies
npm run dev      # Start dev server on port 3002
npm run build    # Production build
npm run lint     # Code quality checks
```

### Code Standards
- **Components**: PascalCase with .tsx extension
- **Utilities**: camelCase with descriptive names
- **Types**: Exported interfaces with clear naming
- **Imports**: Absolute imports via @/ alias

### Testing Strategy
- Component testing with React Testing Library
- API mocking for isolated testing
- E2E critical path coverage

## Critical Features

### 1. Profile System
- Dynamic profile URLs: `/p/:displayLink`
- Real-time donation tracking via WebSocket
- Customizable themes and layouts

### 2. Content Monetization
- Digital content sales with preview
- Package bundles for content creators
- Secure payment processing

### 3. Payment Infrastructure
- Multi-currency support (crypto + fiat)
- Subscription management
- Transaction history and analytics

## Security Considerations

### Frontend Security
- XSS protection via React's default escaping
- CSRF tokens for state-changing operations
- Secure cookie configuration for auth tokens

### API Security
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- Proper CORS configuration

## Performance Targets

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Bundle Size
- Initial bundle: < 200KB
- Route chunks: < 50KB
- Total size: < 1MB

## Deployment

### Production Build
```bash
npm run build
# Output in dist/ directory
```

### Environment Variables
- `VITE_API_URL`: Backend API endpoint
- `VITE_WS_URL`: WebSocket server URL
- `VITE_CHAIN_ID`: Default blockchain network

## Future Considerations

### Scalability
- Implement Redis caching for profile data
- Add CDN for static assets
- Consider server-side rendering for SEO

### Monitoring
- Add error tracking (Sentry)
- Implement analytics (GA4/Mixpanel)
- Performance monitoring (Web Vitals)

### Technical Debt
- Migrate remaining JS files to TypeScript
- Implement comprehensive test coverage
- Standardize error boundaries

## AI Assistant Guidelines

When working on this codebase:

1. **Maintain Type Safety**: Always use TypeScript with proper types
2. **Follow Patterns**: Respect existing architectural decisions
3. **Performance First**: Consider bundle size and runtime performance
4. **User Experience**: Prioritize smooth interactions and fast loads
5. **Web3 Best Practices**: Handle wallet states and network changes gracefully

## Quick Command Reference

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint checks
npm run format       # Prettier formatting
npm run knip         # Find unused code

# Type Checking
npm run tsc          # TypeScript compiler check
```