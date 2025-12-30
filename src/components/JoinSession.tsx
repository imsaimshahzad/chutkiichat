import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import SessionCard from "./SessionCard";
import { generateAnonymousName, sessionExists } from "@/lib/chatUtils";
import { toast } from "sonner";

const JoinSession = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCharPress = (char: string) => {
    if (code.length < 6) {
      setCode((prev) => prev + char);
    }
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  const handleJoin = async () => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (trimmedCode.length !== 6) {
      toast.error("Please enter a 6-character code");
      return;
    }

    setIsLoading(true);

    const exists = await sessionExists(trimmedCode);
    
    if (!exists) {
      toast.error("Room not found. Check the code and try again.");
      setIsLoading(false);
      return;
    }

    const userName = generateAnonymousName();
    sessionStorage.setItem(`room-${trimmedCode}-user`, userName);
    
    toast.success(`Joining as ${userName}`);
    navigate(`/room/${trimmedCode}`);
  };

  return (
    <SessionCard delay={200}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Join a Room</h2>
          <p className="text-sm text-muted-foreground">Enter a room code</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Code Display */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 flex items-center justify-center rounded-xl text-2xl font-bold font-mono transition-all duration-200 border-2 ${
                code[i]
                  ? "bg-primary/10 text-primary border-primary shadow-md"
                  : "bg-muted/50 text-muted-foreground border-border"
              }`}
            >
              {code[i] || ""}
            </div>
          ))}
        </div>

        {/* Character Pad - Numbers and Letters */}
        <div className="grid grid-cols-6 gap-1.5">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '2', '3', '4', '5', '6', '7', '8', '9'].map((char) => (
            <Button
              key={char}
              variant="secondary"
              className="h-10 text-sm font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleCharPress(char)}
            >
              {char}
            </Button>
          ))}
          <Button
            variant="secondary"
            className="h-10 text-sm font-semibold rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors col-span-2"
            onClick={() => setCode("")}
          >
            Clear
          </Button>
          <Button
            variant="secondary"
            className="h-10 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors col-span-2"
            onClick={handleDelete}
          >
            <Delete className="w-5 h-5" />
          </Button>
        </div>

        <Button 
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-accent to-primary hover:opacity-90 text-white font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          onClick={handleJoin}
          disabled={code.length !== 6 || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join Room
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </SessionCard>
  );
};

export default JoinSession;
