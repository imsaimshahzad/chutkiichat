import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import CreateSession from "@/components/CreateSession";
import JoinSession from "@/components/JoinSession";
import { MessageCircle, Shield, Clock, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4">
        {/* Background decoration - hidden on mobile for performance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 hidden sm:block">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto">
          <LandingHero />

          {/* Main Cards */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center lg:items-stretch mb-10 sm:mb-16 px-1">
            <CreateSession />
            <JoinSession />
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 px-1">
            <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">Instant</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">No sign-up needed</p>
            </div>
            
            <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">Anonymous</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">No identity required</p>
            </div>
            
            <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">Temporary</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Rooms auto-expire</p>
            </div>
            
            <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "600ms" }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">Real-time</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Instant messaging</p>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-muted-foreground text-xs sm:text-sm animate-fade-in px-4">
            <p className="font-medium">No accounts. No history. Just chat.</p>
            <p className="mt-1 text-xs opacity-60">Messages disappear after 24 hours of inactivity</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
