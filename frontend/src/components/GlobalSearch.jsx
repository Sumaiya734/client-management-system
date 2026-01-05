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
  
  // Debounce search requests to avoid too many API calls
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
      setShowResults(true);
    } else {
      setSearchResults({});
      if (!searchQuery.trim()) { // Only hide results when user clears the search completely
        setShowResults(false);
      } else {
        setShowResults(debouncedQuery.trim().length >= 1); // Show results container if there's input but less than 2 chars
      }
    }
  }, [debouncedQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({});
      setError(''); // Clear error when query is empty
      return;
    }
    
    // Minimum query length to prevent too broad searches
    if (query.trim().length < 2) {
      setSearchResults({});
      setError(''); // Don't show error for queries with 1 character
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await searchApi.search({
        q: query,
        limit: 5 // Limit results for dropdown
      });

      console.log('Search response:', response); // Debug log

      // Handle different response structures
      if (response.data) {
        // If response has success property
        if (response.data.success) {
          setSearchResults(response.data.data || {});
        } 
        // If response data is directly the search results
        else if (typeof response.data === 'object' && response.data !== null) {
          setSearchResults(response.data);
        }
        // If no results
        else {
          setSearchResults({});
        }
      } else {
        setSearchResults({});
      }
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error details:', err.response?.data);
      
      // More detailed error handling
      if (err.response?.status === 404) {
        setError('Search endpoint not found. Please check backend configuration.');
      } else if (err.response?.status === 500) {
        setError('Server error occurred during search.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during search');
      }
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
    // The actual search will be performed via the debounced effect
    
    if (!value.trim()) {
      setSearchResults({});
      setShowResults(false);
    }
  };

  const navigateToSearchPage = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const renderResults = () => {
    // If search query is less than 2 characters, show a message
    if (searchQuery.length < 2) {
      return (
        <div className="px-4 py-2 text-gray-500">
          {searchQuery.length === 0 
            ? 'Enter at least 2 characters to search' 
            : 'Enter at least 2 characters to search'}
        </div>
      );
    }
    
    // Check if searchResults is empty or has no results
    if (!searchResults || Object.keys(searchResults).length === 0) {
      return <p className="text-gray-500 px-4 py-2">No results found</p>;
    }

    return Object.entries(searchResults).map(([model, data]) => {
      // Handle different data structures
      const results = data?.results || data || [];
      const resultsArray = Array.isArray(results) ? results : [];
      
      if (resultsArray.length === 0) {
        return null; // Skip empty result sets
      }

      return (
        <div key={model} className="mb-3 last:mb-0">
          <h4 className="text-xs font-semibold text-gray-500 uppercase px-4 py-1 border-b border-gray-100">
            {model} ({resultsArray.length})
          </h4>
          <div className="space-y-1">
            {resultsArray.slice(0, 3).map((item, index) => (
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
                    case 'invoices':
                      path = `/invoices`;
                      break;
                    case 'vendors':
                      path = `/vendors`;
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
            {resultsArray.length > 3 && (
              <div 
                className="px-4 py-2 text-blue-600 hover:bg-gray-50 cursor-pointer text-sm"
                onClick={() => navigateToSearchPage()}
              >
                View all {resultsArray.length} results for {model}
              </div>
            )}
          </div>
        </div>
      );
    }).filter(Boolean); // Remove null entries
  };

  const renderResultItem = (model, item) => {
    if (!item) {
      return <div className="text-gray-500">No data available</div>;
    }

    switch (model) {
      case 'clients':
        return (
          <div>
            <div className="font-medium text-gray-900">{item.cli_name || item.company || item.name || 'Unnamed Client'}</div>
            <div className="text-sm text-gray-500">{item.email || item.phone || 'No contact info'}</div>
          </div>
        );
      case 'products':
        return (
          <div>
            <div className="font-medium text-gray-900">{item.product_name || item.name || 'Unnamed Product'}</div>
            <div className="text-sm text-gray-500">{item.description || 'No description'}</div>
          </div>
        );
      case 'purchases':
        return (
          <div>
            <div className="font-medium text-gray-900">PO: {item.po_number || 'No PO Number'}</div>
            <div className="text-sm text-gray-500">Client: {item.cli_name || item.client_name || 'Unknown Client'}</div>
          </div>
        );
      case 'subscriptions':
        return (
          <div>
            <div className="font-medium text-gray-900">PO: {item.po_number || 'No PO Number'}</div>
            <div className="text-sm text-gray-500">Status: {item.status || 'Unknown Status'}</div>
          </div>
        );
      case 'invoices':
        return (
          <div>
            <div className="font-medium text-gray-900">Invoice: {item.invoice_number || 'No Invoice Number'}</div>
            <div className="text-sm text-gray-500">PO: {item.po_number || 'N/A'} | Status: {item.payment_status || 'Unknown'}</div>
          </div>
        );
      case 'vendors':
        return (
          <div>
            <div className="font-medium text-gray-900">{item.name || item.company || 'Unnamed Vendor'}</div>
            <div className="text-sm text-gray-500">{item.email || item.contact_person || 'No contact info'}</div>
          </div>
        );
      default:
        return (
          <div>
            <div className="font-medium text-gray-900">
              {item.name || item.title || item.id || 'Unknown Item'}
            </div>
            <div className="text-sm text-gray-500">
              {JSON.stringify(item).substring(0, 100)}...
            </div>
          </div>
        );
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