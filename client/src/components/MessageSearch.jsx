import React, { useState } from 'react';

function MessageSearch({ messages, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = messages.filter(msg => 
      msg.text && msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 border rounded px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        {searchResults.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </form>
      
      {searchResults.length > 0 && (
        <div className="mt-2 p-2 bg-yellow-50 border rounded">
          <h4 className="font-semibold mb-2">Search Results ({searchResults.length}):</h4>
          <div className="max-h-32 overflow-y-auto">
            {searchResults.map((msg, idx) => (
              <div key={idx} className="text-sm mb-1 p-1 bg-white rounded">
                <span className="font-medium text-blue-600">{msg.sender}:</span>
                <span className="ml-2">{msg.text}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(msg.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageSearch; 