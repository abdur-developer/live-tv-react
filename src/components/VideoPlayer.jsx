// components/VideoPlayer.jsx - Complete Fixed Version
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader,
  AlertTriangle,
  Settings,
  PictureInPicture2,
  SkipForward,
  SkipBack,
  RefreshCw
} from 'lucide-react';

const VideoPlayer = ({ channel, onError, onLoad }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const progressRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [retryCount, setRetryCount] = useState(0);

  let controlsTimeout;

  // Initialize HLS
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    const initializePlayer = () => {
      // VideoPlayer.jsx - HLS initialization অংশে
      // VideoPlayer.jsx - HLS initialization section (লাইন ৫০-১০০ এর কাছাকাছি)

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false, // lowLatency বন্ধ রাখুন
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 20000,
          levelLoadingTimeOut: 20000,
          // User-Agent সেট করবেন না
          xhrSetup: function (xhr, url) {
            // শুধু এগুলো রাখুন
            xhr.withCredentials = false;
          }
        });

        // Error handling improve
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, retrying in 2s...');
                setTimeout(() => {
                  hls.startLoad();
                }, 2000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, recovering...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal error, cannot recover');
                setError('Stream temporarily unavailable');
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(channel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => { });
          onLoad?.();
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch(() => { });
          onLoad?.();
        });
      } else {
        setError('HLS not supported in this browser');
      }
    };

    initializePlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      clearTimeout(controlsTimeout);
    };
  }, [channel?.id]);

  // Keyboard events
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!channel) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => {
            const newVol = Math.min(1, prev + 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => {
            const newVol = Math.max(0, prev - 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [channel]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(() => { });
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!document.fullscreenElement) {
      container?.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.log('PiP not supported or denied');
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    if (video && rect.width > 0) {
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      video.currentTime = percentage * video.duration;
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        videoRef.current.duration || Infinity
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
  };

  const retryStream = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(channel.url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        videoRef.current?.play().catch(() => { });
        onLoad?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Stream failed to load. Please try again.');
          onError?.(data);
        }
      });

      hlsRef.current = hls;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying && !isHovering) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 group"
      onMouseEnter={() => { setIsHovering(true); showControlsTemporarily(); }}
      onMouseLeave={() => { setIsHovering(false); if (isPlaying) setShowControls(false); }}
      onMouseMove={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnd}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        crossOrigin="anonymous"
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
          <div className="relative">
            <div className="w-20 h-20 border-3 border-purple-500/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-full h-full border-3 border-transparent border-t-purple-500 rounded-full" />
            </div>
            <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white/90 font-medium text-lg">Loading Stream</p>
            <p className="text-white/50 text-sm mt-1">Please wait...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20 p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold mb-2">Stream Error</p>
            <p className="text-gray-400 text-sm">{error}</p>
            {retryCount > 0 && (
              <p className="text-gray-500 text-xs mt-2">Retry attempt: {retryCount}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              retryStream();
            }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-xl shadow-purple-500/30 cursor-pointer"
            type="button"
          >
            <RefreshCw className="w-5 h-5 pointer-events-none" />
            Retry Stream
          </button>
        </div>
      )}

      {/* Empty State */}
      {!channel && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 flex flex-col items-center justify-center gap-6 z-20">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
            <Play className="w-12 h-12 text-white/30" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white/80 mb-2">No Channel Selected</h3>
            <p className="text-gray-500">Choose a channel from the list to start watching</p>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-all duration-500 z-30 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
      >
        {/* Progress Bar */}
        <div className="px-4 mb-2">
          <div
            ref={progressRef}
            className="relative w-full h-2 bg-white/10 rounded-full cursor-pointer group/progress hover:h-3 transition-all"
            onClick={handleSeek}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Played */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-purple-500/50 opacity-0 group-hover/progress:opacity-100 transition-all"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Skip Backward */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                skipBackward();
              }}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all transform hover:scale-110 hidden sm:block cursor-pointer"
              title="Skip back 10s"
              type="button"
            >
              <SkipBack className="w-5 h-5 text-white pointer-events-none" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                togglePlay();
              }}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all transform hover:scale-110 cursor-pointer"
              type="button"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white pointer-events-none" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white pointer-events-none" />
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                skipForward();
              }}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all transform hover:scale-110 hidden sm:block cursor-pointer"
              title="Skip forward 10s"
              type="button"
            >
              <SkipForward className="w-5 h-5 text-white pointer-events-none" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/volume">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleMute();
                }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                type="button"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-white pointer-events-none" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white pointer-events-none" />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
            </div>

            {/* Time Display */}
            <span className="text-white/80 text-sm font-medium ml-2 tabular-nums select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quality Selector */}
            {levels.length > 1 && (
              <div className="relative group/quality">
                <button
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                  title="Quality"
                  type="button"
                >
                  <Settings className="w-5 h-5 text-white pointer-events-none" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 opacity-0 group-hover/quality:opacity-100 transition-all pointer-events-none group-hover/quality:pointer-events-auto min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeQuality(-1);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${currentLevel === -1 ? 'bg-purple-500/20 text-purple-400' : 'text-white hover:bg-white/10'
                      }`}
                    type="button"
                  >
                    Auto
                  </button>
                  {levels.map((level, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeQuality(index);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${currentLevel === index ? 'bg-purple-500/20 text-purple-400' : 'text-white hover:bg-white/10'
                        }`}
                      type="button"
                    >
                      {level.height}p
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Picture in Picture */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                togglePictureInPicture();
              }}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all hidden sm:block cursor-pointer"
              title="Picture in Picture"
              type="button"
            >
              <PictureInPicture2 className="w-5 h-5 text-white pointer-events-none" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleFullscreen();
              }}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title="Fullscreen"
              type="button"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white pointer-events-none" />
              ) : (
                <Maximize className="w-5 h-5 text-white pointer-events-none" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button */}
      {!isPlaying && !isLoading && !error && channel && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              togglePlay();
            }}
            className="p-8 bg-purple-500/90 hover:bg-purple-500 rounded-full transition-all transform hover:scale-110 shadow-2xl shadow-purple-500/50 group/play cursor-pointer"
            type="button"
          >
            <Play className="w-10 h-10 text-white fill-white transform translate-x-0.5 group-hover/play:scale-110 transition-transform pointer-events-none" />
          </button>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-gray-400">
          <p>Space: Play/Pause</p>
          <p>F: Fullscreen</p>
          <p>M: Mute</p>
          <p>←→: Seek</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;