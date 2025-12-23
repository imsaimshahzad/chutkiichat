import { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionCard from "./SessionCard";
import { generateAnonymousName, joinSession, createSession } from "@/lib/chatUtils";
import { toast } from "sonner";

interface JoinSessionProps {
  onSessionJoined: (code: string, userName: string) => void;
}

const JoinSession = ({ onSessionJoined }: JoinSessionProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = () => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (trimmedCode.length !== 6) {
      toast.error("Please enter a valid 6-character code");
      return;
    }

    setIsLoading(true);
    const userName = generateAnonymousName();

    // Simulate join attempt (in real app, this would validate with server)
    setTimeout(() => {
      // For demo purposes, we'll create the session if it doesn't exist
      // In production, you'd validate against a real backend
      createSession(trimmedCode, userName);
      joinSession(trimmedCode, userName);
      toast.success(`Joined as ${userName}`);
      onSessionJoined(trimmedCode, userName);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <SessionCard delay={200}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-accent/20">
          <Users className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Join Session</h2>
          <p className="text-sm text-muted-foreground">Enter a room code</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={handleKeyDown}
          className="font-mono text-center text-xl tracking-[0.3em] uppercase"
          maxLength={6}
        />

        <Button 
          variant="accent"
          size="lg" 
          className="w-full"
          onClick={handleJoin}
          disabled={code.length !== 6 || isLoading}
        >
          {isLoading ? "Joining..." : "Join Chat"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </SessionCard>
  );
};

export default JoinSession;
