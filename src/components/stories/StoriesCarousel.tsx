import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { StoryRing } from "./StoryRing";
import { StoryViewer } from "./StoryViewer";
import { CreateStoryModal } from "./CreateStoryModal";
import { useStories } from "@/hooks/useStories";

interface StoriesCarouselProps {
  currentUserId?: string | null;
  currentUserProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function StoriesCarousel({ currentUserId, currentUserProfile }: StoriesCarouselProps) {
  const { t } = useLanguage();
  const { usersWithStories, myStories, isLoading, refetchStories, createStory } = useStories();
  
  const [showViewer, setShowViewer] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleStoryClick = (userIndex: number) => {
    setViewerStartIndex(userIndex);
    setShowViewer(true);
  };

  const handleAddStoryClick = () => {
    setShowCreateModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasMyStory = myStories.length > 0;
  const myUserData = usersWithStories.find(u => u.user_id === currentUserId);

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-3 p-4 pb-2">
          {/* Add Story / My Story */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              {hasMyStory ? (
                <button
                  onClick={() => myUserData && handleStoryClick(usersWithStories.indexOf(myUserData)) }
                  className="focus:outline-none"
                >
                  <StoryRing hasUnviewed={false} isOwn>
                    <Avatar className="h-14 w-14 border-2 border-background">
                      <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {currentUserProfile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </StoryRing>
                </button>
              ) : (
                <button
                  onClick={handleAddStoryClick}
                  className="focus:outline-none"
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-dashed border-primary/50">
                      <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {currentUserProfile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1"
                    >
                      <Plus className="h-3 w-3" />
                    </motion.div>
                  </div>
                </button>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground max-w-[60px] truncate">
              {hasMyStory ? (t('stories.yourStory') || 'Your Story') : (t('stories.addStory') || 'Add Story')}
            </span>
          </div>

          {/* Other users' stories */}
          {usersWithStories
            .filter(u => u.user_id !== currentUserId)
            .map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-1"
              >
                <button
                  onClick={() => {
                    const actualIndex = usersWithStories.findIndex(u => u.user_id === user.user_id);
                    handleStoryClick(actualIndex);
                  }}
                  className="focus:outline-none"
                >
                  <StoryRing hasUnviewed={user.has_unviewed}>
                    <Avatar className="h-14 w-14 border-2 border-background">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted">
                        {user.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </StoryRing>
                </button>
                <span className="text-[10px] text-muted-foreground max-w-[60px] truncate">
                  {user.full_name || 'User'}
                </span>
              </motion.div>
            ))}

          {/* Empty state */}
          {usersWithStories.length === 0 && !hasMyStory && (
            <div className="flex items-center justify-center py-4 px-8">
              <p className="text-sm text-muted-foreground text-center">
                {t('stories.noStories') || 'No stories yet. Be the first to share!'}
              </p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Story Viewer */}
      {showViewer && (
        <StoryViewer
          users={usersWithStories}
          startIndex={viewerStartIndex}
          onClose={() => setShowViewer(false)}
          currentUserId={currentUserId}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetchStories();
          setShowCreateModal(false);
        }}
      />
    </>
  );
}
