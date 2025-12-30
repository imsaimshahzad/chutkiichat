import { MessageCircle, Zap, Sparkles } from "lucide-react";

const LandingHero = () => {
  return (
    <div className="text-center mb-12 animate-slide-up">
      {/* Logo */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-soft" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
            <Zap className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-float" />
          </div>
        </div>
      </div>
      
      {/* App Name */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
        <span className="text-gradient-chutki">Chutkii</span>
        <span className="text-foreground">Chat</span>
      </h1>
      
      {/* Tagline */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary animate-sparkle" />
        <p className="text-lg md:text-xl text-muted-foreground font-medium">
          Chat in Chutki, Disappear in Chutki!
        </p>
        <Sparkles className="w-5 h-5 text-primary animate-sparkle" />
      </div>
      
      {/* Description */}
      <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed font-body">
        Start instant, anonymous conversations with just a 4-digit code. 
        No sign-ups, no history, no traces. Just pure, temporary chat magic.
      </p>
    </div>
  );
};

export default LandingHero;
