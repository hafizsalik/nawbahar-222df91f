import { Bell, Moon, Sun, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { cn, toPersianNumber } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Enhanced Notifications Button Component
interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ unreadCount, onClick, className }: NotificationBellProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onClick?.();
  };

  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        hasUnread 
          ? "bg-gradient-to-br from-primary/20 to-accent/20 text-primary hover:from-primary/30 hover:to-accent/30" 
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        isHovered && "scale-105 shadow-sm",
        isPressed && "scale-95",
        className
      )}
      aria-label={`اعلان‌ها${hasUnread ? ` - ${toPersianNumber(unreadCount)} خوانده نشده` : ''}`}
    >
      {/* Background pulse animation for unread */}
      {hasUnread && (
        <span className="absolute inset-0 rounded-xl animate-pulse bg-primary/10" />
      )}
      
      {/* Bell icon with ring animation */}
      <div className={cn(
        "relative transition-transform duration-300",
        isHovered && hasUnread && "animate-wiggle"
      )}>
        <Bell 
          size={20} 
          strokeWidth={hasUnread ? 2 : 1.5}
          className={cn(
            "transition-all duration-300",
            hasUnread ? "fill-primary/20" : ""
          )}
        />
        
        {/* Notification dot */}
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-ping" />
        )}
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <span className={cn(
          "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center",
          "text-[9px] font-bold text-white rounded-full px-1",
          "bg-gradient-to-br from-destructive to-destructive/80",
          "shadow-sm ring-2 ring-background transition-transform duration-200",
          isHovered && "scale-110"
        )}>
          {unreadCount > 9 ? "۹+" : toPersianNumber(unreadCount)}
        </span>
      )}

      {/* Tooltip hint on hover */}
      {isHovered && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-foreground text-background px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 animate-fade-in pointer-events-none">
          {hasUnread ? `${toPersianNumber(unreadCount)} اعلان جدید` : "اعلانات"}
        </span>
      )}
    </button>
  );
}

// Enhanced Theme Toggle Component
interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export function ThemeToggle({ isDark, onToggle, className }: ThemeToggleProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isDark 
          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30" 
          : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30",
        isPressed && "scale-95",
        className
      )}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
    >
      {/* Background glow effect */}
      <span className={cn(
        "absolute inset-0 rounded-xl blur-md opacity-0 transition-opacity duration-300",
        isDark ? "bg-indigo-500/20" : "bg-amber-500/20",
        "group-hover:opacity-100"
      )} />

      {/* Icon container with rotation */}
      <span className={cn(
        "relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-500",
        isDark ? "bg-indigo-500/30 rotate-0" : "bg-amber-500/30 rotate-0"
      )}>
        {isDark ? (
          <Moon 
            size={14} 
            strokeWidth={2} 
            className="text-indigo-400 transition-all duration-500 group-hover:scale-110"
          />
        ) : (
          <Sun 
            size={14} 
            strokeWidth={2} 
            className="text-amber-500 transition-all duration-500 group-hover:scale-110"
          />
        )}
      </span>

      {/* Label with slide animation */}
      <span className={cn(
        "relative text-[11px] font-medium transition-all duration-300 overflow-hidden",
        isDark ? "text-indigo-300" : "text-amber-600"
      )}>
        <span className="flex items-center gap-1">
          {isDark ? "🌙 تاریک" : "☀️ روشن"}
        </span>
      </span>

      {/* Toggle indicator */}
      <span className={cn(
        "absolute right-2 w-1.5 h-1.5 rounded-full transition-all duration-300",
        isDark ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
      )} />
    </button>
  );
}

// Logout Confirmation Dialog
interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md border-destructive/20" 
        dir="rtl"
      >
        <DialogHeader className="space-y-3">
          {/* Warning Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          
          <DialogTitle className="text-center text-lg font-semibold text-destructive">
            خروج از حساب کاربری
          </DialogTitle>
          
          <DialogDescription className="text-center text-sm leading-relaxed">
            آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            <br />
            <span className="text-muted-foreground text-xs">
              پس از خروج، برای دسترسی مجدد باید وارد شوید.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11"
          >
            انصراف
          </Button>
          
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                در حال خروج...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 ml-2" />
                تأیید خروج
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add CSS animation keyframes
export const enhancedButtonStyles = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }
  
  .animate-wiggle {
    animation: wiggle 0.5s ease-in-out;
  }
`;

export default { NotificationBell, ThemeToggle, LogoutConfirmDialog };
