import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStories } from "@/hooks/useStories";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  duration: number;
  created_at: string;
  is_viewed?: boolean;
}

interface UserWithStories {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  stories: Story[];
  has_unviewed: boolean;
}

interface StoryViewerProps {
  users: UserWithStories[];
  startIndex: number;
  onClose: () => void;
  currentUserId?: string | null;
}

export function StoryViewer({ users, startIndex, onClose, currentUserId }: StoryViewerProps) {
  const { t, language } = useLanguage();
  const { viewStory, deleteStory } = useStories();
  const dateLocale = language === 'vi' ? vi : enUS;

  const [currentUserIndex, setCurrentUserIndex] = useState(startIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reply, setReply] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const currentUser = users[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const isOwnStory = currentUser?.user_id === currentUserId;
  const storyDuration = (currentStory?.duration || 5) * 1000; // Convert to ms

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !currentStory.is_viewed && !isOwnStory) {
      viewStory(currentStory.id);
    }
  }, [currentStory?.id]);

  // Progress timer
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const startTime = Date.now();
    const initialProgress = progress;

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = initialProgress + (elapsed / storyDuration) * 100;

      if (newProgress >= 100) {
        goToNextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentStoryIndex, currentUserIndex, isPaused, currentStory]);

  const goToNextStory = useCallback(() => {
    if (!currentUser) return;

    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Next story of same user
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < users.length - 1) {
      // Next user
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // End of all stories
      onClose();
    }
  }, [currentUser, currentStoryIndex, currentUserIndex, users.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      // Previous story of same user
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      // Previous user (go to their last story)
      const prevUser = users[currentUserIndex - 1];
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(prevUser.stories.length - 1);
      setProgress(0);
    }
  }, [currentStoryIndex, currentUserIndex, users]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      goToPrevStory();
    } else if (x > (width * 2) / 3) {
      goToNextStory();
    } else {
      setIsPaused(prev => !prev);
    }
  };

  const handleDrag = (e: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (currentStory && isOwnStory) {
      await deleteStory(currentStory.id);
      goToNextStory();
    }
  };

  if (!currentUser || !currentStory) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Story content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDrag}
        className="relative w-full h-full max-w-md mx-auto"
      >
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
          {currentUser.stories.map((story, index) => (
            <div key={story.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{
                  width: index < currentStoryIndex 
                    ? '100%' 
                    : index === currentStoryIndex 
                      ? `${progress}%` 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-2 right-2 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={currentUser.avatar_url || undefined} />
              <AvatarFallback className="bg-white/20 text-white">
                {currentUser.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-sm">
                {currentUser.full_name || 'User'}
              </p>
              <p className="text-white/70 text-xs">
                {formatDistanceToNow(new Date(currentStory.created_at), { 
                  addSuffix: true, 
                  locale: dateLocale 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPaused(prev => !prev)}
              className="text-white hover:bg-white/20"
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>

            {isOwnStory && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete') || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Media content */}
        <div 
          className="w-full h-full flex items-center justify-center"
          onClick={handleTap}
        >
          {currentStory.media_type === 'video' ? (
            <video
              src={currentStory.media_url}
              className="w-full h-full object-contain"
              autoPlay
              muted={false}
              playsInline
              onEnded={goToNextStory}
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt=""
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4 z-20">
            <p className="text-white text-center text-sm bg-black/30 backdrop-blur-sm rounded-lg p-3">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Reply input (for other users' stories) */}
        {!isOwnStory && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t('stories.replyToStory') || 'Reply to story...'}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={!reply.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Navigation arrows (desktop) */}
        {currentUserIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 hidden md:flex"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {currentUserIndex < users.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 hidden md:flex"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
