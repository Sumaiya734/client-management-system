import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchApi } from '../api';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchableModels, setSearchableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [searchParams] = useSearchParams();
  
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

  // Get initial search query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      setDebouncedQuery(query); // Trigger the debounced search
    }
  }, [searchParams]);
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Get searchable models on component mount
  useEffect(() => {
    fetchSearchableModels();
  }, []);

  const fetchSearchableModels = async () => {
    try {
      const response = await searchApi.getSearchableModels();
      if (response.data.success) {
        setSearchableModels(response.data.data);
        // Select all models by default
        setSelectedModels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching searchable models:', err);
      setError('Failed to load searchable models');
    }
  };

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
        models: selectedModels,
        limit: 10
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
  };

  const handleModelToggle = (model) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const renderResults = () => {
    // If search query is less than 2 characters, show a message
    if (searchQuery.length < 2 && searchQuery.length > 0) {
      return <p className="text-gray-500 text-center py-8">Please enter at least 2 characters to search</p>;
    }
    
    if (Object.keys(searchResults).length === 0) {
      return <p className="text-gray-500 text-center py-8">No results found</p>;
    }

    return Object.entries(searchResults).map(([model, data]) => (
      <div key={model} className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 capitalize">
          {model} ({data.results.length})
        </h3>
        <div className="space-y-3">
          {data.results.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              {renderResultItem(model, item)}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const renderResultItem = (model, item) => {
    switch (model) {
      case 'clients':
        return (
          <div>
            <h4 className="font-medium text-lg">{item.cli_name || item.company}</h4>
            <p className="text-gray-600">{item.email && `Email: ${item.email}`}</p>
            <p className="text-gray-600">{item.phone && `Phone: ${item.phone}`}</p>
            <p className="text-gray-600">{item.company && `Company: ${item.company}`}</p>
          </div>
        );
      case 'products':
        return (
          <div>
            <h4 className="font-medium text-lg">{item.product_name}</h4>
            <p className="text-gray-600">{item.description && `Description: ${item.description}`}</p>
            <p className="text-gray-600">{item.category && `Category: ${item.category}`}</p>
          </div>
        );
      case 'purchases':
        return (
          <div>
            <h4 className="font-medium text-lg">PO: {item.po_number}</h4>
            <p className="text-gray-600">Status: {item.status}</p>
            <p className="text-gray-600">Client: {item.cli_name}</p>
            {item.client && <p className="text-gray-600">Client: {item.client.cli_name || item.client.name}</p>}
            {item.product && <p className="text-gray-600">Product: {item.product.product_name || item.product.name}</p>}
          </div>
        );
      case 'subscriptions':
        return (
          <div>
            <h4 className="font-medium text-lg">PO: {item.po_number}</h4>
            <p className="text-gray-600">Status: {item.status}</p>
            <p className="text-gray-600">Notes: {item.notes}</p>
            {item.client && <p className="text-gray-600">Client: {item.client.cli_name || item.client.name}</p>}
            {item.product && <p className="text-gray-600">Product: {item.product.product_name || item.product.name}</p>}
          </div>
        );
      default:
        return <div>{JSON.stringify(item, null, 2)}</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Global Search</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Model selection */}
      {searchableModels.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Search in:</h3>
          <div className="flex flex-wrap gap-2">
            {searchableModels.map((model) => (
              <label key={model} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model)}
                  onChange={() => handleModelToggle(model)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 capitalize">{model}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          {renderResults()}
        </div>
      )}
    </div>
  );
};

export default SearchPage;