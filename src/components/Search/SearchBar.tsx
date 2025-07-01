import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchIndex, SearchItem } from '../../hooks/useSearchIndex';

interface SearchResult {
  item: SearchItem;
  score?: number;
}

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { search, results, isLoading, clearResults } = useSearchIndex();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      search(query);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      clearResults();
      setIsOpen(false);
    }
  }, [query, search, clearResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex].item);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      clearResults();
    }
  };

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // First remove any existing highlights
      document.querySelectorAll('.highlight-search').forEach(el => {
        el.classList.remove('highlight-search');
        el.classList.remove('search-highlight-pulse');
      });

      // Calculate the header height (assuming your fixed header is 160px)
      const headerHeight = 160;
      
      // Get the element's position relative to the viewport
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      
      // Scroll the element into view with offset for the header
      window.scrollTo({
        top: absoluteElementTop - headerHeight - 20, // 20px extra padding
        behavior: 'smooth'
      });

      // Add highlight effects
      element.classList.add('highlight-search');
      element.classList.add('search-highlight-pulse');
      
      // Remove highlight after animation
      setTimeout(() => {
        element.classList.remove('highlight-search');
        element.classList.remove('search-highlight-pulse');
      }, 3000);
    }
  };

  const handleResultClick = async (result: SearchResult['item']) => {
    setIsOpen(false);
    setQuery('');
    clearResults();

    const scrollToTarget = (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        console.log('[SearchBar] Scrolling to element:', elementId);
        // Remove previous highlights
        document.querySelectorAll('.highlight-search').forEach(el => {
          el.classList.remove('highlight-search');
          el.classList.remove('search-highlight-pulse');
        });

        // Header offset
        const headerHeight = 160;
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;

        window.scrollTo({
          top: absoluteElementTop - headerHeight - 20,
          behavior: 'smooth'
        });

        // Highlight
        element.classList.add('highlight-search', 'search-highlight-pulse');
        setTimeout(() => {
          element.classList.remove('highlight-search', 'search-highlight-pulse');
        }, 3000);
      } else {
        console.warn('[SearchBar] Element not found for scroll:', elementId);
      }
    };

    if (result.path !== location.pathname) {
      console.log('[SearchBar] Navigating to', result.path);
      await navigate(result.path);

      if (result.elementId) {
        // Wait for DOM to update and element to appear
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
          const el = document.getElementById(result.elementId!);
          if (el || attempts > maxAttempts) {
            clearInterval(interval);
            if (el) {
              console.log('[SearchBar] Element found after navigation:', result.elementId);
              scrollToTarget(result.elementId!);
            } else {
              console.warn('[SearchBar] Element not found after navigation:', result.elementId);
            }
          } else {
            if (attempts === 0) console.log('[SearchBar] Waiting for element after navigation:', result.elementId);
          }
          attempts++;
        }, 100);
      }
    } else {
      // Already on the page
      if (result.elementId) {
        console.log('[SearchBar] Already on page, scrolling to:', result.elementId);
        scrollToTarget(result.elementId);
      }
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages, sections, or content..."
          className="w-[300px] pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm"
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto z-[9999] w-[400px]">
          {results.map((result: SearchResult, index: number) => (
            <button
              key={`${result.item.path}-${result.item.elementId || index}`}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50/50 flex items-start gap-3 border-b last:border-b-0 border-gray-100 transition-colors ${
                selectedIndex === index ? 'bg-blue-50/80' : ''
              }`}
              onClick={() => handleResultClick(result.item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{result.item.title}</div>
                {result.item.section && (
                  <div className="text-sm text-gray-600">
                    Section: {result.item.section}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {result.item.path === '/' ? 'Overview' : result.item.path.slice(1)}
                </div>
              </div>
              <div className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                result.item.type === 'page' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {result.item.type}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[9999] w-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 