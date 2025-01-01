import { useState, useEffect, useRef, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Dynamically import ReactPlayer to reduce initial bundle size
const ReactPlayer = dynamic(() => import('react-player/lazy'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="animate-pulse text-white">Loading player...</div>
    </div>
  ),
});

const VideoPlayer = memo(({ videoUrl, movieData, onClose, autoPlay = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isBuffering, setIsBuffering] = useState(true);
  const playerRef = useRef(null);
  const playerWrapperRef = useRef(null);

  const handleEsc = useCallback((event) => {
    if (event.key === 'Escape') {
      if (isFullscreen) {
        document.exitFullscreen();
      } else {
        onClose();
      }
    }
  }, [isFullscreen, onClose]);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleEsc, handleFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      playerWrapperRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleBuffer = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleBufferEnd = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-white text-xl truncate">
          {movieData?.title || movieData?.name || 'Now Playing'}
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Close video"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex-1" ref={playerWrapperRef}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true}
          pip={true}
          stopOnUnmount={true}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous",
                preload: "auto"
              },
              forceVideo: true,
              forceHLS: true,
              forceSafariHLS: true,
            }
          }}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        
        {isBuffering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="p-4 flex justify-between items-center bg-[#06202A]">
        <button
          onClick={handlePlayPause}
          className="text-white hover:text-gray-300 transition-colors px-4 py-2 rounded-lg bg-gray-800"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={toggleFullscreen}
          className="text-white hover:text-gray-300 transition-colors px-4 py-2 rounded-lg bg-gray-800"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
