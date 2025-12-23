import { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SessionCard from "./SessionCard";
import NumberKeyboard from "./NumberKeyboard";
import { generateAnonymousName, joinSession, sessionExists } from "@/lib/chatUtils";
import { toast } from "sonner";

interface JoinSessionProps {
  onSessionJoined: (code: string, userName: string) => void;
}

const JoinSession = ({ onSessionJoined }: JoinSessionProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberPress = (num: string) => {
    if (code.length < 4) {
      setCode((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCode("");
  };

  const handleJoin = () => {
    const trimmedCode = code.trim();
    
    if (trimmedCode.length !== 4) {
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    // Check if session exists
    if (!sessionExists(trimmedCode)) {
      toast.error("Session not found. Please check the code.");
      return;
    }

    setIsLoading(true);
    const userName = generateAnonymousName();

    setTimeout(() => {
      joinSession(trimmedCode, userName);
      toast.success(`Joined as ${userName}`);
      onSessionJoined(trimmedCode, userName);
      setIsLoading(false);
    }, 300);
  };

  // Render code display boxes
  const renderCodeDisplay = () => {
    const boxes = [];
    for (let i = 0; i < 4; i++) {
      boxes.push(
        <div
          key={i}
          className={`w-14 h-16 flex items-center justify-center rounded-xl text-3xl font-bold font-mono transition-all duration-200 ${
            code[i]
              ? "bg-accent/20 text-accent border-2 border-accent scale-105"
              : "bg-secondary/50 text-muted-foreground border-2 border-border"
          }`}
        >
          {code[i] || ""}
        </div>
      );
    }
    return boxes;
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
        {/* Code Display */}
        <div className="flex justify-center gap-2">
          {renderCodeDisplay()}
        </div>

        {/* Number Keyboard */}
        <NumberKeyboard
          onNumberPress={handleNumberPress}
          onDelete={handleDelete}
          onClear={handleClear}
        />

        <Button 
          variant="accent"
          size="lg" 
          className="w-full mt-4"
          onClick={handleJoin}
          disabled={code.length !== 4 || isLoading}
        >
          {isLoading ? "Joining..." : "Join Chat"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </SessionCard>
  );
};

export default JoinSession;
