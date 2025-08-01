import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  CircularProgress,
  Fade,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchCache } from '../utils/searchCache';
import { SearchSuggestion } from '../types/search.types';

/**
 * SearchBar Component with Search History
 * 
 * Behavior Rules:
 * 1. SHOW dropdown when:
 *    - Input gains focus AND (has history OR user is typing)
 *    - User clicks on the search input
 * 
 * 2. HIDE dropdown when:
 *    - User clicks outside (with 200ms delay for suggestion clicks)
 *    - User presses Escape key
 *    - User selects a suggestion
 *    - User submits a search
 * 
 * 3. CONTENT rules:
 *    - Empty input: Show up to 8 recent searches
 *    - Typing (1+ chars): Show filtered history matching the query
 *    - Always show popular searches that match
 * 
 * 4. INTERACTION:
 *    - Arrow keys: Navigate suggestions
 *    - Enter: Select highlighted suggestion OR submit search
 *    - Click: Select suggestion
 *    - Escape: Close dropdown and blur input
 */
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
  showCountrySelector?: boolean;
  clearResults?: () => void;
}

const COUNTRIES = [
  { code: 'US', label: '🇺🇸 United States', available: true },
  { code: 'UK', label: '🇬🇧 United Kingdom', available: false },
  { code: 'DE', label: '🇩🇪 Germany', available: false },
];

