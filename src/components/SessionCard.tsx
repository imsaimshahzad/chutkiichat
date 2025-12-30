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
        "relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md animate-slide-up shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl sm:rounded-3xl pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SessionCard;
