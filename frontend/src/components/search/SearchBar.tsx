
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface SearchSuggestion {
  text: string;
  type: 'history' | 'suggestion';
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search experiments, electrodes, techniques...",
  onSearch,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load search history from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/search-suggestions/?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        
        // Convert API suggestions to SearchSuggestion objects
        const apiSuggestions: SearchSuggestion[] = data.suggestions.map((text: string) => ({
          text,
          type: 'suggestion'
        }));
        
        // Find matching history items
        const historyItems = searchHistory
          .filter(item => item.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(text => ({ text, type: 'history' as const }));
        
        // Combine history and API suggestions, remove duplicates
        const allSuggestions = [...historyItems];
        
        for (const suggestion of apiSuggestions) {
          if (!allSuggestions.some(s => s.text.toLowerCase() === suggestion.text.toLowerCase())) {
            allSuggestions.push(suggestion);
          }
        }
        
        setSuggestions(allSuggestions.slice(0, 10));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchHistory]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    // Add to search history (avoid duplicates, most recent at the top)
    setSearchHistory(prev => {
      const filteredHistory = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      return [query, ...filteredHistory].slice(0, 10);
    });
    
    // Perform search
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setShowSuggestions(false);
    toast({
      title: "Search initiated",
      description: `Searching for "${query}"`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    
    // Add a slight delay before searching to update the input value
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    toast({
      title: "History cleared",
      description: "Your search history has been cleared",
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex w-full items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          <SearchIcon size={16} className="mr-2" />
          Search
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.text}-${index}`}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <SearchIcon 
                  size={14} 
                  className={suggestion.type === 'history' ? 'mr-2 text-gray-400' : 'mr-2 text-blue-500'} 
                />
                <span className="flex-1">{suggestion.text}</span>
                {suggestion.type === 'history' && (
                  <span className="text-xs text-gray-400">History</span>
                )}
              </li>
            ))}
            
            {searchHistory.length > 0 && (
              <li className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={clearSearchHistory}
                  className="w-full text-left text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                  Clear search history
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
