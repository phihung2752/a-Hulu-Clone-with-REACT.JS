import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { XMarkIcon } from '@heroicons/react/24/solid';

const VideoPlayer = ({ videoUrl, movieData, onClose, autoPlay = false }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const playerRef = useRef(null);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (isFullscreen) {
                    document.exitFullscreen();
                } else {
                    onClose();
                }
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('keydown', handleEsc);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isFullscreen, onClose]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            playerRef.current.wrapper.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    if (!videoUrl) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex justify-end p-4">
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-grow relative">
                <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    controls={true}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    config={{
                        youtube: {
                            playerVars: {
                                modestbranding: 1,
                                rel: 0
                            }
                        }
                    }}
                />
            </div>

            <div className="p-4 flex justify-center space-x-4">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
            </div>
        </div>
    );
};

export default VideoPlayer;
