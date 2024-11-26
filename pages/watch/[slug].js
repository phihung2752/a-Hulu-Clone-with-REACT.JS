import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import SignInButton from '@/components/SignInButton';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

export async function getServerSideProps(context) {
  const { slug, autoplay } = context.query;
  const [type, id] = slug.split('-');

  try {
    // Fetch main content details
    const [detailsRes, videosRes, similarRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US`),
      fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US`),
      fetch(`https://api.themoviedb.org/3/${type}/${id}/similar?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US`)
    ]);

    const [details, videosData, similarData] = await Promise.all([
      detailsRes.json(),
      videosRes.json(),
      similarRes.json()
    ]);

    // If it's a TV show, fetch season details
    let seasons = [];
    if (type === 'tv' && details.number_of_seasons) {
      const seasonPromises = Array.from({ length: details.number_of_seasons }, (_, i) =>
        fetch(`https://api.themoviedb.org/3/tv/${id}/season/${i + 1}?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US`)
          .then(res => res.json())
      );
      seasons = await Promise.all(seasonPromises);
    }

    return {
      props: {
        details,
        type,
        videos: videosData.results || [],
        similar: similarData.results || [],
        seasons,
        autoplay: !!autoplay
      },
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    return {
      props: {
        error: error.message,
        details: null,
        type,
        videos: [],
        similar: [],
        seasons: [],
        autoplay: false
      },
    };
  }
}

export default function Watch({ details, error, type, videos, similar, seasons, autoplay }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const trailer = videos?.find(video => video.type === 'Trailer') || videos?.[0];
  const BASE_URL = "https://image.tmdb.org/t/p/original/";

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !isLoaded || !user) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      userId: user.id,
      userName: user.fullName || user.username || 'Anonymous User',
      userImage: user.imageUrl || '/default-avatar.png',
      timestamp: new Date().toISOString(),
      edited: false
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem(`comments-${type}-${details?.id}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  const handleEditComment = (commentId, newText) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          text: newText,
          edited: true,
          editedAt: new Date().toISOString()
        };
      }
      return comment;
    });

    setComments(updatedComments);
    localStorage.setItem(`comments-${type}-${details?.id}`, JSON.stringify(updatedComments));
    setEditingComment(null);
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`comments-${type}-${details?.id}`, JSON.stringify(updatedComments));
  };

  useEffect(() => {
    // Load comments from localStorage or your backend
    const savedComments = localStorage.getItem(`comments-${type}-${details?.id}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [type, details?.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#06202A] text-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] space-y-4">
          <p className="text-xl text-red-500">Error: {error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06202A]">
      <Head>
        <title>{details?.title || details?.name} - Hulu</title>
        <meta name="description" content={details?.overview} />
      </Head>

      <Header />

      <main className="pt-16"> {/* Added padding-top for header spacing */}
        {!isPlaying ? (
          <div className="relative">
            {/* Featured Content Banner */}
            <div className="relative h-[85vh]">
              <Image
                src={`${BASE_URL}${details?.backdrop_path || details?.poster_path}`}
                alt={details?.title || details?.name}
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06202A] via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                  {details?.title || details?.name}
                </h1>
                
                <p className="max-w-xs md:max-w-lg text-xs md:text-lg text-shadow-md text-white mb-4">
                  {details?.overview}
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePlay}
                    className="flex items-center bg-white text-black px-6 py-2 rounded hover:bg-opacity-75 transition duration-200"
                  >
                    <PlayIcon className="h-5 w-5 mr-1" />
                    Play
                  </button>
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center bg-gray-500 bg-opacity-50 text-white px-6 py-2 rounded hover:bg-opacity-75 transition duration-200"
                  >
                    <InformationCircleIcon className="h-5 w-5 mr-1" />
                    More Info
                  </button>
                </div>

                {showInfo && (
                  <div className="mt-4 bg-[#06202A] bg-opacity-90 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Release Date</p>
                        <p className="text-white">{details?.release_date || details?.first_air_date}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rating</p>
                        <p className="text-white">{details?.vote_average?.toFixed(1)} / 10</p>
                      </div>
                      {type === 'tv' && (
                        <>
                          <div>
                            <p className="text-gray-400">Seasons</p>
                            <p className="text-white">{details?.number_of_seasons}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Episodes</p>
                            <p className="text-white">{details?.number_of_episodes}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Episodes or Similar Content */}
            <div className="bg-[#06202A] px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {type === 'tv' ? 'Next Episodes' : 'You May Also Like'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {type === 'tv' && seasons[0]?.episodes ? (
                  seasons[0].episodes.slice(0, 6).map(episode => (
                    <div key={episode.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                      {episode.still_path ? (
                        <Image
                          src={`${BASE_URL}${episode.still_path}`}
                          alt={episode.name}
                          width={400}
                          height={225}
                          className="w-full"
                        />
                      ) : (
                        <div className="w-full h-[225px] bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400">No Preview Available</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-white">Episode {episode.episode_number}: {episode.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{episode.overview}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  similar.slice(0, 6).map(item => (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/watch/${type}-${item.id}`)}
                      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Image
                        src={`${BASE_URL}${item.backdrop_path || item.poster_path}`}
                        alt={item.title || item.name}
                        width={400}
                        height={225}
                        className="w-full"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-white">{item.title || item.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{item.overview}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-screen">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* Comments Section - Only show when video is playing */}
        {isPlaying && (
          <div className="bg-[#06202A] px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Comments</h2>
              {isLoaded && user ? (
                <div className="flex space-x-4 mb-6">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-white text-black px-4 py-2 rounded-lg hover:bg-opacity-90"
                  >
                    Post
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-6">
                  <p className="text-gray-400">Sign in to join the conversation</p>
                  <SignInButton />
                </div>
              )}

              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={comment.userImage}
                          alt={comment.userName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-white">{comment.userName}</p>
                          <p className="text-sm text-gray-400">
                            {formatDistanceToNow(new Date(comment.timestamp))} ago
                            {comment.edited && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      {user?.id === comment.userId && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingComment(comment.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingComment === comment.id ? (
                      <div className="mt-2 flex space-x-2">
                        <input
                          type="text"
                          defaultValue={comment.text}
                          className="flex-1 bg-gray-700 rounded px-3 py-1 text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditComment(comment.id, e.target.value);
                            }
                          }}
                        />
                        <button
                          onClick={() => setEditingComment(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-white">{comment.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
