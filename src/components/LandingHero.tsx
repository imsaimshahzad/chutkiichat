import { MessageCircle, Timer, Sparkles } from "lucide-react";

const LandingHero = () => {
  return (
    <div className="text-center mb-8 sm:mb-12 animate-slide-up px-2">
      {/* Logo */}
      <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-soft" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent flex items-center justify-center animate-pulse-soft">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground" />
            </div>
          </div>
        </div>
      </div>
      
      {/* App Name */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 sm:mb-4">
        <span className="text-gradient-chutki">Chutkii</span>
        <span className="text-foreground">Chat</span>
      </h1>
      
      {/* Tagline */}
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse-soft" />
        <p className="text-base sm:text-lg md:text-xl text-foreground font-semibold">
          Chutki. Chat. <span className="text-primary">Chup.</span>
        </p>
        <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse-soft" />
      </div>
      
      {/* Description */}
      <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed font-body px-4">
        Chutki mein chat, chutki mein gayab! No accounts, no traces—just quick, 
        private chats that vanish in a snap. Share a code, start talking.
      </p>
    </div>
  );
};

export default LandingHero;
