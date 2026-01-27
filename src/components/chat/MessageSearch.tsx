import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Loader2,
  ArrowLeft 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  senderProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MessageSearchProps {
  conversationId: string;
  onMessageSelect: (messageId: string) => void;
  onClose: () => void;
}

export function MessageSearch({
  conversationId,
  onMessageSelect,
  onClose,
}: MessageSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search messages
  const searchMessages = useCallback(async () => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, sender_id")
        .eq("conversation_id", conversationId)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch sender profiles
        const senderIds = [...new Set(data.map((m) => m.sender_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", senderIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.user_id, p]) || []
        );

        const enrichedResults = data.map((msg) => ({
          ...msg,
          senderProfile: profileMap.get(msg.sender_id),
        }));

        setResults(enrichedResults);
        setCurrentIndex(0);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, conversationId]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(searchMessages, 300);
    return () => clearTimeout(timer);
  }, [searchMessages]);

  // Navigate to previous result
  const goToPrevious = () => {
    if (results.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
    setCurrentIndex(newIndex);
    onMessageSelect(results[newIndex].id);
  };

  // Navigate to next result
  const goToNext = () => {
    if (results.length === 0) return;
    const newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onMessageSelect(results[newIndex].id);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) {
      onMessageSelect(results[currentIndex].id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      goToNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-x-0 top-0 z-50 bg-card border-b border-border shadow-lg"
    >
      {/* Search Header */}
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("messages.searchInConversation")}
            className="pl-10 pr-10 h-10 rounded-full bg-muted/50 border-0"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation buttons */}
        {results.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
              {currentIndex + 1} / {results.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="h-8 w-8"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="h-8 w-8"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {query.length >= 2 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <ScrollArea className="max-h-64">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  {t("messages.noResultsFound")}
                </div>
              ) : (
                <div className="py-2">
                  {results.map((msg, index) => (
                    <button
                      key={msg.id}
                      onClick={() => {
                        setCurrentIndex(index);
                        onMessageSelect(msg.id);
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                        index === currentIndex ? "bg-primary/10" : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage
                          src={msg.senderProfile?.avatar_url || ""}
                        />
                        <AvatarFallback className="text-xs">
                          {msg.senderProfile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">
                            {msg.senderProfile?.full_name || t("messages.user")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), {
                              locale: vi,
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {highlightMatch(msg.content)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
