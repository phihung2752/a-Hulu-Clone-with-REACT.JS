import { useQuery } from 'react-query';
import { movieService } from '../lib/movieService';

export function useMovieDetails(slug) {
  return useQuery(
    ['movie', slug],
    () => movieService.getMovieDetails(slug),
    {
      enabled: !!slug,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );
}
