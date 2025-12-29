import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api';

const GlobalSearch = ({ placeholder = "Search...", className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({});
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await searchApi.search({
        q: query,
        limit: 5 // Limit results for dropdown
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
      } else {
        setError(response.data.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred during search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
    setShowResults(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      performSearch(value);
      setShowResults(true);
    } else {
      setShowResults(false);
      setSearchResults({});
    }
  };

  const navigateToSearchPage = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const renderResults = () => {
    if (Object.keys(searchResults).length === 0) {
      return <p className="text-gray-500 px-4 py-2">No results found</p>;
    }

    return Object.entries(searchResults).map(([model, data]) => (
      <div key={model} className="mb-3 last:mb-0">
        <h4 className="text-xs font-semibold text-gray-500 uppercase px-4 py-1 border-b border-gray-100">
          {model} ({data.results.length})
        </h4>
        <div className="space-y-1">
          {data.results.slice(0, 3).map((item, index) => (
            <div 
              key={index} 
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start"
              onClick={() => {
                // Navigate to the appropriate page based on model
                let path = '';
                switch(model) {
                  case 'clients':
                    path = `/clients`;
                    break;
                  case 'products':
                    path = `/products`;
                    break;
                  case 'purchases':
                    path = `/orders`;
                    break;
                  case 'subscriptions':
                    path = `/subscriptions`;
                    break;
                  default:
                    path = `/search?q=${encodeURIComponent(searchQuery)}`;
                }
                
                if (item.id) {
                  navigate(`${path}#${item.id}`);
                } else {
                  navigate(path);
                }
                
                setShowResults(false);
              }}
            >
              {renderResultItem(model, item)}
            </div>
          ))}
          {data.results.length > 3 && (
            <div 
              className="px-4 py-2 text-blue-600 hover:bg-gray-50 cursor-pointer text-sm"
              onClick={() => navigateToSearchPage()}
            >
              View all {data.results.length} results for {model}
            </div>
          )}
        </div>
      </div>
    ));
  };

  const renderResultItem = (model, item) => {
    switch (model) {
      case 'clients':
        return (
          <div>
            <div className="font-medium text-gray-900">{item.cli_name || item.company}</div>
            <div className="text-sm text-gray-500">{item.email || item.phone}</div>
          </div>
        );
      case 'products':
        return (
          <div>
            <div className="font-medium text-gray-900">{item.product_name}</div>
            <div className="text-sm text-gray-500">{item.description}</div>
          </div>
        );
      case 'purchases':
        return (
          <div>
            <div className="font-medium text-gray-900">PO: {item.po_number}</div>
            <div className="text-sm text-gray-500">Client: {item.cli_name}</div>
          </div>
        );
      case 'subscriptions':
        return (
          <div>
            <div className="font-medium text-gray-900">PO: {item.po_number}</div>
            <div className="text-sm text-gray-500">Status: {item.status}</div>
          </div>
        );
      default:
        return <div>{JSON.stringify(item, null, 2)}</div>;
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onFocus={() => searchQuery.trim() && setShowResults(true)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </form>

      {showResults && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {error ? (
            <div className="px-4 py-2 text-red-600">{error}</div>
          ) : (
            <>
              {renderResults()}
              <div 
                className="px-4 py-2 text-blue-600 hover:bg-gray-50 cursor-pointer text-sm border-t border-gray-100"
                onClick={navigateToSearchPage}
              >
                View all results
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;