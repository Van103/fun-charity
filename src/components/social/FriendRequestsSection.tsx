import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, UserPlus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface FriendRequest {
  id: string;
  userName: string;
  avatar?: string;
  mutualFriends: number;
  verified?: boolean;
}

const mockRequests: FriendRequest[] = [
  { id: "1", userName: "Anh Elgon", mutualFriends: 25, verified: true },
  { id: "2", userName: "Na Trần", mutualFriends: 2, verified: true },
  { id: "3", userName: "Nông Liên", mutualFriends: 20, verified: true },
  { id: "4", userName: "Trần Tâm", mutualFriends: 20, verified: true },
];

const mockSuggestions: FriendRequest[] = [
  { id: "5", userName: "Khôi Phan", mutualFriends: 26, verified: true },
  { id: "6", userName: "Thu Thanh Hoàng", mutualFriends: 22, verified: true },
  { id: "7", userName: "Phạm Hằng", mutualFriends: 2, verified: true },
  { id: "8", userName: "Trang Huyền", mutualFriends: 11 },
];

// Helper to get cover image style
const getCoverStyle = (index: number) => {
  const gradients = [
    "bg-gradient-to-br from-purple-500/40 to-pink-500/40",
    "bg-gradient-to-br from-blue-500/40 to-purple-500/40",
    "bg-gradient-to-br from-amber-500/40 to-orange-500/40",
    "bg-gradient-to-br from-emerald-500/40 to-teal-500/40",
  ];
  return gradients[index % gradients.length];
};

export function FriendRequestsSection() {
  return (
    <div className="space-y-6">
      {/* Friend Requests */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Lời mời kết bạn</h3>
          <button className="text-sm text-secondary hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {mockRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 w-36 rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm"
            >
              {/* Cover photo area */}
              <div className={`h-16 ${getCoverStyle(index)} relative`}>
                {/* Avatar positioned at bottom of cover */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="p-0.5 rounded-full bg-gradient-to-br from-secondary to-secondary-light">
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback className="bg-primary/10 text-base">
                        {request.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 pb-3 px-2 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-medium text-sm truncate max-w-full">
                    {request.userName}
                  </span>
                  {request.verified && <span className="text-secondary text-xs">💜</span>}
                </div>
                <span className="text-xs text-muted-foreground mb-2">
                  {request.mutualFriends} bạn chung
                </span>
                <div className="flex flex-col gap-1.5 w-full px-1">
                  <Button size="sm" className="w-full h-7 text-xs bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Xác nhận
                  </Button>
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                    Xóa
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Navigation arrow */}
          <button className="shrink-0 w-8 h-8 self-center rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* People You May Know */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Những người bạn có thể biết</h3>
          <button className="text-sm text-secondary hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {mockSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 w-36 rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm relative"
            >
              {/* Remove button */}
              <button className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
              
              {/* Cover photo area */}
              <div className={`h-16 ${getCoverStyle(index + 2)} relative`}>
                {/* Avatar positioned at bottom of cover */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="p-0.5 rounded-full bg-gradient-to-br from-secondary to-secondary-light">
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={suggestion.avatar} />
                      <AvatarFallback className="bg-primary/10 text-base">
                        {suggestion.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 pb-3 px-2 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-medium text-sm truncate max-w-full">
                    {suggestion.userName}
                  </span>
                  {suggestion.verified && <span className="text-secondary text-xs">💜</span>}
                </div>
                <span className="text-xs text-muted-foreground mb-2">
                  {suggestion.mutualFriends} bạn chung
                </span>
                <Button size="sm" variant="outline" className="w-full h-7 text-xs px-2">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Thêm bạn bè
                </Button>
              </div>
            </motion.div>
          ))}
          
          {/* Navigation arrow */}
          <button className="shrink-0 w-8 h-8 self-center rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
