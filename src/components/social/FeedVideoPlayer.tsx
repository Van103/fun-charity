import { useState, useRef, useEffect, useCallback, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedVideoPlayerProps {
  src: string;
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
}

export function FeedVideoPlayer({ src, className, aspectRatio = "auto" }: FeedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSkipIndicator, setShowSkipIndicator] = useState<"forward" | "backward" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer to auto-pause when scrolling away
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
          setIsVisible(visible);
          
          if (!visible && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin: '0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update time progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetControlsTimeout();
  }, []);

  // Skip forward/backward
  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    video.currentTime = newTime;
    setShowSkipIndicator(seconds > 0 ? "forward" : "backward");
    setTimeout(() => setShowSkipIndicator(null), 500);
    resetControlsTimeout();
  }, []);

  // Seek to position
  const seekTo = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = (clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(1, pos)) * video.duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // Handle progress bar drag
  const handleProgressDragStart = () => {
    setIsDragging(true);
  };

  const handleProgressDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      seekTo(e);
    }
  };

  const handleProgressDragEnd = () => {
    setIsDragging(false);
  };

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setShowControls(true);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleContainerClick = () => {
    if (!showControls) {
      setShowControls(true);
      resetControlsTimeout();
    } else {
      togglePlay();
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen?.();
    }
  };

  // Calculate progress
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const aspectClass = aspectRatio === "video" 
    ? "aspect-video" 
    : aspectRatio === "square" 
      ? "aspect-square" 
      : "";

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black group overflow-hidden",
        aspectClass,
        className
      )}
      onClick={handleContainerClick}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        preload="metadata"
      />

      {/* Skip Indicators */}
      <AnimatePresence>
        {showSkipIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 bg-black/70 rounded-full p-4",
              showSkipIndicator === "forward" ? "right-8" : "left-8"
            )}
          >
            {showSkipIndicator === "forward" ? (
              <RotateCw className="w-8 h-8 text-white" />
            ) : (
              <RotateCcw className="w-8 h-8 text-white" />
            )}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium">
              10s
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          >
            {/* Center Play/Pause */}
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              {/* Backward 10s */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipTime(-10);
                }}
                className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-4 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </button>

              {/* Forward 10s */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipTime(10);
                }}
                className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <RotateCw className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="relative h-1 bg-white/30 rounded-full cursor-pointer group/progress"
                onClick={(e) => {
                  e.stopPropagation();
                  seekTo(e);
                }}
                onMouseDown={handleProgressDragStart}
                onMouseMove={handleProgressDrag}
                onMouseUp={handleProgressDragEnd}
                onMouseLeave={handleProgressDragEnd}
                onTouchStart={handleProgressDragStart}
                onTouchMove={handleProgressDrag}
                onTouchEnd={handleProgressDragEnd}
              >
                {/* Buffer background */}
                <div className="absolute inset-0 bg-white/20 rounded-full" />
                
                {/* Progress fill */}
                <div 
                  className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Thumb */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>

              {/* Time & Controls Row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  {/* Time Display */}
                  <span className="text-xs font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mute */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
