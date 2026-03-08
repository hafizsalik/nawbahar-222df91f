import { MessageCircle, CheckCheck } from "lucide-react";
import { cn, toPersianNumber } from "@/lib/utils";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionDetailsModal } from "./ReactionDetailsModal";
import { REACTION_EMOJIS, type ReactionKey, type ReactionSummary } from "@/hooks/useCardReactions";
import { useState } from "react";

interface ArticleCardMetricsProps {
  articleId: string;
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  responseCount: number;
  isRead: boolean;
  commentsOpen: boolean;
  onCommentClick: (e: React.MouseEvent) => void;
  onResponseClick: (e: React.MouseEvent) => void;
  reactionSummary: ReactionSummary;
  onReact: (type: ReactionKey) => void;
  onReactionHover?: () => void;
}

export function ArticleCardMetrics({
  articleId,
  commentCount,
  reactionCount,
  isRead,
  commentsOpen,
  onCommentClick,
  reactionSummary,
  onReact,
  onReactionHover,
}: ArticleCardMetricsProps) {
  const { topTypes, totalCount, reactorNames, userReaction } = reactionSummary;
  const [showReactionDetails, setShowReactionDetails] = useState(false);

  const displayCount = totalCount > 0 ? totalCount : reactionCount;
  const displayTopTypes: ReactionKey[] = topTypes.length > 0
    ? topTypes.slice(0, 2)
    : (reactionCount > 0 ? ["like"] : []);

  const buildReactorText = () => {
    if (displayCount === 0) return null;
    if (totalCount === 0 && reactionCount > 0) return toPersianNumber(reactionCount);

    const names: string[] = [];
    if (userReaction) names.push("شما");
    reactorNames.forEach((n) => { if (!names.includes(n)) names.push(n); });

    if (names.length === 0) return toPersianNumber(displayCount);

    const shown = names.slice(0, 2);
    const remaining = Math.max(displayCount - shown.length, 0);
    let text = shown.join("، ");
    if (remaining > 0) text += ` و ${toPersianNumber(remaining)} نفر دیگر`;
    return text;
  };

  const reactorText = buildReactorText();

  const handleReactionSummaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReactionHover?.();
    setShowReactionDetails(true);
  };

  return (
    <>
      <div className="mt-3 pb-4">
        <div className="flex items-center justify-between">
          {/* Left: comment + reaction picker */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCommentClick}
              className={cn(
                "flex items-center gap-1 text-[12px] transition-colors",
                commentsOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle size={14} strokeWidth={1.5} />
              <span className="text-[11.5px]">
                {commentCount > 0 ? `${toPersianNumber(commentCount)} نظر` : "نظر"}
              </span>
            </button>

            <ReactionPicker
              userReaction={userReaction}
              onReact={onReact}
              onHover={onReactionHover}
            />
          </div>

          {/* Right: emoji summary + names */}
          <div className="flex items-center gap-1">
            {displayCount > 0 && (
              <button
                onClick={handleReactionSummaryClick}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                {displayTopTypes.length > 0 && (
                  <div className="flex items-center -space-x-1">
                    {displayTopTypes.map((type) => (
                      <span
                        key={type}
                        className="w-[17px] h-[17px] flex items-center justify-center rounded-full text-[10.5px] leading-none border-[1.5px] border-background"
                        style={{ background: "hsl(var(--muted))" }}
                        role="img"
                        aria-label={type}
                      >
                        {REACTION_EMOJIS[type]}
                      </span>
                    ))}
                  </div>
                )}
                {reactorText && (
                  <span className="text-[10px] text-muted-foreground/55 truncate max-w-[140px] mr-0.5">
                    {reactorText}
                  </span>
                )}
              </button>
            )}

            {isRead && (
              <CheckCheck size={12} strokeWidth={2} className="text-primary/35 mr-1" />
            )}
          </div>
        </div>
      </div>

      <ReactionDetailsModal
        articleId={articleId}
        isOpen={showReactionDetails}
        onClose={() => setShowReactionDetails(false)}
      />
    </>
  );
}
