import { useQuery, useMutation, useQueryClient } from 'react-query';
import { movieService } from '../lib/movieService';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

export function useFavorites() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery(
    ['favorites', user?.id],
    () => movieService.getFavorites(user?.id),
    {
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const addToFavorites = useMutation(
    ({ movieSlug }) => movieService.addToFavorites(user?.id, movieSlug),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites', user?.id]);
        toast.success('Added to favorites');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add to favorites');
      },
    }
  );

  const removeFromFavorites = useMutation(
    ({ movieSlug }) => movieService.removeFromFavorites(user?.id, movieSlug),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites', user?.id]);
        toast.success('Removed from favorites');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove from favorites');
      },
    }
  );

  const isFavorite = (movieSlug) => {
    return favorites.some(movie => movie.slug === movieSlug);
  };

  return {
    favorites,
    isLoading,
    error,
    addToFavorites: (movieSlug) => addToFavorites.mutate({ movieSlug }),
    removeFromFavorites: (movieSlug) => removeFromFavorites.mutate({ movieSlug }),
    isFavorite,
  };
}
