import { MessageCircle, Zap, Sparkles } from "lucide-react";

const LandingHero = () => {
  return (
    <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 animate-slide-up px-2 sm:px-4">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-soft" />
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
            <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-foreground" />
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 animate-float" />
          </div>
        </div>
      </div>
      
      {/* App Name */}
      <h1 className="text-responsive-hero font-extrabold mb-2 sm:mb-3 md:mb-4 leading-tight">
        <span className="text-gradient-chutki">Chutkii</span>
        <span className="text-foreground">Chat</span>
      </h1>
      
      {/* Tagline */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary animate-sparkle" />
        <p className="text-responsive-lg text-muted-foreground font-medium">
          Chat in Chutkii, Disappear in Chutkii!
        </p>
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary animate-sparkle" />
      </div>
      
      {/* Description */}
      <p className="text-responsive-sm text-muted-foreground max-w-sm sm:max-w-md md:max-w-lg mx-auto leading-relaxed font-body px-2 sm:px-4">
        Start instant, anonymous conversations with just a 4-digit code. 
        No sign-ups, no history, no traces. Just pure, temporary chat magic.
      </p>
    </div>
  );
};

export default LandingHero;
