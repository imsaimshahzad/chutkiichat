import { useState } from "react";
import { Plus, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SessionCard from "./SessionCard";
import { generateSessionCode, generateAnonymousName, createSession } from "@/lib/chatUtils";
import { toast } from "sonner";

interface CreateSessionProps {
  onSessionCreated: (code: string, userName: string) => void;
}

const CreateSession = ({ onSessionCreated }: CreateSessionProps) => {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userName] = useState(generateAnonymousName());
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    const code = generateSessionCode();
    
    const success = await createSession(code);
    
    if (success) {
      setSessionCode(code);
      toast.success("Session created! Share the code with others.");
    } else {
      toast.error("Failed to create session. Try again.");
    }
    setIsCreating(false);
  };

  const handleCopy = async () => {
    if (sessionCode) {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinChat = () => {
    if (sessionCode) {
      onSessionCreated(sessionCode, userName);
    }
  };

  return (
    <SessionCard delay={100}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/20">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Create Session</h2>
          <p className="text-sm text-muted-foreground">Start a new chat room</p>
        </div>
      </div>

      {!sessionCode ? (
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full"
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create New Session"}
          <Plus className="w-5 h-5" />
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Your session code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-bold text-primary tracking-widest">
                {sessionCode}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-center py-3 bg-secondary/50 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Your identity</p>
            <p className="font-semibold text-accent">{userName}</p>
          </div>

          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={handleJoinChat}
          >
            Enter Chat
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </SessionCard>
  );
};

export default CreateSession;
