import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { movieService } from '../lib/movieService';
import Image from 'next/image';
import { useRouter } from 'next/router';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsLoading(true);
        try {
          const results = await movieService.searchMovies(searchTerm);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchClick = () => {
    setShowResults(true);
  };

  const handleMovieClick = (movie) => {
    router.push(`/movie/${movie.slug}`);
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center bg-[#141414] px-4 py-2 rounded-full">
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={handleSearchClick}
          placeholder="Titles, people, genres"
          className="bg-transparent ml-2 outline-none placeholder-gray-500 w-64"
        />
      </div>

      {showResults && (searchResults.length > 0 || isLoading) && (
        <div className="absolute mt-2 w-96 bg-[#141414] rounded-md shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="flex items-center p-3 hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex-shrink-0 h-16 w-12 relative">
                    <Image
                      src={movie.poster || movie.backdrop}
                      alt={movie.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-medium">{movie.title}</div>
                    <div className="text-sm text-gray-400">
                      {movie.year} • {movie.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
