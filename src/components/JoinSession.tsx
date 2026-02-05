import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Delete, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionCard from "./SessionCard";
import { generateAnonymousName, sessionExists } from "@/lib/chatUtils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const JoinSession = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState(generateAnonymousName());
  const [editingName, setEditingName] = useState(userName);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [showNameSection, setShowNameSection] = useState(false);

  const handleNumberPress = (num: string) => {
    if (code.length < 4) {
      const newCode = code + num;
      setCode(newCode);
      if (newCode.length === 4) {
        setShowNameSection(true);
      }
    }
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  const handleJoin = async () => {
    const trimmedCode = code.trim();
    
    if (trimmedCode.length !== 4) {
      toast.error("Please enter a 4-digit code");
      return;
    }

    setIsLoading(true);

    const exists = await sessionExists(trimmedCode);
    
    if (!exists) {
      toast.error("Room not found. Check the code and try again.");
      setIsLoading(false);
      return;
    }

    sessionStorage.setItem(`room-${trimmedCode}-user`, userName);
    
    toast.success(`Joining as ${userName}`);
    navigate(`/room/${trimmedCode}`);
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
    <SessionCard delay={200}>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent via-primary to-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
          <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">Join a Chutki Room</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Enter your 4-digit code</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Code Display */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-16 sm:w-16 sm:h-20 flex items-center justify-center rounded-xl sm:rounded-2xl text-2xl sm:text-3xl font-bold font-mono transition-all duration-200 border-2 ${
                code[i]
                  ? "bg-primary/10 text-primary border-primary shadow-lg shadow-primary/20"
                  : "bg-muted/30 text-muted-foreground border-border/50"
              }`}
            >
              {code[i] || ""}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="secondary"
              className="h-11 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg sm:rounded-xl hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
              onClick={() => handleNumberPress(num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="secondary"
            className="h-11 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg sm:rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-95"
            onClick={() => {
              setCode("");
              setShowNameSection(false);
            }}
          >
            C
          </Button>
          <Button
            variant="secondary"
            className="h-11 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg sm:rounded-xl hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
            onClick={() => handleNumberPress("0")}
          >
            0
          </Button>
          <Button
            variant="secondary"
            className="h-11 sm:h-14 rounded-lg sm:rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-95"
            onClick={handleDelete}
          >
            <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Name Section - shows when code is complete */}
        {showNameSection && code.length === 4 && (
          <div className="text-center py-2 sm:py-3 bg-muted/30 border border-border/50 rounded-lg sm:rounded-xl animate-fade-in">
            <p className="text-xs text-muted-foreground mb-0.5 sm:mb-1">You'll join as</p>
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
        )}

        <Button 
          className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/80 to-primary hover:from-primary/70 hover:to-primary/90 text-primary-foreground font-semibold text-base sm:text-lg shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
          onClick={handleJoin}
          disabled={code.length !== 4 || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Join Chutki
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </SessionCard>
  );
};

export default JoinSession;
