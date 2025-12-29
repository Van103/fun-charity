import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  Clock, ChevronRight, History
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

interface CallSession {
  id: string;
  conversation_id: string;
  caller_id: string;
  call_type: "video" | "audio";
  status: string;
  started_at: string;
  ended_at: string | null;
  callerProfile?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  otherProfile?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  isOutgoing: boolean;
}

interface CallHistoryCardProps {
  userId: string | null;
  limit?: number;
  showViewAll?: boolean;
}

export function CallHistoryCard({ userId, limit = 10, showViewAll = true }: CallHistoryCardProps) {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchCallHistory = async () => {
      try {
        // Fetch conversations where user is a participant
        const { data: conversations, error: convError } = await supabase
          .from("conversations")
          .select("id, participant1_id, participant2_id")
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

        if (convError || !conversations?.length) {
          setLoading(false);
          return;
        }

        const conversationIds = conversations.map(c => c.id);

        // Fetch call sessions for these conversations
        const { data: callSessions, error: callError } = await supabase
          .from("call_sessions")
          .select("*")
          .in("conversation_id", conversationIds)
          .order("started_at", { ascending: false })
          .limit(limit);

        if (callError || !callSessions?.length) {
          setLoading(false);
          return;
        }

        // Get all unique user IDs from calls and conversations
        const userIds = new Set<string>();
        callSessions.forEach(call => userIds.add(call.caller_id));
        conversations.forEach(conv => {
          userIds.add(conv.participant1_id);
          userIds.add(conv.participant2_id);
        });

        // Fetch profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", Array.from(userIds));

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const convMap = new Map(conversations.map(c => [c.id, c]));

        // Build call history with user info
        const enrichedCalls: CallSession[] = callSessions.map(call => {
          const conv = convMap.get(call.conversation_id);
          const isOutgoing = call.caller_id === userId;
          
          // Find the other user in the conversation
          let otherUserId: string | null = null;
          if (conv) {
            otherUserId = conv.participant1_id === userId 
              ? conv.participant2_id 
              : conv.participant1_id;
          }

          return {
            id: call.id,
            conversation_id: call.conversation_id,
            caller_id: call.caller_id,
            call_type: call.call_type as "video" | "audio",
            status: call.status,
            started_at: call.started_at,
            ended_at: call.ended_at,
            callerProfile: profileMap.get(call.caller_id) || undefined,
            otherProfile: otherUserId ? profileMap.get(otherUserId) : undefined,
            isOutgoing
          };
        });

        setCalls(enrichedCalls);
      } catch (error) {
        console.error("Error fetching call history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, [userId, limit]);

  const getCallIcon = (call: CallSession) => {
    if (call.status === "declined" || call.status === "no_answer") {
      return <PhoneMissed className="w-4 h-4 text-destructive" />;
    }
    if (call.isOutgoing) {
      return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
    }
    return <PhoneIncoming className="w-4 h-4 text-primary" />;
  };

  const getCallStatus = (status: string) => {
    switch (status) {
      case "completed":
      case "ended":
        return { label: "Đã kết thúc", variant: "secondary" as const };
      case "active":
        return { label: "Đang gọi", variant: "default" as const };
      case "declined":
        return { label: "Đã từ chối", variant: "destructive" as const };
      case "no_answer":
        return { label: "Không trả lời", variant: "destructive" as const };
      case "pending":
        return { label: "Đang chờ", variant: "outline" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  const getCallDuration = (call: CallSession) => {
    if (!call.ended_at || call.status === "declined" || call.status === "no_answer") {
      return null;
    }
    const start = new Date(call.started_at).getTime();
    const end = new Date(call.ended_at).getTime();
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Lịch sử cuộc gọi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (calls.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Lịch sử cuộc gọi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có cuộc gọi nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Lịch sử cuộc gọi
          </CardTitle>
          {showViewAll && calls.length > 5 && (
            <Link to="/messages?tab=calls">
              <Button variant="ghost" size="sm" className="text-primary">
                Xem tất cả
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {calls.slice(0, showViewAll ? 5 : limit).map((call) => {
          const displayProfile = call.isOutgoing ? call.otherProfile : call.callerProfile;
          const statusInfo = getCallStatus(call.status);
          const duration = getCallDuration(call);

          return (
            <div
              key={call.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={displayProfile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                    {displayProfile?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card">
                  {call.call_type === "video" ? (
                    <Video className="w-3 h-3 text-primary" />
                  ) : (
                    <Phone className="w-3 h-3 text-primary" />
                  )}
                </div>
              </div>

              {/* Call info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getCallIcon(call)}
                  <span className="font-medium text-sm truncate">
                    {displayProfile?.full_name || "Người dùng"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(call.started_at), {
                      addSuffix: true,
                      locale: vi
                    })}
                  </span>
                  {duration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {duration}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <Badge variant={statusInfo.variant} className="text-xs shrink-0">
                {statusInfo.label}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
