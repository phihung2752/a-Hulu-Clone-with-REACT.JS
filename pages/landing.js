import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from 'next/image';

export default function Landing({ trendingMovies }) {
    const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
    const router = useRouter();
    const { isSignedIn } = useUser();

    useEffect(() => {
        if (isSignedIn) {
            router.push('/');
        }
    }, [isSignedIn, router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMovieIndex((prev) => 
                prev === (trendingMovies?.length || 1) - 1 ? 0 : prev + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [trendingMovies]);

    if (!trendingMovies) return null;

    const currentMovie = trendingMovies[currentMovieIndex];

    return (
        <div className="relative min-h-screen bg-[#06202A]">
            {/* Logo */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Image
                        src="/images/hulu-white.png"
                        alt="Hulu"
                        width={100}
                        height={50}
                        className="cursor-pointer"
                        onClick={() => router.push('/')}
                    />
                    <SignInButton mode="modal">
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200">
                            Sign In
                        </button>
                    </SignInButton>
                </div>
            </div>

            {/* Background Movie */}
            <div className="relative h-screen">
                <Image
                    src={`https://image.tmdb.org/t/p/original${currentMovie?.backdrop_path}`}
                    alt={currentMovie?.title}
                    layout="fill"
                    objectFit="cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06202A] via-[#06202A]/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center bg-gradient-to-t from-[#06202A] via-[#06202A]/90 to-transparent">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Unlimited movies, TV shows, and more
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Watch anywhere. Cancel anytime.
                    </p>
                    <SignInButton mode="modal">
                        <button className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition duration-200">
                            Get Started
                        </button>
                    </SignInButton>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US`
        );
        const data = await res.json();

        return {
            props: {
                trendingMovies: data.results || []
            }
        };
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return {
            props: {
                trendingMovies: []
            }
        };
    }
}
