import { useInfiniteQuery } from 'react-query';
import { movieService } from '../lib/movieService';

async function fetchMovies({ genre, pageParam = 1 }) {
  try {
    let results;
    switch (genre) {
      case 'fetchTrending':
        results = await movieService.getNewMovies(pageParam);
        break;
      case 'fetchTopRated':
        results = await movieService.getSingleMovies();
        break;
      case 'fetchActionMovies':
        results = await movieService.getSeriesMovies();
        break;
      case 'fetchComedyMovies':
        results = await movieService.getTVShows();
        break;
      case 'fetchHorrorMovies':
        results = await movieService.getAnimeMovies();
        break;
      default:
        results = await movieService.getNewMovies(pageParam);
    }
    return {
      results,
      nextPage: pageParam + 1,
      hasMore: results.length > 0,
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
}

export function useMovies(genre) {
  return useInfiniteQuery(
    ['movies', genre],
    ({ pageParam = 1 }) => fetchMovies({ genre, pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}
