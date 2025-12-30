import { Link } from "react-router-dom";
import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import CreateSession from "@/components/CreateSession";
import JoinSession from "@/components/JoinSession";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, Clock, Zap, UserCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] liquid-bg">
      <Header />
      
      <main className="pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-12 px-3 sm:px-4 md:px-6">
        {/* Background decoration - hidden on mobile for performance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 hidden md:block">
          <div className="absolute top-20 left-10 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-10 w-64 md:w-80 lg:w-96 h-64 md:h-80 lg:h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[500px] lg:w-[600px] h-[400px] md:h-[500px] lg:h-[600px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="content-centered">
          <LandingHero />

          {/* Main Cards */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 justify-center items-center lg:items-stretch mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <CreateSession />
            <JoinSession />
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-responsive-sm mb-0.5 sm:mb-1">Instant</h3>
              <p className="text-responsive-xs text-muted-foreground">No sign-up needed</p>
            </div>
            
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-responsive-sm mb-0.5 sm:mb-1">Anonymous</h3>
              <p className="text-responsive-xs text-muted-foreground">No identity required</p>
            </div>
            
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-responsive-sm mb-0.5 sm:mb-1">Temporary</h3>
              <p className="text-responsive-xs text-muted-foreground">Rooms auto-expire</p>
            </div>
            
            <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center animate-fade-in" style={{ animationDelay: "600ms" }}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-responsive-sm mb-0.5 sm:mb-1">Real-time</h3>
              <p className="text-responsive-xs text-muted-foreground">Instant messaging</p>
            </div>
          </div>

          {/* Full Chat CTA */}
          <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "700ms" }}>
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h3 className="font-bold text-responsive-lg text-foreground">Want Permanent Chats?</h3>
            </div>
            <p className="text-muted-foreground text-responsive-sm mb-3 sm:mb-4 max-w-md mx-auto">
              Create an account to save contacts and keep your chat history forever!
            </p>
            <Link to="/auth">
              <Button className="chutki-button">
                Sign Up for Full Chat
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <footer className="text-center text-muted-foreground text-responsive-xs animate-fade-in px-4">
            <p className="font-medium">No accounts. No history. Just chat.</p>
            <p className="mt-1 opacity-60">Messages disappear after 24 hours of inactivity</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
