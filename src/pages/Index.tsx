import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import CreateSession from "@/components/CreateSession";
import JoinSession from "@/components/JoinSession";
import ChatRoom from "@/components/ChatRoom";

type View = "landing" | "chat";

interface SessionState {
  code: string;
  userName: string;
}

const Index = () => {
  const [view, setView] = useState<View>("landing");
  const [session, setSession] = useState<SessionState | null>(null);

  const handleSessionStart = (code: string, userName: string) => {
    setSession({ code, userName });
    setView("chat");
  };

  const handleLeaveChat = () => {
    setSession(null);
    setView("landing");
  };

  if (view === "chat" && session) {
    return (
      <ChatRoom
        sessionCode={session.code}
        userName={session.userName}
        onLeave={handleLeaveChat}
      />
    );
  }

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
          <CreateSession onSessionCreated={handleSessionStart} />
          <JoinSession onSessionJoined={handleSessionStart} />
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
