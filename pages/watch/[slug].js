import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import SignInButton from '../../components/SignInButton';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import Comment from '../../components/Comment';
import { supabase } from '../../lib/supabase';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';
// const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default function Watch({ details, type, videos, similar, seasons, autoplay }) {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const BASE_URL = "https://image.tmdb.org/t/p/original/";

  useEffect(() => {
    // Tìm trailer
    const trailer = videos.find(video => video.type === "Trailer") || videos[0];
    setTrailer(trailer);
    if (autoplay && trailer) {
      setIsPlaying(true);
    }
    
    // Load comments
    fetchComments();
  }, [videos, autoplay]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('contentid', `${type}-${details.id}`);
      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            contentid: `${type}-${details.id}`,
            content: newComment.trim(),
            userid: user.id,
            username: user.fullName || user.username,
            userimage: user.imageUrl || null,
            likes: [],
            replies: []
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        alert(error.message);
        return;
      }

      setComments(prevComments => [data, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(error.message);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ content: newText.trim() })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        alert(error.message);
        return;
      }

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? data : comment
        )
      );
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        alert(error.message);
        return;
      }

      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      alert('Please sign in to like comments');
      return;
    }

    try {
      // First get the current comment
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      if (fetchError) {
        console.error('Error fetching comment:', fetchError);
        alert(fetchError.message);
        return;
      }

      // Toggle like
      const likes = comment.likes || [];
      const newLikes = likes.includes(user.id)
        ? likes.filter(id => id !== user.id)
        : [...likes, user.id];

      // Update the comment
      const { data, error: updateError } = await supabase
        .from('comments')
        .update({ likes: newLikes })
        .eq('id', commentId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating likes:', updateError);
        alert(updateError.message);
        return;
      }

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? data : comment
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
      alert(error.message);
    }
  };

  const handleAddReply = async (commentId) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            contentid: `${type}-${details.id}`,
            parentid: commentId,
            content: replyText,
            userid: user.id,
            username: user.fullName || user.username,
            userimage: user.imageUrl,
            likes: [],
            replies: []
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding reply:', error);
        alert(error.message);
        return;
      }

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), data] }
            : comment
        )
      );
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error adding reply:', error);
      alert(error.message);
    }
  };

  if (!details) return null;

  return (
    <div className="relative min-h-screen bg-[#06202A]">
      <Head>
        <title>{details.title || details.name} - Hulu Clone</title>
      </Head>

      <Header />

      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isPlaying ? (
            <div className="mb-8">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&controls=1`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="text-white bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Back to Details
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#06202A] to-transparent" />
              <Image
                src={`${BASE_URL}${details.backdrop_path || details.poster_path}`}
                alt={details.title || details.name}
                width={1920}
                height={1080}
                className="w-full object-cover rounded-lg"
                style={{ maxHeight: '70vh' }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {details.title || details.name}
                  </h1>
                  
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded hover:bg-opacity-90"
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span>Play</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (trailer) {
                          setIsPlaying(true);
                        }
                      }}
                      className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-2 rounded hover:bg-opacity-90"
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span>{trailer ? 'Watch Trailer' : 'No Trailer Available'}</span>
                    </button>
                  </div>

                  <p className="text-white text-lg mb-6 line-clamp-3">
                    {details.overview}
                  </p>

                  {/* Movie/Show Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Release Date</p>
                      <p className="text-white">
                        {details.release_date || details.first_air_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Rating</p>
                      <p className="text-white">{details.vote_average?.toFixed(1)} / 10</p>
                    </div>
                    {type === 'tv' && (
                      <>
                        <div>
                          <p className="text-gray-400">Seasons</p>
                          <p className="text-white">{details.number_of_seasons}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Episodes</p>
                          <p className="text-white">{details.number_of_episodes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="mt-8 flex flex-col lg:flex-row gap-8">
            {/* Left Side - Movie Details & Comments */}
            <div className="flex-1">
              {/* Movie Details */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">About {details.title || details.name}</h2>
                <p className="text-gray-300">{details.overview}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Release Date</p>
                    <p className="text-white">{details.release_date || details.first_air_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rating</p>
                    <p className="text-white">{details.vote_average?.toFixed(1)} / 10</p>
                  </div>
                  {type === 'tv' && (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm">Seasons</p>
                        <p className="text-white">{details.number_of_seasons}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Episodes</p>
                        <p className="text-white">{details.number_of_episodes}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="max-w-4xl mx-auto mt-8 px-4">
                <h2 className="text-2xl font-bold mb-4 text-white">Comments</h2>
                
                {/* Comment Input */}
                <div className="mb-6">
                  {user ? (
                    <div className="flex space-x-4">
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || user.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-4 py-2 text-white bg-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleAddComment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={!newComment.trim()}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                      <p className="text-gray-400 mb-2">Please sign in to comment</p>
                      <SignInButton />
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      currentUser={user}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      onLike={handleLikeComment}
                      onReply={handleAddReply}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Suggestions */}
            <div className="lg:w-80">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Suggested {type === 'movie' ? 'Movies' : 'Shows'}
                </h3>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                  {similar.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => router.push(`/watch/${type}-${item.id}`)}
                    >
                      <div className="relative h-44">
                        <Image
                          src={`${BASE_URL}${item.backdrop_path || item.poster_path}`}
                          alt={item.title || item.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="text-white font-semibold mb-2 line-clamp-1">
                          {item.title || item.name}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {item.overview}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {new Date(item.release_date || item.first_air_date).getFullYear()}
                          </span>
                          <span className="text-yellow-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.vote_average?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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