export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  value: externalValue,
  onChange: externalOnChange,
  onSearch,
  isLoading = false,
  placeholder = "Search for products, brands, or categories...",
  selectedCountry = 'US',
  onCountryChange,
  showCountrySelector = true,
  clearResults,
}) => {
  // Internal state for immediate typing feedback
  const [internalValue, setInternalValue] = useState(externalValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [hasFocus, setHasFocus] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal value with external value only when it changes from outside
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  // Load initial suggestions once on mount
  useEffect(() => {
    // Load recent searches only once
    setSuggestions(SearchCache.getSuggestions().slice(0, 8));
  }, []);

  // Update suggestions immediately - no debounce needed for local filtering
  useEffect(() => {
    // Use requestAnimationFrame to ensure smooth typing
    const frameId = requestAnimationFrame(() => {
      if (internalValue.length >= 1) {
        // Show filtered suggestions when typing
        const filtered = SearchCache.getFilteredSuggestions(internalValue);
        setSuggestions(filtered);
      } else {
        // Show recent searches when search bar is empty
        setSuggestions(SearchCache.getSuggestions().slice(0, 8));
      }
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [internalValue]);

  // Show suggestions when:
  // 1. Input has focus AND
  // 2. Either: has suggestions OR is typing
  useEffect(() => {
    if (hasFocus && (suggestions.length > 0 || internalValue.length > 0)) {
      setShowSuggestions(true);
    }
  }, [hasFocus, suggestions.length, internalValue]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (internalValue.trim()) {
      externalOnChange(internalValue.trim()); // Update parent only on search
      onSearch(internalValue.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((query: string) => {
    // Clear blur timeout to prevent dropdown from closing
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Close dropdown immediately for seamless feel
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setHasFocus(false);
    
    // Update values and trigger search
    setInternalValue(query);
    externalOnChange(query);
    
    // Trigger search after a tiny delay to ensure UI updates first
    requestAnimationFrame(() => {
      onSearch(query);
    });
    
    // Blur the input after selection
    inputRef.current?.blur();
  }, [externalOnChange, onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalSuggestions = suggestions.length + 
      (internalValue ? 1 : 0) + // Current query option
      3; // Popular searches (assuming 3)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      
      case 'Enter':
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedSuggestionIndex].query);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Mouse tracking for visual effects - Google-style interactive glow
  useEffect(() => {
    const searchBar = searchBarRef.current;
    if (!searchBar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = searchBar.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      searchBar.style.setProperty('--mouse-x', `${x}%`);
      searchBar.style.setProperty('--mouse-y', `${y}%`);
    };

    searchBar.addEventListener('mousemove', handleMouseMove);
    return () => searchBar.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '600px', md: '680px' },
          position: 'relative',
        }}
      >
        <Paper
          ref={searchBarRef}
          elevation={0}
          onClick={() => {
            // Focus input when clicking anywhere on the search bar
            inputRef.current?.focus();
          }}
          sx={{
            p: { xs: '6px 14px', sm: '8px 16px', md: '10px 20px' },
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            borderRadius: { xs: '40px', sm: '50px' },
            boxShadow: '0 1px 6px 0 rgba(32, 33, 36, 0.28)',
            border: '1px solid rgba(223, 225, 229, 0)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: '0 2px 12px 0 rgba(32, 33, 36, 0.28)',
              border: '1px solid rgba(37, 99, 235, 0.1)',
              background: '#fff',
            },
            '&:focus-within': {
              boxShadow: '0 2px 16px 0 rgba(37, 99, 235, 0.25)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              background: '#fff',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
              }
            }
          }}
        >
          {isLoading ? (
            <CircularProgress
              size={18}
              sx={{
                color: '#2563eb',
                mr: { xs: 1, sm: 1.5, md: 2 },
              }}
            />
          ) : (
            <SearchIcon sx={{
              color: '#9aa0a6',
              mr: { xs: 1, sm: 1.5, md: 2 },
              fontSize: { xs: '20px', sm: '22px' },
              transition: 'color 200ms ease',
              '.MuiPaper-root:focus-within &': {
                color: '#2563eb',
              }
            }} />
          )}
          
          <InputBase
            ref={inputRef}
            sx={{
              ml: { xs: 0.5, sm: 1 },
              flex: 1,
              fontSize: { xs: '15px', sm: '16px', md: '17px' },
              fontWeight: 400,
              color: '#202124',
              '& input': {
                padding: { xs: '8px 0', sm: '10px 0' },
                '&::placeholder': {
                  color: '#5f6368',
                  opacity: 1,
                }
              }
            }}
            placeholder={placeholder}
            value={internalValue}
            onChange={(e) => {
              const newValue = e.target.value;
              // Update internal state immediately for instant feedback
              setInternalValue(newValue);
              
              // Only update parent state if clearing the input
              if (!newValue && externalValue) {
                externalOnChange('');
              }
            }}
            onFocus={() => {
              setHasFocus(true);
              // Clear any pending blur timeout
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
            }}
            onBlur={() => {
              // Delay blur to allow clicking on suggestions
              blurTimeoutRef.current = setTimeout(() => {
                setHasFocus(false);
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
              }, 150); // Reduced for snappier feel
            }}
            onKeyDown={handleKeyDown}
            inputProps={{ 
              'aria-label': 'search products',
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'off',
              spellCheck: false
            }}
          />
          
          {internalValue && (
            <Fade in={true} timeout={100}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the Paper's onClick
                  e.preventDefault();
                  
                  // Clear immediately for instant feedback
                  setInternalValue('');
                  
                  // Update parent state and clear results
                  requestAnimationFrame(() => {
                    externalOnChange('');
                    clearResults?.(); // Clear search results if available
                  });
                  
                  // Keep focus on input
                  inputRef.current?.focus();
                  setHasFocus(true);
                }}
                sx={{
                  ml: 1,
                  color: '#5f6368',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Fade>
          )}
        </Paper>
      </Box>

      {/* Country Selection */}
      {showCountrySelector && (
        <Fade in={true} timeout={300}>
          <Box sx={{
            display: 'flex',
            gap: { xs: 1, sm: 1.5 },
            flexWrap: 'wrap',
            justifyContent: 'center',
            mt: 3,
          }}>
            {COUNTRIES.map((country) => (
              <Chip
                key={country.code}
                label={country.label}
                onClick={() => country.available && onCountryChange?.(country.code)}
                disabled={!country.available}
                sx={{
                  height: '36px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: selectedCountry === country.code ? 600 : 500,
                  background: selectedCountry === country.code 
                    ? 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)' 
                    : '#fff',
                  color: selectedCountry === country.code ? '#fff' : country.available ? '#5f6368' : '#80868b',
                  border: selectedCountry === country.code 
                    ? '1px solid rgba(255, 255, 255, 0.25)' 
                    : '1px solid #dadce0',
                  px: 2.5,
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: country.available ? 'pointer' : 'not-allowed',
                  opacity: country.available ? 1 : 0.7,
                  position: 'relative',
                  boxShadow: selectedCountry === country.code 
                    ? '0 8px 20px rgba(0,140,255,0.25)' 
                    : 'none',
                  backdropFilter: selectedCountry === country.code ? 'blur(14px)' : 'none',
                  WebkitBackdropFilter: selectedCountry === country.code ? 'blur(14px)' : 'none',
                  '&:hover': country.available ? {
                    background: selectedCountry === country.code 
                      ? 'radial-gradient(circle at 30% 30%, rgba(0,150,255,1), rgba(0,60,140,1))' 
                      : '#f8f9fa',
                    borderColor: selectedCountry === country.code 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : '#008CFF',
                    transform: 'translateY(-1px)',
                    boxShadow: selectedCountry === country.code 
                      ? '0 10px 28px rgba(0,140,255,0.3)' 
                      : '0 2px 8px rgba(0,140,255,0.15)',
                  } : {},
                  '& .MuiChip-label': {
                    px: 0,
                  },
                  ...(!country.available && {
                    '&::after': {
                      content: '"Soon"',
                      position: 'absolute',
                      top: '-8px',
                      right: '-16px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0075AA',
                      backgroundColor: 'rgba(0,140,255,0.1)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }
                  })
                }}
              />
            ))}
          </Box>
        </Fade>
      )}

      {/* Search Suggestions Dropdown */}
      <SearchSuggestions
        open={showSuggestions && !!searchBarRef.current}
        anchorEl={searchBarRef.current}
        suggestions={suggestions}
        currentQuery={internalValue}
        onSelect={handleSuggestionSelect}
        onClose={useCallback(() => {
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }, [])}
        selectedIndex={selectedSuggestionIndex}
        onKeyboardNavigation={useCallback((index: number) => {
          setSelectedSuggestionIndex(index);
        }, [])}
      />
    </>
  );
});

SearchBar.displayName = 'SearchBar';