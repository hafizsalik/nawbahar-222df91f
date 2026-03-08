import { Eye, MessageCircle, ThumbsDown, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardMetricsProps {
  viewCount: number;
  commentCount: number;
  responseCount: number;
  isRead: boolean;
  commentsOpen: boolean;
  tag?: string | null;
  onCommentClick: (e: React.MouseEvent) => void;
  onResponseClick: (e: React.MouseEvent) => void;
}

export function ArticleCardMetrics({
  viewCount,
  commentCount,
  isRead,
  commentsOpen,
  tag,
  onCommentClick,
}: ArticleCardMetricsProps) {
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        {/* Left: subtle filled icons */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[11px] text-foreground/50">
            <Eye size={14} strokeWidth={0} fill="currentColor" />
            {viewCount > 0 && <span>{viewCount}</span>}
          </span>

          <button
            onClick={onCommentClick}
            className={cn(
              "flex items-center gap-1 text-[11px] transition-colors",
              commentsOpen
                ? "text-foreground/60"
                : "text-foreground/50 hover:text-foreground/60"
            )}
          >
            <MessageCircle size={14} strokeWidth={0} fill="currentColor" />
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>

          <button
            onClick={stop}
            className="text-foreground/50 hover:text-foreground/60 transition-colors"
          >
            <ThumbsDown size={13} strokeWidth={0} fill="currentColor" />
          </button>

          {isRead && (
            <CheckCheck size={12} strokeWidth={2.2} className="text-primary/40" />
          )}
        </div>

        {/* Right: tag */}
        {tag && (
          <span className="bg-secondary/50 text-muted-foreground/50 px-2.5 py-[3px] rounded-full text-[10px] font-medium">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}