import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import CreateSession from "@/components/CreateSession";
import JoinSession from "@/components/JoinSession";
import { MessageCircle, Shield, Clock, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto">
          <LandingHero />

          {/* Main Cards */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-center lg:items-stretch mb-16">
            <CreateSession />
            <JoinSession />
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card rounded-2xl p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Instant</h3>
              <p className="text-sm text-muted-foreground">No sign-up needed</p>
            </div>
            
            <div className="bg-card rounded-2xl p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Anonymous</h3>
              <p className="text-sm text-muted-foreground">No identity required</p>
            </div>
            
            <div className="bg-card rounded-2xl p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Temporary</h3>
              <p className="text-sm text-muted-foreground">Rooms auto-expire</p>
            </div>
            
            <div className="bg-card rounded-2xl p-5 border border-border text-center animate-fade-in" style={{ animationDelay: "600ms" }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Real-time</h3>
              <p className="text-sm text-muted-foreground">Instant messaging</p>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-muted-foreground text-sm animate-fade-in">
            <p className="font-medium">No accounts. No history. Just chat.</p>
            <p className="mt-1 text-xs opacity-60">Messages disappear after 24 hours of inactivity</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
