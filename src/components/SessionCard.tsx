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
        "glass-card p-8 w-full max-w-md animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default SessionCard;
