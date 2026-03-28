import { ThumbsUp, Heart, Smile, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReactionKey = "like" | "love" | "funny" | "fire" | "star";

const reactionIcons: Record<ReactionKey, any> = {
  like: ThumbsUp,
  love: Heart,
  funny: Smile,
  fire: Flame,
  star: Star,
};

interface Props {
  userReaction?: ReactionKey | null;
  onReact: (type: ReactionKey) => void;
  topTypes: ReactionKey[];
  summaryText?: string;
  onSummaryClick?: () => void;
}

export function ReactionPicker({
  userReaction,
  onReact,
  topTypes,
  summaryText,
  onSummaryClick,
}: Props) {
  return (
    <div className="flex items-center gap-2">

      {/* Reaction buttons */}
      <div className="flex items-center gap-1">
        {Object.entries(reactionIcons).map(([key, Icon]) => {
          const active = userReaction === key;

          return (
            <button
              key={key}
              onClick={() => onReact(key as ReactionKey)}
              className={cn(
                "p-1.5 rounded-full transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={16} strokeWidth={1.8} />
            </button>
          );
        })}
      </div>

      {/* Summary text */}
      {summaryText && (
        <button
          onClick={onSummaryClick}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          {summaryText}
        </button>
      )}
    </div>
  );
}
