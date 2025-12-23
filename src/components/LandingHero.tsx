import { MessageCircle, Sparkles } from "lucide-react";

const LandingHero = () => {
  return (
    <div className="text-center mb-12 animate-slide-up">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse-soft" />
          <MessageCircle className="w-12 h-12 text-primary relative z-10" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold">
          <span className="text-gradient-primary">Chutki</span>
          <span className="text-foreground">Chat</span>
        </h1>
        <Sparkles className="w-6 h-6 text-accent animate-float" />
      </div>
      
      <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed">
        Anonymous. Temporary. Secure.
        <br />
        <span className="text-foreground/80">Chat without leaving a trace.</span>
      </p>
    </div>
  );
};

export default LandingHero;
