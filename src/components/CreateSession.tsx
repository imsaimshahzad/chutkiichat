import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Copy, Check, ArrowRight, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionCard from "./SessionCard";
import { generateSessionCode, generateAnonymousName, createSession } from "@/lib/chatUtils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CreateSession = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState(generateAnonymousName());
  const [editingName, setEditingName] = useState(userName);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    const code = generateSessionCode();
    
    const success = await createSession(code);
    
    if (success) {
      setSessionCode(code);
      toast.success("Your Chutki room is ready! ✨");
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

  const handleNameSave = () => {
    if (editingName.trim()) {
      setUserName(editingName.trim());
      setNameDialogOpen(false);
      toast.success("Name updated!");
    } else {
      toast.error("Please enter a valid name");
    }
  };

  return (
    <SessionCard delay={100}>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">Create a Chutki Room</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Start an ephemeral chat</p>
        </div>
      </div>

      {!sessionCode ? (
      <Button 
          className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base sm:text-lg shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
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
              Start Chutki ✨
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Your Chutki Code</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="font-mono text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-[0.2em] sm:tracking-[0.3em]">
                {sessionCode}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCopy}
                className="shrink-0 hover:bg-primary/10 h-8 w-8 sm:h-10 sm:w-10"
              >
                {copied ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-wa-online" />
                ) : (
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-center py-2 sm:py-3 bg-muted/30 border border-border/50 rounded-lg sm:rounded-xl">
            <p className="text-xs text-muted-foreground mb-0.5 sm:mb-1">You'll chat as</p>
            <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="inline-flex items-center gap-1.5 font-semibold text-primary text-sm sm:text-base hover:underline cursor-pointer"
                  onClick={() => setEditingName(userName)}
                >
                  {userName}
                  <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-gradient-chutki">Change Your Name</DialogTitle>
                  <DialogDescription>
                    Enter a display name for this chat session.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={50}
                    className="h-11"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setNameDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20"
                      onClick={handleNameSave}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Button 
            className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base sm:text-lg shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
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
