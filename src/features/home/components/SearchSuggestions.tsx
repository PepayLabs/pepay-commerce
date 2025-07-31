import React, { useEffect, useRef } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Fade,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { SearchSuggestion } from '../types/search.types';

interface SearchSuggestionsProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  suggestions: SearchSuggestion[];
  currentQuery: string;
  onSelect: (query: string) => void;
  onClose: () => void;
  selectedIndex: number;
  onKeyboardNavigation: (index: number) => void;
}

// Format timestamp to relative time
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return then.toLocaleDateString();
};

// Highlight matching text
const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} style={{ fontWeight: 600, color: '#1f2937' }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = React.memo(({
  open,
  anchorEl,
  suggestions,
  currentQuery,
  onSelect,
  onClose,
  selectedIndex,
  onKeyboardNavigation,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Popular searches (hardcoded for now, could be dynamic based on analytics)
  const popularSearches = [
    'wireless headphones',
    'laptop stand',
    'phone cases',
    'bluetooth speakers',
    'gaming mouse',
  ].filter(search => 
    search.toLowerCase().includes(currentQuery.toLowerCase()) && 
    !suggestions.some(s => s.query.toLowerCase() === search.toLowerCase())
  ).slice(0, 3);

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    // Don't close if clicking inside the search bar
    if (anchorEl && anchorEl.contains(event.target as Node)) {
      return;
    }
    onClose();
  };

  const handleSelect = (query: string) => {
    onSelect(query);
  };

  if (!anchorEl) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      style={{ zIndex: 1300 }}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        },
      ]}
    >
      <ClickAwayListener onClickAway={handleClickAway}>
        <Fade in={open} timeout={200}>
          <Paper
            elevation={8}
            sx={{
              width: anchorEl.offsetWidth,
              maxHeight: '400px',
              overflow: 'hidden',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <List
              ref={listRef}
              sx={{
                py: 1,
                maxHeight: '400px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: '#555',
                  },
                },
              }}
            >
              {/* Recent searches */}
              {suggestions.length > 0 && (
                <>
                  <Box sx={{ px: 2, py: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6b7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Recent Searches
                    </Typography>
                  </Box>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={suggestion.query} disablePadding>
                      <ListItemButton
                        selected={selectedIndex === index}
                        onClick={() => handleSelect(suggestion.query)}
                        onMouseEnter={() => onKeyboardNavigation(index)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#e0e7ff',
                            '&:hover': {
                              backgroundColor: '#c7d2fe',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <HistoryIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ color: '#374151', flex: 1 }}
                              >
                                <HighlightedText
                                  text={suggestion.query}
                                  highlight={currentQuery}
                                />
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: '#9ca3af', fontSize: '12px' }}
                              >
                                {formatRelativeTime(suggestion.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{ color: '#6b7280', fontSize: '11px' }}
                            >
                              {suggestion.resultCount} results
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </>
              )}

              {/* Divider between sections */}
              {suggestions.length > 0 && popularSearches.length > 0 && (
                <Divider sx={{ my: 1 }} />
              )}

              {/* Popular searches */}
              {popularSearches.length > 0 && (
                <>
                  <Box sx={{ px: 2, py: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6b7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Popular Searches
                    </Typography>
                  </Box>
                  {popularSearches.map((search, index) => {
                    const actualIndex = suggestions.length + index;
                    return (
                      <ListItem key={search} disablePadding>
                        <ListItemButton
                          selected={selectedIndex === actualIndex}
                          onClick={() => handleSelect(search)}
                          onMouseEnter={() => onKeyboardNavigation(actualIndex)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e0e7ff',
                              '&:hover': {
                                backgroundColor: '#c7d2fe',
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <TrendingUpIcon sx={{ fontSize: 18, color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ color: '#374151' }}>
                                <HighlightedText text={search} highlight={currentQuery} />
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </>
              )}

              {/* Current query search option */}
              {currentQuery && (
                <>
                  {(suggestions.length > 0 || popularSearches.length > 0) && (
                    <Divider sx={{ my: 1 }} />
                  )}
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={
                        selectedIndex === suggestions.length + popularSearches.length
                      }
                      onClick={() => handleSelect(currentQuery)}
                      onMouseEnter={() =>
                        onKeyboardNavigation(suggestions.length + popularSearches.length)
                      }
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#e0e7ff',
                          '&:hover': {
                            backgroundColor: '#c7d2fe',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <SearchIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ color: '#374151', fontWeight: 500 }}
                          >
                            Search for "{currentQuery}"
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </>
              )}

              {/* Empty state */}
              {suggestions.length === 0 && popularSearches.length === 0 && !currentQuery && (
                <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Start typing to see suggestions
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Fade>
      </ClickAwayListener>
    </Popper>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';