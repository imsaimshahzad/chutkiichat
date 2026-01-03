import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const SessionCard = ({ children, className, delay = 0 }: SessionCardProps) => {
  return (
    <div 
      className={cn(
        "liquid-glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md animate-slide-up hover:scale-[1.02] transition-transform duration-300",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SessionCard;
