import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import VideoPlayer from './VideoPlayer';
import { fetchMediaDetails, fetchSeasonDetails } from '../utils/api';

export default function FeaturedBanner({ mediaId, mediaType }) {
  const [media, setMedia] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [nextEpisodes, setNextEpisodes] = useState([]);
  const [relatedContent, setRelatedContent] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadMediaDetails() {
      if (!mediaId || !mediaType) return;

      const detailsData = await fetchMediaDetails(mediaType, mediaId);
      if (!detailsData) return;

      setMedia(detailsData);

      if (mediaType === 'tv') {
        const seasonData = await fetchSeasonDetails(mediaId, selectedSeason);
        if (seasonData) {
          setEpisodes(seasonData.episodes || []);
          setNextEpisodes(seasonData.episodes?.slice(0, 3) || []);
        }
      }

      if (mediaType === 'movie' && detailsData.similar?.results) {
        setRelatedContent(detailsData.similar.results.slice(0, 3));
      }
    }

    loadMediaDetails();
  }, [mediaId, mediaType, selectedSeason]);

  const handlePlay = () => {
    if (media?.videos?.results?.[0]) {
      setIsPlaying(true);
      // Navigate to watch page with fullscreen video
      router.push(`/watch/${mediaType}-${mediaId}?autoplay=true`);
    }
  };

  const truncate = (string, n) => {
    return string?.length > n ? string.substr(0, n - 1) + "..." : string;
  };

  if (!media) return null;

  return (
    <div className="relative h-[85vh] bg-gradient-to-b">
      {!isPlaying && (
        <>
          <div className="absolute w-full h-full">
            <Image
              src={`https://image.tmdb.org/t/p/original${media.backdrop_path || media.poster_path}`}
              alt={media.title || media.name}
              layout="fill"
              objectFit="cover"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06202A] via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              {media.title || media.name}
            </h1>
            
            <p className="max-w-xs md:max-w-lg text-xs md:text-lg text-shadow-md text-white mb-4">
              {truncate(media.overview, 150)}
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
                <h3 className="text-xl font-semibold mb-2">About {media.title || media.name}</h3>
                <p className="mb-2">{media.overview}</p>
                <div className="text-sm text-gray-300">
                  <p>Release Date: {media.release_date || media.first_air_date}</p>
                  <p>Rating: {media.vote_average} / 10</p>
                  {media.number_of_seasons && (
                    <p>Seasons: {media.number_of_seasons}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {isPlaying && (
        <VideoPlayer
          videoKey={media.videos.results[0]?.key}
          onClose={() => setIsPlaying(false)}
          autoPlay={true}
        />
      )}
      {/* Next Episodes or Related Content */}
      <div className="px-4 py-8 bg-[#06202A]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            {mediaType === 'tv' ? 'Next Episodes' : 'You May Also Like'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mediaType === 'tv' ? (
              // Show next episodes for TV shows
              nextEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-[#0D2834] rounded-lg overflow-hidden"
                >
                  <div className="relative h-40">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                      alt={episode.name}
                      layout="fill"
                      objectFit="cover"
                    />
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <PlayIcon className="h-12 w-12 text-white" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold">
                      Episode {episode.episode_number}: {episode.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {truncate(episode.overview, 100)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Show related content for movies
              relatedContent.map((item) => (
                <div
                  key={item.id}
                  className="relative h-48 cursor-pointer"
                  onClick={() => router.push(`/watch/${mediaType}-${item.id}`)}
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-12 w-12 text-white" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
