import { Zap, Timer, Ghost } from "lucide-react";

const LandingHero = () => {
  return (
    <div className="text-center mb-8 sm:mb-12 animate-slide-up px-2">
      {/* Logo */}
      <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse-soft" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flash-gradient flex items-center justify-center shadow-lg flash-glow">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground animate-lightning" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent flex items-center justify-center animate-float">
            <span className="text-[8px] sm:text-[10px] font-bold text-accent-foreground">⚡</span>
          </div>
        </div>
      </div>
      
      {/* App Name */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 sm:mb-4">
        <span className="flash-text">Flash</span>
        <span className="text-foreground">Chat</span>
      </h1>
      
      {/* Tagline */}
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-lightning" />
        <p className="text-base sm:text-lg md:text-xl text-foreground/80 font-medium">
          Chat Fast. Vanish Faster.
        </p>
        <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-float" />
      </div>
      
      {/* Description */}
      <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed px-4">
        Start instant, anonymous conversations with just a 4-digit code. 
        No sign-ups, no history, no traces. Messages disappear like they never existed.
      </p>
      
      {/* Visual indicators */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <Timer className="w-3.5 h-3.5 text-primary" />
          <span>24h auto-delete</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <Ghost className="w-3.5 h-3.5 text-accent" />
          <span>Zero traces</span>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
