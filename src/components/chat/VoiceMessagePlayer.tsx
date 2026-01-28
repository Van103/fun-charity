import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration?: number;
  isOwnMessage?: boolean;
}

export function VoiceMessagePlayer({ audioUrl, duration = 0, isOwnMessage }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [waveformData] = useState<number[]>(() => 
    // Generate random waveform for visualization
    Array.from({ length: 25 }, () => 0.2 + Math.random() * 0.8)
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    });

    audio.addEventListener('canplay', () => {
      setIsLoading(false);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('waiting', () => {
      setIsLoading(true);
    });

    audio.addEventListener('playing', () => {
      setIsLoading(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * (totalDuration || audioRef.current.duration);
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div 
      className={`flex items-center gap-2 p-2 rounded-xl min-w-[180px] max-w-[280px] ${
        isOwnMessage 
          ? 'bg-primary/10' 
          : 'bg-muted/50'
      }`}
    >
      {/* Play/Pause button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlay}
        disabled={isLoading}
        className={`h-10 w-10 rounded-full shrink-0 ${
          isOwnMessage 
            ? 'hover:bg-primary/20 text-primary' 
            : 'hover:bg-muted text-foreground'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </Button>

      {/* Waveform and progress */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform visualization */}
        <div 
          ref={progressRef}
          onClick={handleProgressClick}
          className="flex items-center gap-px h-6 cursor-pointer"
        >
          {waveformData.map((value, index) => {
            const barProgress = (index / waveformData.length) * 100;
            const isPlayed = barProgress <= progress;
            
            return (
              <motion.div
                key={index}
                className={`w-1 rounded-full transition-colors ${
                  isPlayed 
                    ? isOwnMessage ? 'bg-primary' : 'bg-foreground'
                    : isOwnMessage ? 'bg-primary/30' : 'bg-muted-foreground/30'
                }`}
                style={{ height: `${value * 24}px` }}
                animate={isPlaying && isPlayed ? { 
                  scaleY: [1, 1.2, 1],
                } : {}}
                transition={{ 
                  duration: 0.3, 
                  repeat: isPlaying && isPlayed ? Infinity : 0,
                  delay: index * 0.02 
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}
