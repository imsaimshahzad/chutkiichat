import LandingHero from "@/components/LandingHero";
import CreateSession from "@/components/CreateSession";
import JoinSession from "@/components/JoinSession";

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <LandingHero />

        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <CreateSession />
          <JoinSession />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm animate-fade-in">
          <p>No accounts. No history. Just chat.</p>
          <p className="mt-1 text-xs opacity-60">Messages disappear when you close the tab</p>
        </footer>
      </div>
    </main>
  );
};

export default Index;
