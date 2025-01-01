import { useQuery } from 'react-query';
import { movieService } from '../lib/movieService';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

export function useMovieSearch() {
  const [query, setQuery] = useState('');

  const { data: results = [], isLoading, error } = useQuery(
    ['movieSearch', query],
    () => movieService.searchMovies(query),
    {
      enabled: query.length > 2,
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setQuery(searchTerm);
    }, 300),
    []
  );

  return {
    results,
    isLoading,
    error,
    search: debouncedSearch,
    setQuery,
  };
}
