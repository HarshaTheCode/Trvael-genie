import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  className,
  onSearch,
  placeholder = 'Search destinations, activities...',
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Default behavior: navigate to search results
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className || ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} role="img" aria-label="Search">🔍</span>
        <input
          type="search"
          placeholder={placeholder}
          style={{ width: '100%', borderRadius: 999, background: 'white', padding: '8px 36px 8px 36px', border: '1px solid #e5e7eb', outline: 'none' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <span role="img" aria-label="Clear">❌</span>
          </button>
        )}
      </div>
      <button
        type="submit"
        style={{ borderRadius: 999, background: '#0d9488', color: 'white', padding: '8px 20px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
      >
        <span role="img" aria-label="Search">🔍</span>
        Search
      </button>
    </form>
  );
}
