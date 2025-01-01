import axios from 'axios';
import { supabase } from './supabaseClient';

const BASE_URL = 'https://phimapi.com';
const IMAGE_BASE_URL = 'https://phimimg.com';

class MovieService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get new movies with pagination
  async getNewMovies(page = 1) {
    try {
      const response = await this.api.get(`/danh-sach/phim-moi-cap-nhat?page=${page}`);
      return this.processMovieResponse(response.data);
    } catch (error) {
      console.error('Error fetching new movies:', error);
      throw error;
    }
  }

  // Get TV shows
  async getTVShows() {
    try {
      const response = await this.api.get('/v1/api/danh-sach/tv-shows');
      return this.processMovieResponse(response.data);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      throw error;
    }
  }

  // Get series movies
  async getSeriesMovies() {
    try {
      const response = await this.api.get('/v1/api/danh-sach/phim-bo');
      return this.processMovieResponse(response.data);
    } catch (error) {
      console.error('Error fetching series movies:', error);
      throw error;
    }
  }

  // Get single movies
  async getSingleMovies() {
    try {
      const response = await this.api.get('/v1/api/danh-sach/phim-le');
      return this.processMovieResponse(response.data);
    } catch (error) {
      console.error('Error fetching single movies:', error);
      throw error;
    }
  }

  // Get anime movies
  async getAnimeMovies() {
    try {
      const response = await this.api.get('/v1/api/danh-sach/hoat-hinh');
      return this.processMovieResponse(response.data);
    } catch (error) {
      console.error('Error fetching anime movies:', error);
      throw error;
    }
  }

  // Get movie details
  async getMovieDetails(slug) {
    try {
      const response = await this.api.get(`/phim/${slug}`);
      return this.processMovieDetails(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  }

  // Search movies
  async searchMovies(query, limit = 20) {
    try {
      const response = await this.api.get(`/v1/api/tim-kiem`, {
        params: {
          keyword: query,
          limit
        }
      });
      return this.processMovieResponse(response.data);
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  // Get user favorites
  async getFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('Favorite')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Fetch full movie details for each favorite
      const movieDetails = await Promise.all(
        data.map(fav => this.getMovieDetails(fav.movie_slug))
      );

      return movieDetails.filter(Boolean);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  // Add movie to favorites
  async addToFavorites(userId, movieSlug) {
    try {
      const { data, error } = await supabase
        .from('Favorite')
        .insert([
          { user_id: userId, movie_slug: movieSlug }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove movie from favorites
  async removeFromFavorites(userId, movieSlug) {
    try {
      const { data, error } = await supabase
        .from('Favorite')
        .delete()
        .match({ user_id: userId, movie_slug: movieSlug });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Process movie response to standardize data format
  processMovieResponse(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(movie => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      slug: movie.slug,
      poster: movie.poster_url ? `${IMAGE_BASE_URL}/${movie.poster_url}` : null,
      backdrop: movie.backdrop_url ? `${IMAGE_BASE_URL}/${movie.backdrop_url}` : null,
      year: movie.year,
      quality: movie.quality,
      language: movie.language,
      duration: movie.duration,
      description: movie.description,
      type: movie.type,
      rating: movie.rating,
      genres: movie.genres || [],
    }));
  }

  // Process movie details
  processMovieDetails(data) {
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      originalTitle: data.original_title,
      slug: data.slug,
      poster: data.poster_url ? `${IMAGE_BASE_URL}/${data.poster_url}` : null,
      backdrop: data.backdrop_url ? `${IMAGE_BASE_URL}/${data.backdrop_url}` : null,
      year: data.year,
      quality: data.quality,
      language: data.language,
      duration: data.duration,
      description: data.description,
      type: data.type,
      rating: data.rating,
      genres: data.genres || [],
      cast: data.cast || [],
      director: data.director,
      country: data.country,
      streamingUrls: data.streaming_urls || [],
      relatedMovies: Array.isArray(data.related_movies) ? this.processMovieResponse(data.related_movies) : [],
    };
  }

  // Get image URL
  getImageUrl(path) {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${path}`;
  }
}

export const movieService = new MovieService();
