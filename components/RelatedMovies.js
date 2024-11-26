import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RelatedMovies({ movieId, showInBanner = false }) {
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedMovies = async () => {
            try {
                // Fetch both recommendations and similar movies
                const [recommendationsRes, similarRes] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US&page=1`),
                    fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US&page=1`)
                ]);

                const [recommendationsData, similarData] = await Promise.all([
                    recommendationsRes.json(),
                    similarRes.json()
                ]);

                // Combine and deduplicate movies
                const allMovies = [...recommendationsData.results, ...similarData.results];
                const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
                
                // Sort by popularity and take required number
                const sortedMovies = uniqueMovies.sort((a, b) => b.popularity - a.popularity);
                setRelatedMovies(showInBanner ? sortedMovies.slice(0, 8) : sortedMovies.slice(0, 6));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching related movies:', error);
                setLoading(false);
            }
        };

        if (movieId) {
            fetchRelatedMovies();
        }
    }, [movieId, showInBanner]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (showInBanner) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">More Like This</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {relatedMovies.map((movie) => (
                        <div 
                            key={movie.id}
                            onClick={() => router.push(`/watch/movie-${movie.id}`)}
                            className="relative h-64 group cursor-pointer transform hover:scale-105 transition duration-200"
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                                alt={movie.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-white font-medium group-hover:text-red-500 transition">
                                    {movie.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-300 mt-1">
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                    <span className="mx-2">•</span>
                                    <span>⭐ {movie.vote_average.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-white text-xl font-semibold mb-4">Recommended Movies</h2>
            <div className="space-y-4">
                {relatedMovies.map((movie) => (
                    <Link href={`/watch/movie-${movie.id}`} key={movie.id}>
                        <div className="flex space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition group">
                            <div className="relative w-32 h-48 flex-shrink-0">
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium group-hover:text-red-500 transition">
                                    {movie.title}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    {new Date(movie.release_date).getFullYear()}
                                </p>
                                <div className="flex items-center mt-1">
                                    <span className="text-yellow-400">⭐</span>
                                    <span className="text-gray-400 text-sm ml-1">
                                        {movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2 line-clamp-3">
                                    {movie.overview}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
