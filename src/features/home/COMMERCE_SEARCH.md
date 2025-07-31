# Commerce Search Implementation

A Google/Apple-level search experience with intelligent caching and beautiful UI.

## Features

### 🔍 Smart Search
- **Real-time search** with debouncing (300ms)
- **Autocomplete** with search history
- **Search suggestions** as you type
- **Keyboard navigation** (arrow keys + enter)
- **Google-style visual effects** with mouse tracking

### 💾 Intelligent Caching
- **30-day cache persistence** in localStorage
- **Automatic cache cleanup** (max 100 entries)
- **Instant results** for repeated searches
- **Search history** with timestamps

### 🎨 Premium UI/UX
- **Responsive design** for all devices
- **Elegant product cards** with smart title truncation
- **Loading skeletons** for smooth experience
- **Error states** with retry functionality
- **Pagination** with "Load More" pattern

## Architecture

```
src/features/home/
├── api/
│   └── commerceApi.ts        # Axios instance with smart URL detection
├── components/
│   ├── ProductCard.tsx       # Product display with title handling
│   ├── SearchBar.tsx         # Google-style search with autocomplete
│   ├── SearchResults.tsx     # Results grid with loading states
│   └── SearchSuggestions.tsx # Dropdown with history
├── hooks/
│   └── useSearch.ts          # Search logic with caching
├── types/
│   └── search.types.ts       # TypeScript interfaces
└── utils/
    └── searchCache.ts        # LocalStorage cache management
```

## Usage

```tsx
import { SearchBar, SearchResults } from './components';
import { useSearch } from './hooks/useSearch';

function YourComponent() {
  const { products, isLoading, search, loadMore } = useSearch({
    enableCache: true,
    debounceMs: 300
  });

  return (
    <>
      <SearchBar 
        onSearch={search}
        isLoading={isLoading}
      />
      <SearchResults 
        products={products}
        onLoadMore={loadMore}
      />
    </>
  );
}
```

## API Configuration

The commerce API automatically detects the environment:
- **Development**: `http://localhost:3000`
- **Production**: `https://api.pepay.io`
- **Custom**: Set `VITE_API_URL` environment variable

## Cache Management

### Storage Structure
- **Cache Key**: `pepay_search_cache_{query}_{page}_{retailer}_{minPrice}_{maxPrice}`
- **Suggestions Key**: `pepay_search_suggestions`

### Limits
- Max cache entries: 100
- Max suggestions: 20
- Cache duration: 30 days

### Manual Cache Control
```ts
import { SearchCache } from './utils/searchCache';

// Clear all cache
SearchCache.clearCache();

// Get cache statistics
const stats = SearchCache.getCacheStats();
```

## Keyboard Shortcuts
- **↑/↓**: Navigate suggestions
- **Enter**: Select suggestion
- **Escape**: Close suggestions
- **Type**: Show search history

## Performance Optimizations
- Debounced search input
- Virtual scrolling ready
- Image lazy loading
- Request cancellation
- Parallel API calls
- Smart cache warming