import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SessionCard from "./SessionCard";
import { generateSessionCode, generateAnonymousName, createSession } from "@/lib/chatUtils";
import { toast } from "sonner";

const CreateSession = () => {
  const navigate = useNavigate();
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
      toast.success("Your Chutki room is ready!");
    } else {
      toast.error("Failed to create room. Try again.");
    }
    setIsCreating(false);
  };

  const handleCopy = async () => {
    if (sessionCode) {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinChat = () => {
    if (sessionCode) {
      sessionStorage.setItem(`room-${sessionCode}-user`, userName);
      navigate(`/room/${sessionCode}`);
    }
  };

  return (
    <SessionCard delay={100}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Create a New Chutki</h2>
          <p className="text-sm text-muted-foreground">Start your temporary chat room</p>
        </div>
      </div>

      {!sessionCode ? (
        <Button 
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold text-lg shadow-lg transition-all hover:scale-[1.02]"
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Start Chutki
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="text-center bg-secondary/50 rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-2">Your Chutki Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-4xl font-bold text-gradient-chutki tracking-[0.3em]">
                {sessionCode}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopy}
                className="shrink-0 hover:bg-primary/10"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-primary" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-center py-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">You'll chat as</p>
            <p className="font-semibold text-primary">{userName}</p>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold text-lg shadow-lg transition-all hover:scale-[1.02]"
            onClick={handleJoinChat}
          >
            Enter Room
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </SessionCard>
  );
};

export default CreateSession;
